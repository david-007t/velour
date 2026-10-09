import { useEffect, useRef } from 'react';

/**
 * Full-screen modal that plays a single video with native controls
 * and audio. Closes on Escape, on backdrop click, or via the X button.
 *
 *   <VideoModal src="/hero.mp4" open onClose={...} />
 *
 * The video is only mounted when `open` is true, so no decoder is
 * allocated until the user actually opens it.
 */
export default function VideoModal({ src, poster, label, open, onClose }) {
  const videoRef = useRef(null);
  const closeRef = useRef(null);
  // Callers pass inline closures; keep the latest without re-running
  // the open/close effect (which would steal focus on every render).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close on Escape; keep Tab inside the dialog; lock body scroll
  // while open; hand focus back to whatever opened it on close.
  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        // Capture phase + stop so the split-screen's own Escape
        // handler doesn't also collapse the chosen path.
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key === 'Tab') {
        const items = [videoRef.current, closeRef.current].filter(Boolean);
        const i = items.indexOf(document.activeElement);
        e.preventDefault();
        const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
        items[next].focus();
      }
    };
    window.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label || 'Video player'}
      onClick={(e) => {
        // close when clicking the backdrop (but not when clicking the video itself)
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 48px)',
        cursor: 'pointer',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        controls
        playsInline
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          display: 'block',
          background: '#000',
          cursor: 'default',
        }}
        onClick={(e) => e.stopPropagation()}
      />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        data-interactive=""
        style={{
          position: 'absolute',
          top: 'clamp(16px, 3vw, 32px)',
          right: 'clamp(16px, 3vw, 32px)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(245, 242, 236, 0.4)',
          background: 'rgba(0, 0, 0, 0.5)',
          color: '#F5F2EC',
          fontSize: 18,
          lineHeight: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        ×
      </button>
    </div>
  );
}
