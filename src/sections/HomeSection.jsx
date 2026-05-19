import { useContext, useEffect, useState } from 'react';
import { Scroll } from '../lib/ScrollContext';
import { clamp01, easeOutCubic } from '../lib/easing';
import AtmosphericHero from '../fx/AtmosphericHero';

// Home section is 200vh tall — the extra 100vh gives room for a smooth exit
// animation that overlaps cleanly with Speed's smear entry.
const HOME_VH = 2.0; // multiplier on viewport height

export default function HomeSection({ sectionRef }) {
  const { y, vh } = useContext(Scroll);
  const [stage, setStage] = useState(0); // 0: video, 1: wordmark, 2: tagline, 3: cue

  // Four-stage entrance choreography: video → 800ms → wordmark → 1600ms → tagline → 1600ms → cue
  useEffect(() => {
    const ts = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 800 + 1200 + 400),
      setTimeout(() => setStage(3), 800 + 1200 + 400 + 1000 + 600),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  // Acceleration: runs from 0 to 1 over the full section height
  // so the hero is almost gone exactly when Speed begins
  const accel = clamp01(y / (vh * HOME_VH * 0.9));
  const stretchX = 1 + accel * 2.6;
  const blurPx = accel * 28;

  // Hero opacity: starts dropping at accel=0.5, zero at accel=1.0
  // This means the hero is still 50% visible when the user is halfway through scrolling Home
  const heroOpacity = 1 - clamp01((accel - 0.45) / 0.55);

  // Wordmark / tagline fade out faster so they clear before the smear
  const textOpacity = Math.max(0, 1 - accel * 2.2);

  return (
    <section
      ref={sectionRef}
      data-section="home"
      style={{
        position: 'relative',
        height: `${HOME_VH * 100}vh`,
        width: '100%',
      }}
    >
      {/* Sticky hero — pins to top of viewport for the full section scroll */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Atmospheric hero — stretches and blurs as user scrolls */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scaleX(${stretchX})`,
            transformOrigin: 'center',
            filter: `blur(${blurPx}px)`,
            opacity: heroOpacity,
            transition: 'none',
            willChange: 'transform, filter, opacity',
          }}
        >
          <AtmosphericHero />
        </div>

        {/* Wordmark — centered */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, calc(-50% + ${stage >= 1 ? 0 : 18}px))`,
            textAlign: 'center',
            opacity: stage >= 1 ? textOpacity : 0,
            transition: 'opacity 1200ms cubic-bezier(.2,.6,.2,1), transform 1200ms cubic-bezier(.2,.6,.2,1)',
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(72px, 13vw, 220px)',
              lineHeight: 0.9,
              letterSpacing: '-0.025em',
              margin: 0,
              fontWeight: 400,
              color: '#F5F2EC',
            }}
          >
            Velour
          </h1>
        </div>

        {/* Tagline */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 'calc(50% + clamp(50px, 9vw, 130px))',
            transform: 'translateX(-50%)',
            opacity: stage >= 2 ? textOpacity : 0,
            transition: 'opacity 1000ms cubic-bezier(.2,.6,.2,1)',
            zIndex: 2,
            whiteSpace: 'nowrap',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.72)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            TBD
          </p>
        </div>

        {/* Scroll cue */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '5vh',
            transform: 'translateX(-50%)',
            opacity: stage >= 3 ? Math.max(0, 1 - accel * 3) : 0,
            transition: 'opacity 900ms cubic-bezier(.2,.6,.2,1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 1,
              height: 56,
              background: 'linear-gradient(to bottom, transparent, rgba(245,242,236,0.5), transparent)',
              animation: 'scroll-cue 2.4s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.55)',
            }}
          >
            SCROLL
          </span>
          <style>{`
            @keyframes scroll-cue {
              0%, 100% { transform: translateY(-6px); opacity: 0.6; }
              50% { transform: translateY(6px); opacity: 1; }
            }
          `}</style>
        </div>

        {/* Top-right brand marker */}
        <div
          style={{
            position: 'absolute',
            top: '4vh',
            right: '5vw',
            opacity: stage >= 3 ? Math.max(0, 1 - accel * 3) : 0,
            transition: 'opacity 900ms ease',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.45)',
            }}
          >
            VELOUR · STUDIO · MMXXVI
          </span>
        </div>

        {/* Bottom-left section index */}
        <div
          style={{
            position: 'absolute',
            left: '5vw',
            bottom: '5vh',
            opacity: stage >= 3 ? Math.max(0, 1 - accel * 3) : 0,
            transition: 'opacity 900ms ease',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.45)',
            }}
          >
            01 — HOME
          </span>
        </div>
      </div>
    </section>
  );
}
