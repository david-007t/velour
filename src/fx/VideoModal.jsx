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
export default function VideoModal({ src, open, onClose }) {
  const videoRef = useRef(null);

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
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
