import { useContext, useEffect, useRef, useState } from 'react';
import { Scroll } from '../lib/ScrollContext';
import { attachHls } from '../lib/hls';
import { debugFlags } from '../lib/debugFlags';

/**
 * Full-screen (100vh) preview panel. Plays a tiny looping preview
 * clip while in view; clicking anywhere opens the full video in a
 * modal via the `onOpen` callback.
 *
 *   previewSrc — small looping preview (e.g. /loops/hero.mp4)
 *   fullSrc    — full-quality file to play in the modal on click
 *   lazy       — withhold the preview src until panel is near the viewport
 *   onOpen     — called with fullSrc when the panel is clicked
 *
 * IntersectionObserver gates play/pause/load so off-screen panels
 * don't hold decoder slots.
 */
export default function VideoPanel({ previewSrc, fullSrc, poster, lazy = false, onOpen }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const unloadTimerRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const { vh } = useContext(Scroll); // subscribes to scroll re-renders

  const [shouldLoad, setShouldLoad] = useState(false);
  const [inView, setInView] = useState(false);

  // ── Observers: load when near, play when in view ─────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      setInView(true);
      return undefined;
    }

    const findScrollRoot = (node) => {
      let n = node?.parentElement;
      while (n && n !== document.body) {
        const style = window.getComputedStyle(n);
        if (/(auto|scroll)/.test(style.overflowY)) return n;
        n = n.parentElement;
      }
      return null;
    };

    const root = findScrollRoot(el);
    const UNLOAD_DELAY_MS = 1500;

    const loadObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (unloadTimerRef.current) {
              clearTimeout(unloadTimerRef.current);
              unloadTimerRef.current = null;
            }
            setShouldLoad(true);
          } else {
            if (unloadTimerRef.current) clearTimeout(unloadTimerRef.current);
            unloadTimerRef.current = setTimeout(() => {
              setShouldLoad(false);
              unloadTimerRef.current = null;
            }, UNLOAD_DELAY_MS);
          }
        }
      },
      { root, rootMargin: '75% 0px', threshold: 0 }
    );

    const playObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          setInView(e.intersectionRatio >= 0.5);
        }
      },
      { root, threshold: [0, 0.5, 1] }
    );

    loadObserver.observe(el);
    playObserver.observe(el);
    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
      if (unloadTimerRef.current) {
        clearTimeout(unloadTimerRef.current);
        unloadTimerRef.current = null;
      }
    };
  }, []);

  // ── Attach / detach preview loop ──────────────────────────────────────
  useEffect(() => {
    if (debugFlags.noVideos) return attachHls(videoRef.current, null);
    return attachHls(videoRef.current, shouldLoad ? previewSrc : null);
  }, [shouldLoad, previewSrc]);

  // ── Drive play/pause from inView ─────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && shouldLoad) {
      v.play().catch(() => {});
    } else {
      v.pause();
      if (!inView) {
        try { v.currentTime = 0; } catch (e) { /* ignore */ }
      }
    }
  }, [inView, shouldLoad]);

  const handleClick = () => {
    if (onOpen && fullSrc) onOpen(fullSrc);
  };

  return (
    <section
      ref={wrapperRef}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Play full video"
      data-interactive=""
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        background: '#000',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </section>
  );
}
