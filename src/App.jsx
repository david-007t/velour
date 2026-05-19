import { useEffect, useRef, useState } from 'react';
import { Scroll, useIsMobile } from './lib/ScrollContext';
import HomeSection from './sections/HomeSection';
import SpeedSection from './sections/SpeedSection';
import FocusSection from './sections/FocusSection';
import ContactSection from './sections/ContactSection';
import Grain from './fx/Grain';
import Cursor from './fx/Cursor';

// ── Locked design values (replaces tweaks system) ───────────────────────────
const SERIF              = 'Instrument Serif'; // eslint-disable-line no-unused-vars
const MONO               = 'JetBrains Mono';   // eslint-disable-line no-unused-vars
// TODO: replace with real tagline when client provides copy
const TAGLINE            = 'TBD';              // eslint-disable-line no-unused-vars
const WORDMARK_PLACEMENT = 'centered';          // eslint-disable-line no-unused-vars
const GRAIN_OPACITY      = 0.08;
const SHOW_FOCUS_COUNTER = true;
const SHOW_CUSTOM_CURSOR = true;

const SECTIONS_META = [
  { id: 'home',    label: 'Home',    num: '01' },
  { id: 'speed',   label: 'Speed',   num: '02' },
  { id: 'focus',   label: 'Focus',   num: '03' },
  { id: 'contact', label: 'Contact', num: '04' },
];

// ── SideRail ─────────────────────────────────────────────────────────────────
function SideRail({ activeIndex, scrollContainerRef, hidden }) {
  const scrollToSection = (idx) => {
    const c = scrollContainerRef.current;
    if (!c) return;
    const sec = c.querySelector(`[data-section="${SECTIONS_META[idx].id}"]`);
    if (sec) c.scrollTo({ top: sec.offsetTop, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 'clamp(20px, 3vw, 36px)',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        zIndex: 50,
        opacity: hidden ? 0 : 1,
        transition: 'opacity 800ms cubic-bezier(.2,.6,.2,1)',
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      {SECTIONS_META.map((s, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={s.id}
            type="button"
            data-interactive=""
            onClick={() => scrollToSection(i)}
            aria-label={`Go to ${s.label}`}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 0,
              padding: 0,
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexDirection: 'row-reverse',
            }}
          >
            <span
              style={{
                width: active ? 16 : 12,
                height: 1,
                background: active ? '#F5F2EC' : 'rgba(245,242,236,0.35)',
                transition: 'all 360ms cubic-bezier(.2,.6,.2,1)',
                display: 'block',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: active ? 'rgba(245,242,236,0.95)' : 'rgba(245,242,236,0.5)',
                transition: 'color 360ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ opacity: 0.55, marginRight: 8 }}>{s.num}</span>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── TopMark ──────────────────────────────────────────────────────────────────
function TopMark({ hidden }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 'clamp(20px, 3vh, 36px)',
        left: 'clamp(20px, 3vw, 36px)',
        zIndex: 50,
        opacity: hidden ? 0 : 1,
        transition: 'opacity 800ms cubic-bezier(.2,.6,.2,1)',
        pointerEvents: hidden ? 'none' : 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 22,
          lineHeight: 1,
          fontWeight: 400,
          color: '#F5F2EC',
          letterSpacing: '-0.01em',
        }}
      >
        Velour
      </span>
      <span
        style={{
          width: 1,
          height: 12,
          background: 'rgba(245,242,236,0.25)',
          display: 'inline-block',
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
        STUDIO
      </span>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const scrollContainerRef = useRef(null);
  const [scrollState, setScrollState]   = useState({ y: 0, vh: 800 });
  const [activeIndex, setActiveIndex]   = useState(0);
  const [hasScrolled, setHasScrolled]   = useState(false);
  const isMobile = useIsMobile();

  const homeRef    = useRef(null);
  const speedRef   = useRef(null);
  const focusRef   = useRef(null);
  const contactRef = useRef(null);
  const sectionRefs = [homeRef, speedRef, focusRef, contactRef];

  // Fade out pre-loader
  useEffect(() => {
    const pre = document.getElementById('pre-loader');
    if (pre) {
      setTimeout(() => pre.classList.add('gone'), 100);
      setTimeout(() => pre.remove(), 900);
    }
  }, []);

  // Apply CSS font variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--serif', `'${SERIF}', Georgia, serif`);
    root.style.setProperty('--mono', `'${MONO}', ui-monospace, Menlo, monospace`);
  }, []);

  // Scroll listener
  useEffect(() => {
    const c = scrollContainerRef.current;
    if (!c) return undefined;
    let raf = 0;
    let pending = false;

    const update = () => {
      pending = false;
      const y  = c.scrollTop;
      const vh = c.clientHeight;
      setScrollState({ y, vh });
      if (y > 8 && !hasScrolled) setHasScrolled(true);

      const positions = sectionRefs.map((r) => r.current?.offsetTop ?? 0);
      let idx = 0;
      for (let i = 0; i < positions.length; i++) {
        if (y + vh * 0.4 >= positions[i]) idx = i;
      }
      setActiveIndex(idx);
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(update);
    };

    update();
    c.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [hasScrolled]);

  // Side rail: hidden on Home rest-state and on Contact
  const railHidden =
    (activeIndex === 0 && !hasScrolled) ||
    activeIndex === SECTIONS_META.length - 1;

  // SideRail hidden on mobile (short sections navigate by scroll alone)
  const railVisible = !isMobile && !railHidden;

  // Top mark hidden on Home rest-state
  const topMarkHidden = activeIndex === 0 && !hasScrolled;

  return (
    <Scroll.Provider value={scrollState}>
      {/* Main scroll container */}
      <div
        ref={scrollContainerRef}
        className="scroll-container"
        style={{
          position: 'relative',
          height: '100vh',
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          background: '#0A0908',
        }}
      >
        <HomeSection sectionRef={homeRef} />
        <SpeedSection sectionRef={speedRef} />
        <FocusSection sectionRef={focusRef} showCounter={SHOW_FOCUS_COUNTER} />
        <ContactSection sectionRef={contactRef} />
      </div>

      {/* Fixed overlays — outside scroll container */}
      <TopMark hidden={topMarkHidden} />
      <SideRail
        activeIndex={activeIndex}
        scrollContainerRef={scrollContainerRef}
        hidden={!railVisible}
      />

      {/* ACT counter — bottom-right */}
      <div
        style={{
          position: 'fixed',
          right: 'clamp(20px, 3vw, 36px)',
          bottom: 'clamp(20px, 3vh, 36px)',
          zIndex: 49,
          opacity: hasScrolled && activeIndex !== SECTIONS_META.length - 1 ? 0.55 : 0,
          transition: 'opacity 800ms ease',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          fontFamily: 'var(--mono)',
          fontSize: 9.5,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#F5F2EC',
        }}
      >
        <span>ACT</span>
        <span
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 16,
            letterSpacing: 0,
          }}
        >
          {SECTIONS_META[activeIndex].num}
        </span>
      </div>

      {/* Global FX */}
      <Grain opacity={GRAIN_OPACITY} />
      {SHOW_CUSTOM_CURSOR && <Cursor />}
    </Scroll.Provider>
  );
}
