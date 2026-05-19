import { useId } from 'react';

// Simplified: one central ellipse, very slow drift (50s+), displacement scale 80,
// turbulence baseFrequency animation 60s. Reads as "held shot" — drift, not motion.
export default function AtmosphericHero() {
  const id = useId();
  const turbId = `turb-${id}`;
  const gradId = `grad-${id}`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#0A0908',
      }}
    >
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <filter id={turbId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.012"
              numOctaves="3"
              seed={5}
            >
              <animate
                attributeName="baseFrequency"
                dur="60s"
                values="0.008 0.012; 0.010 0.009; 0.007 0.013; 0.008 0.012"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale={80} />
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <radialGradient id={gradId} cx="50%" cy="52%" r="60%">
            <stop offset="0%" stopColor="#B0A48C" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#5C5040" stopOpacity="0.65" />
            <stop offset="75%" stopColor="#1E1A14" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0A0908" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette-vh" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="#0A0908" stopOpacity="0" />
            <stop offset="100%" stopColor="#0A0908" stopOpacity="0.88" />
          </radialGradient>
        </defs>

        {/* Base dark wash */}
        <rect width="1000" height="1000" fill="#0A0908" />

        {/* Single central smoke ellipse — slow drift, almost still */}
        <g filter={`url(#${turbId})`}>
          <ellipse cx="500" cy="520" rx="540" ry="400" fill={`url(#${gradId})`}>
            <animate
              attributeName="cx"
              dur="52s"
              values="500;470;530;500"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              dur="58s"
              values="520;545;498;520"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* Soft vignette */}
        <rect width="1000" height="1000" fill="url(#vignette-vh)" pointerEvents="none" />
      </svg>
    </div>
  );
}
