/**
 * Attach an .m3u8 source to a <video> element using hls.js where
 * needed. Safari plays HLS natively so just sets src; Chrome/Firefox
 * need hls.js. Returns a cleanup function to release the player.
 *
 * Pass null/undefined as `src` to fully detach the source and release
 * the decoder (used when a panel scrolls far away).
 */
let Hls = null;
const loadHls = async () => {
  if (Hls) return Hls;
  const mod = await import('hls.js');
  Hls = mod.default;
  return Hls;
};

export function attachHls(videoEl, src, { onError } = {}) {
  if (!videoEl) return () => {};

  // Detach + release any prior source
  const detach = () => {
    if (videoEl._hlsInstance) {
      try { videoEl._hlsInstance.destroy(); } catch (e) { /* ignore */ }
      videoEl._hlsInstance = null;
    }
    try {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
    } catch (e) { /* ignore */ }
  };

  if (!src) {
    detach();
    return () => {};
  }

  detach();

  const isHls = /\.m3u8(\?|$)/i.test(src);

  // Plain mp4 path
  if (!isHls) {
    videoEl.src = src;
    return detach;
  }

  // Native HLS (Safari)
  if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.src = src;
    return detach;
  }

  // hls.js path (Chrome/Firefox/etc.)
  let disposed = false;
  loadHls().then((HlsLib) => {
    if (disposed) return;
    if (!HlsLib.isSupported()) {
      // Fall back to native — best effort
      videoEl.src = src;
      return;
    }
    const hls = new HlsLib({
      // Tight buffer to keep memory low; hls.js will fetch as needed
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      backBufferLength: 4,
    });
    hls.loadSource(src);
    hls.attachMedia(videoEl);
    if (onError) {
      hls.on(HlsLib.Events.ERROR, (_evt, data) => onError(data));
    }
    videoEl._hlsInstance = hls;
  });

  return () => {
    disposed = true;
    detach();
  };
}
