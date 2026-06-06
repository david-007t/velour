import { useContext, useEffect, useState } from 'react';
import { Scroll } from '../lib/ScrollContext';
import { clamp01 } from '../lib/easing';
import MeshBackground from '../fx/MeshBackground';

// Crossfade ranges (fraction of one viewport of scroll).
// Non-overlapping so Veloure is fully gone BEFORE Split begins to show.
const HOME_OUT_START = 0.04;
const HOME_OUT_END   = 0.28;
const SPLIT_IN_START = 0.08;
const SPLIT_IN_END   = 0.72;

// Dramatic reveal: triggers 400ms after the loader finishes leaving.
const REVEAL_DELAY_MS = 400;
const REVEAL_TRANSITION_MS = 1600;

export default function HomeSection({
  sectionRef,
  loaderDone = true,
  pathSelected = false,
  children,
}) {
  const { y, vh } = useContext(Scroll);
  const progress = vh ? clamp01(y / vh) : 0;

  // Scroll-driven zoom + fade — kept from previous implementation.
  const zoomScale = 1 + progress * 2.25;
  const homeOpacity = 1 - clamp01((progress - HOME_OUT_START) / (HOME_OUT_END - HOME_OUT_START));
  const splitOpacity = clamp01((progress - SPLIT_IN_START) / (SPLIT_IN_END - SPLIT_IN_START));
  const blurPx = progress * 10;

  // Dramatic reveal (one-shot on mount, after loader leaves).
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!loaderDone) return undefined;
    const t = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [loaderDone]);

  return (
    <section
      ref={sectionRef}
      data-section="home"
      style={{
        position: 'relative',
        height: '200vh',
        width: '100%',
        background: '#0A0908',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: '#0A0908',
        }}
      >
        {/* SplitScreenEntry — always rendered; fades in based on scroll */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            opacity: pathSelected ? 1 : splitOpacity,
            pointerEvents: pathSelected || splitOpacity > 0.94 ? 'auto' : 'none',
          }}
        >
          {children}
        </div>

        {/* Home layer — Mesh bg + Veloure wordmark.
            Fully unmounted once a path is selected so the WebGL shader
            stops eating GPU while the chosen side fills the screen. */}
        {!pathSelected && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              opacity: homeOpacity,
              transform: `scale(${zoomScale})`,
              transformOrigin: '50% 50%',
              transition: 'none',
              pointerEvents: 'none',
              willChange: 'opacity, transform',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                filter: `blur(${blurPx}px)`,
                transition: 'filter 180ms linear',
              }}
            >
              <MeshBackground />
            </div>

            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 4,
              }}
            >
              <h1
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(36px, 5.5vw, 90px)',
                  lineHeight: 0.9,
                  letterSpacing: '0',
                  margin: 0,
                  fontWeight: 400,
                  color: '#F5F2EC',
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? 'scale(1)' : 'scale(1.4)',
                  filter: revealed ? 'blur(0px)' : 'blur(20px)',
                  transition: `opacity ${REVEAL_TRANSITION_MS}ms cubic-bezier(.16,1,.3,1), transform ${REVEAL_TRANSITION_MS}ms cubic-bezier(.16,1,.3,1), filter ${REVEAL_TRANSITION_MS}ms cubic-bezier(.16,1,.3,1)`,
                  willChange: 'opacity, transform, filter',
                }}
              >
                Veloure
              </h1>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
