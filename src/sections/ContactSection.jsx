import { useContext, useLayoutEffect, useState } from 'react';
import { Scroll } from '../lib/ScrollContext';
import { clamp01 } from '../lib/easing';

export default function ContactSection({ sectionRef }) {
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

  const localY       = y - sectionTop;
  const entryProgress = clamp01(localY / (vh * 0.5));

  return (
    <section
      ref={sectionRef}
      data-section="contact"
      style={{
        position: 'relative',
        height: '100vh',
        background: '#0A0908',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {/* END · CREDITS */}
        <div
          style={{
            opacity: clamp01(entryProgress * 1.4),
            transform: `translateY(${(1 - entryProgress) * 24}px)`,
            transition: 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: 'rgba(245,242,236,0.4)',
            }}
          >
            END · CREDITS
          </div>
        </div>

        {/* Italic copy */}
        <div
          style={{
            opacity: clamp01((entryProgress - 0.1) * 1.4),
            transform: `translateY(${(1 - entryProgress) * 24}px)`,
            transition: 'none',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontStyle: 'italic',
              color: 'rgba(245,242,236,0.65)',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
              maxWidth: '24ch',
            }}
          >
            For commissions &<br />conversations,
          </div>
        </div>

        {/* Email */}
        <a
          href="mailto:studio@velour.studio"
          data-interactive=""
          style={{
            opacity: clamp01((entryProgress - 0.25) * 1.4),
            transform: `translateY(${(1 - entryProgress) * 24}px)`,
            fontFamily: 'var(--mono)',
            fontSize: 'clamp(14px, 1.4vw, 18px)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#F5F2EC',
            padding: '4px 0',
            borderBottom: '1px solid rgba(245,242,236,0.4)',
            transition: 'border-color 240ms ease, color 240ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#F5F2EC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(245,242,236,0.4)';
          }}
        >
          studio@velour.studio
        </a>

        {/* Footer mark */}
        <div
          style={{
            position: 'absolute',
            bottom: '5vh',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 5vw',
            opacity: clamp01((entryProgress - 0.4) * 1.4),
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.35)',
            }}
          >
            VELOUR · STUDIO
          </span>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.35)',
            }}
          >
            MMXXVI
          </span>
        </div>
      </div>
    </section>
  );
}
