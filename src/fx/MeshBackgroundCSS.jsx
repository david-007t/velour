/**
 * Pure-CSS Mesh approximation. Four large radial gradients layered
 * over a near-black base, each on its own slow keyframe drift —
 * gives ~80% of the liquid-Mesh feel with ~0% of the GPU cost
 * (no WebGL, no per-frame shader).
 */
export default function MeshBackgroundCSS() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Base wash */}
      <div className="mesh-css-base" />
      {/* Three drifting blobs */}
      <div className="mesh-css-blob mesh-css-blob--a" />
      <div className="mesh-css-blob mesh-css-blob--b" />
      <div className="mesh-css-blob mesh-css-blob--c" />

      <style>{`
        .mesh-css-base {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 25%, #2a2a2a 0%, transparent 55%),
            radial-gradient(ellipse at 75% 70%, #1f1f1f 0%, transparent 60%),
            #050505;
        }
        .mesh-css-blob {
          position: absolute;
          width: 60vmax;
          height: 60vmax;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
          mix-blend-mode: screen;
        }
        .mesh-css-blob--a {
          background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%);
          top: -20vmax;
          left: -10vmax;
          animation: mesh-drift-a 22s ease-in-out infinite;
        }
        .mesh-css-blob--b {
          background: radial-gradient(circle, rgba(220,220,220,0.10) 0%, rgba(220,220,220,0) 65%);
          top: 30vmax;
          left: 40vmax;
          animation: mesh-drift-b 28s ease-in-out infinite;
        }
        .mesh-css-blob--c {
          background: radial-gradient(circle, rgba(180,180,180,0.08) 0%, rgba(180,180,180,0) 70%);
          top: -10vmax;
          left: 50vmax;
          animation: mesh-drift-c 34s ease-in-out infinite;
        }
        @keyframes mesh-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(15vmax, 20vmax) scale(1.1); }
        }
        @keyframes mesh-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-20vmax, -15vmax) scale(0.95); }
        }
        @keyframes mesh-drift-c {
          0%, 100% { transform: translate(0, 0) scale(1.05); }
          50%      { transform: translate(-10vmax, 25vmax) scale(0.9); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mesh-css-blob { animation: none; }
        }
      `}</style>
    </div>
  );
}
