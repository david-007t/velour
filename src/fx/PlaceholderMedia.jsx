import { useMemo } from 'react';
import LazyVideo from './LazyVideo';

export default function PlaceholderMedia({ seed = 0, label = '', kind = 'video', dim = 1, src = null, lazy = false }) {
  if (src) {
    const VideoTag = lazy ? LazyVideo : 'video';
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0A0908' }}>
        <VideoTag
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload={lazy ? undefined : 'auto'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  }

  const rand = useMemo(() => {
    let s = seed + 1;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }, [seed]);

  const tone = 40 + Math.floor(rand() * 30);
  const hi = 120 + Math.floor(rand() * 60);
  const x1 = 20 + rand() * 60;
  const y1 = 20 + rand() * 60;
  const x2 = 20 + rand() * 60;
  const y2 = 20 + rand() * 60;
  const dur1 = 12 + rand() * 8;
  const dur2 = 14 + rand() * 10;
  const drift1x = (rand() - 0.5) * 60;
  const drift1y = (rand() - 0.5) * 60;
  const drift2x = (rand() - 0.5) * 80;
  const drift2y = (rand() - 0.5) * 50;

  const toneHex = tone.toString(16).padStart(2, '0');
  const toneDimHex = Math.max(0, tone - 4)
    .toString(16)
    .padStart(2, '0');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: `#${toneHex}${toneHex}${toneDimHex}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(circle at ${x1}% ${y1}%, rgba(${hi},${hi - 10},${hi - 20},${0.85 * dim}) 0%, transparent 45%), radial-gradient(circle at ${x2}% ${y2}%, rgba(${hi - 30},${hi - 25},${hi - 30},${0.65 * dim}) 0%, transparent 50%)`,
          animation: `drift-pm-${seed} ${dur1}s ease-in-out infinite alternate`,
          filter: 'blur(8px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '-30%',
          background: `radial-gradient(ellipse at ${100 - x1}% ${100 - y1}%, rgba(${tone + 20},${tone + 15},${tone + 10},${0.5 * dim}) 0%, transparent 55%)`,
          animation: `drift2-pm-${seed} ${dur2}s ease-in-out infinite alternate`,
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(10,9,8,0.7) 100%)',
        }}
      />
      <style>{`
        @keyframes drift-pm-${seed} {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(${drift1x}px, ${drift1y}px) scale(1.15); }
        }
        @keyframes drift2-pm-${seed} {
          0% { transform: translate(0,0) scale(1.1); }
          100% { transform: translate(${drift2x}px, ${drift2y}px) scale(1); }
        }
      `}</style>
      {label && (
        <div
          style={{
            position: 'absolute',
            left: 14,
            bottom: 12,
            fontFamily: 'var(--mono)',
            fontSize: 9.5,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(245,242,236,0.78)',
            mixBlendMode: 'difference',
          }}
        >
          [{label} — placeholder]
        </div>
      )}
      {kind === 'video' && (
        <div
          style={{
            position: 'absolute',
            right: 14,
            bottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--mono)',
            fontSize: 9,
            letterSpacing: '0.2em',
            color: 'rgba(245,242,236,0.45)',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#F5F2EC',
              opacity: 0.7,
              animation: 'rec-blink 1.6s ease-in-out infinite',
            }}
          />
          REC
          <style>{`@keyframes rec-blink { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.85; } }`}</style>
        </div>
      )}
    </div>
  );
}
