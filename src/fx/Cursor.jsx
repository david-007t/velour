import { useEffect, useRef } from 'react';

export default function Cursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const stateRef = useRef({ x: -100, y: -100, tx: -100, ty: -100, hovered: false });

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) {
      if (ringRef.current) ringRef.current.style.display = 'none';
      if (dotRef.current) dotRef.current.style.display = 'none';
      return undefined;
    }

    const onMove = (e) => {
      stateRef.current.tx = e.clientX;
      stateRef.current.ty = e.clientY;
      const el = e.target;
      const interactive = !!(
        el &&
        el.closest &&
        el.closest('a, button, [data-interactive], input, [role="button"], [data-tile]')
      );
      stateRef.current.hovered = interactive;
    };
    window.addEventListener('mousemove', onMove);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const s = stateRef.current;
      s.x += (s.tx - s.x) * 0.5;
      s.y += (s.ty - s.y) * 0.5;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%) scale(${s.hovered ? 1.6 : 1})`;
        ringRef.current.style.borderColor = s.hovered
          ? 'rgba(245,242,236,1)'
          : 'rgba(245,242,236,0.7)';
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${s.tx}px, ${s.ty}px, 0) translate(-50%, -50%) scale(${s.hovered ? 0 : 1})`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid rgba(245,242,236,0.7)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'border-color 240ms ease, transform 240ms cubic-bezier(.2,.6,.2,1)',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: '#F5F2EC',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
          willChange: 'transform',
          transition: 'transform 200ms cubic-bezier(.2,.6,.2,1)',
        }}
      />
    </>
  );
}
