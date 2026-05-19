import { useContext, useLayoutEffect, useState } from 'react';
import { Scroll } from '../lib/ScrollContext';
import { clamp01, easeOutCubic } from '../lib/easing';
import PlaceholderMedia from '../fx/PlaceholderMedia';

const FOCUS_FRAMES = [
  { label: 'Inez — 35mm, no.4',    seed: 51,  kind: 'still' },
  { label: 'Atelier no.12 / slow', seed: 64,  kind: 'video' },
  { label: 'Light study — 04:11',  seed: 73,  kind: 'still' },
  { label: 'Margot, looking away', seed: 89,  kind: 'still' },
  { label: 'Hands / cloth / silk', seed: 104, kind: 'video' },
  { label: 'Last light, Lake Como', seed: 121, kind: 'still' },
];

const PER_FRAME_VH = 1.2;
const LEAD_VH      = 0.6;
const TAIL_VH      = 0.8;
const SECTION_VH   = LEAD_VH + FOCUS_FRAMES.length * PER_FRAME_VH + TAIL_VH;

export default function FocusSection({ sectionRef, showCounter }) {
  const { y, vh } = useContext(Scroll);
  const [sectionTop, setSectionTop] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      if (sectionRef.current) setSectionTop(sectionRef.current.offsetTop);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [sectionRef]);

  const localY   = y - sectionTop;
  const totalH   = vh * SECTION_VH;
  const overall  = clamp01(localY / totalH);

  // Active frame
  const frameSpan = vh * PER_FRAME_VH;
  const leadOffset = vh * LEAD_VH;
  const frameY    = Math.max(0, localY - leadOffset);
  const activeIndex   = Math.min(FOCUS_FRAMES.length - 1, Math.floor(frameY / frameSpan));
  const intraProgress = clamp01((frameY % frameSpan) / frameSpan);

  // Enhanced punch-in from Speed: scales from 1.8 → 1.0, blur 22px → 0
  // Entry range extended for a more dramatic punch
  const entryProgress = clamp01((localY + vh * 0.4) / (vh * 0.7));
  const punchScale    = 1.8 - 0.8 * easeOutCubic(entryProgress);
  const punchBlur     = (1 - easeOutCubic(entryProgress)) * 22;

  return (
    <section
      ref={sectionRef}
      data-section="focus"
      style={{
        position: 'relative',
        height: `${SECTION_VH * 100}vh`,
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
        }}
      >
        {/* Section label */}
        <div
          style={{
            position: 'absolute',
            top: '5vh',
            left: '5vw',
            zIndex: 3,
            opacity: entryProgress,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.5)',
            }}
          >
            03 — FOCUS
          </div>
        </div>

        {/* Frame stack — punch scale + blur applied here */}
        <div
          style={{
            position: 'absolute',
            inset: '14vh 12vw',
            transform: `scale(${punchScale})`,
            filter: `blur(${punchBlur}px)`,
            transformOrigin: 'center',
            willChange: 'transform, filter',
          }}
        >
          {FOCUS_FRAMES.map((f, i) => {
            let opacity;
            if (i === activeIndex) {
              opacity = clamp01(intraProgress * 3);
              if (intraProgress > 0.7) {
                opacity = 1 - ((intraProgress - 0.7) / 0.3) * 0.3;
              }
              opacity = Math.max(opacity, 0.7);
            } else if (i === activeIndex + 1) {
              opacity = clamp01((intraProgress - 0.6) / 0.4);
            } else {
              opacity = 0;
            }
            if (i === 0 && activeIndex === 0) {
              opacity = Math.max(
                opacity,
                1 - clamp01((intraProgress - 0.7) / 0.3) * 0.3
              );
            }

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity,
                  transition: 'opacity 240ms cubic-bezier(.2,.6,.2,1)',
                }}
              >
                <PlaceholderMedia seed={f.seed} label={f.label} kind={f.kind} dim={0.95} />
              </div>
            );
          })}

          {/* Aperture corner marks */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: entryProgress * 0.6,
            }}
          >
            <ApertureMarks />
          </div>
        </div>

        {/* Frame counter */}
        {showCounter && (
          <div
            style={{
              position: 'absolute',
              right: '5vw',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: entryProgress,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 4,
              zIndex: 3,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(245,242,236,0.45)',
              }}
            >
              FRAME
            </div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 52,
                color: 'rgba(245,242,236,0.92)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(activeIndex + 1).padStart(2, '0')}
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: 'rgba(245,242,236,0.4)',
                letterSpacing: '0.18em',
              }}
            >
              / {String(FOCUS_FRAMES.length).padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Caption */}
        <div
          style={{
            position: 'absolute',
            left: '12vw',
            bottom: '7vh',
            opacity: entryProgress,
            zIndex: 3,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.4)',
            }}
          >
            CAPTION
          </div>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'rgba(245,242,236,0.82)',
              marginTop: 6,
              letterSpacing: '0.04em',
            }}
          >
            {FOCUS_FRAMES[activeIndex].label}
          </div>
        </div>

        {/* End-of-section fade to black */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: '#0A0908',
            opacity: clamp01((overall - 0.88) / 0.12),
            zIndex: 4,
          }}
        />
      </div>
    </section>
  );
}

function ApertureMarks() {
  const Tick = ({ style }) => (
    <div style={{ position: 'absolute', width: 22, height: 22, ...style }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 22,
          height: 1,
          background: 'rgba(245,242,236,0.4)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1,
          height: 22,
          background: 'rgba(245,242,236,0.4)',
        }}
      />
    </div>
  );
  return (
    <>
      <Tick style={{ top: 16, left: 16 }} />
      <Tick style={{ top: 16, right: 16, transform: 'scaleX(-1)' }} />
      <Tick style={{ bottom: 16, left: 16, transform: 'scaleY(-1)' }} />
      <Tick style={{ bottom: 16, right: 16, transform: 'scale(-1,-1)' }} />
    </>
  );
}
