import { useEffect, useState } from 'react';

/**
 * On-screen FPS + JS heap meter. Activate with ?debug=1.
 * Updates twice per second so the readout is human-readable.
 */
export default function PerfHUD() {
  const [stats, setStats] = useState({ fps: 0, heapMB: null });

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let lastSample = performance.now();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      frames += 1;
      const now = performance.now();
      const elapsed = now - lastSample;
      if (elapsed >= 500) {
        const fps = Math.round((frames * 1000) / elapsed);
        const mem = performance.memory;
        const heapMB = mem ? Math.round(mem.usedJSHeapSize / (1024 * 1024)) : null;
        setStats({ fps, heapMB });
        frames = 0;
        lastSample = now;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 99999,
        padding: '6px 10px',
        background: 'rgba(0,0,0,0.7)',
        color: '#0f8',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        lineHeight: 1.4,
        borderRadius: 4,
        pointerEvents: 'none',
        whiteSpace: 'pre',
      }}
    >
      {`FPS  ${String(stats.fps).padStart(3, ' ')}\nHEAP ${stats.heapMB ?? '—'} MB`}
    </div>
  );
}
