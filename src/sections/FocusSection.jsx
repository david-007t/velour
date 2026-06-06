import { useContext, useLayoutEffect, useState } from 'react';
import { Scroll } from '../lib/ScrollContext';
import { clamp01, easeOutCubic } from '../lib/easing';
import PlaceholderMedia from '../fx/PlaceholderMedia';

const FOCUS_FRAMES = [
  { label: 'juice',       seed: 51,  kind: 'video', src: '/focus.mp4' },
  { label: 'yomi-wunmi',  seed: 64,  kind: 'video', src: '/yomi-wunmi.mp4' },
  { label: 'p2w-arcana',  seed: 73,  kind: 'video', src: '/p2w-arcana.mp4', lazy: true },
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
                <PlaceholderMedia seed={f.seed} label={f.label} kind={f.kind} src={f.src} lazy={f.lazy} dim={0.95} />
              </div>
            );
          })}

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
