import { useRef, useState } from 'react';

/**
 * Plays `src` once, then on `ended` switches to `next` and loops it.
 * Used for clips that should feel like one continuous video (e.g. drone
 * descending → kid playing soccer).
 */
export default function PairedVideo({ src, next, ...videoProps }) {
  const ref = useRef(null);
  const [stage, setStage] = useState(0); // 0 = first clip, 1 = second clip

  const handleEnded = () => {
    if (stage === 0) setStage(1);
  };

  const currentSrc = stage === 0 ? src : next;
  const shouldLoop = stage === 1;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0A0908' }}>
      <video
        ref={ref}
        key={stage}
        src={currentSrc}
        autoPlay
        muted
        playsInline
        loop={shouldLoop}
        preload="auto"
        onEnded={handleEnded}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        {...videoProps}
      />
    </div>
  );
}
