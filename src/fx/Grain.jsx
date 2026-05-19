import { useEffect, useRef } from 'react';

export default function Grain({ opacity = 0.08, frames = 8, size = 256, fps = 24 }) {
  const canvasRef = useRef(null);
  const frameIdx = useRef(0);
  const noiseFramesRef = useRef([]);

  useEffect(() => {
    const fs = [];
    for (let f = 0; f < frames; f++) {
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const ctx = off.getContext('2d');
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      fs.push(off);
    }
    noiseFramesRef.current = fs;

    const cnv = canvasRef.current;
    if (!cnv) return undefined;
    const resize = () => {
      cnv.width = cnv.clientWidth * window.devicePixelRatio;
      cnv.height = cnv.clientHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = 0;
    const interval = 1000 / fps;
    const draw = (t) => {
      raf = requestAnimationFrame(draw);
      if (t - last < interval) return;
      last = t;
      frameIdx.current = (frameIdx.current + 1) % frames;
      const c = cnv.getContext('2d');
      const tile = noiseFramesRef.current[frameIdx.current];
      c.clearRect(0, 0, cnv.width, cnv.height);
      const ox = (Math.random() * size) | 0;
      const oy = (Math.random() * size) | 0;
      const pattern = c.createPattern(tile, 'repeat');
      c.fillStyle = pattern;
      c.save();
      c.translate(-ox, -oy);
      c.fillRect(0, 0, cnv.width + size, cnv.height + size);
      c.restore();
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [frames, size, fps]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
        mixBlendMode: 'overlay',
        zIndex: 90,
      }}
    />
  );
}
