import { useEffect, useRef, useState } from 'react';
import { Scroll, useIsMobile } from './lib/ScrollContext';
import HomeSection from './sections/HomeSection';
import SplitScreenEntry from './sections/SplitScreenEntry';
import LoadingOverlay from './fx/LoadingOverlay';
import VideoPanel from './fx/VideoPanel';
import OutroVideoPanel from './fx/OutroVideoPanel';
import VideoModal from './fx/VideoModal';
import PerfHUD from './fx/PerfHUD';
import { debugFlags } from './lib/debugFlags';

// ── Locked design values (replaces tweaks system) ───────────────────────────
const SERIF              = 'Bodoni Moda'; // eslint-disable-line no-unused-vars
const MONO               = 'JetBrains Mono';   // eslint-disable-line no-unused-vars
// TODO: replace with real tagline when client provides copy
const TAGLINE            = 'TBD';              // eslint-disable-line no-unused-vars
const WORDMARK_PLACEMENT = 'centered';          // eslint-disable-line no-unused-vars
const GRAIN_OPACITY      = 0.08;
const SHOW_FOCUS_COUNTER = true;

const SECTIONS_META = [
  { id: 'home',    label: 'Home',    num: '01' },
  { id: 'speed',   label: 'Speed',   num: '02' },
  { id: 'focus',   label: 'Focus',   num: '03' },
  { id: 'contact', label: 'Contact', num: '04' },
];

// Bucket panels — each shows a tiny 5s muted preview loop. Click
// opens the full-quality video in a modal. previewSrc is the loop;
// fullSrc is what plays in the modal.
const SPEED_PANELS = [
  { id: 'soccer-drone', previewSrc: '/loops/1of1.mp4',       fullSrc: '/1of1.mp4',       poster: '/posters/1of1.jpg' },
  { id: 'soccer-kid',   previewSrc: '/loops/final-1of1.mp4', fullSrc: '/final-1of1.mp4', poster: '/posters/final-1of1.jpg' },
  { id: 'afro-rave',    previewSrc: '/loops/afro-rave.mp4',  fullSrc: '/afro-rave.mp4',  poster: '/posters/afro-rave.jpg', lazy: true },
];
const FOCUS_PANELS = [
  { id: 'juice',      previewSrc: '/loops/focus.mp4',      fullSrc: '/focus.mp4',      poster: '/posters/focus.jpg' },
  { id: 'yomi-wunmi', previewSrc: '/loops/yomi-wunmi.mp4', fullSrc: '/yomi-wunmi.mp4', poster: '/posters/yomi-wunmi.jpg' },
];

// Outro: same mission + contact for both buckets. The anchor video
// is the last loop of whichever bucket the user came from (visual
// continuity from the reel into the contracting outro card).
const OUTRO_MISSION_PLACEHOLDER =
  "With the rise of AI, it's more important than ever to make content that is as human and emotional as possible. Every shot immortalizes priceless moments.";
const OUTRO_EMAIL = 'contact@veloure.studio';

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
        Veloure
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
// Scroll lock: split is fully visible at this progress value.
// Matches SPLIT_IN_END in HomeSection.jsx.
const SPLIT_SCROLL_LOCK = 0.72;

export default function App() {
  const scrollContainerRef = useRef(null);
  const [scrollState, setScrollState]   = useState({ y: 0, vh: 800 });
  const [activeIndex, setActiveIndex]   = useState(0);
  const [hasScrolled, setHasScrolled]   = useState(false);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [selectedPath, setSelectedPath] = useState(null);
  const [modalSrc, setModalSrc] = useState(null);
  const isMobile = useIsMobile();

  const homeRef    = useRef(null);
  const sectionRefs = [homeRef];

  // Ref so event handlers always see current selectedPath
  const selectedPathRef = useRef(null);
  useEffect(() => { selectedPathRef.current = selectedPath; }, [selectedPath]);

  // Apply CSS font variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--serif', `'${SERIF}', Georgia, serif`);
    root.style.setProperty('--mono', `'${MONO}', ui-monospace, Menlo, monospace`);
  }, []);

  // Loader: 1 second on screen, then trigger its leave animation.
  // Combined with HomeSection's 400ms reveal delay + 1100ms transition,
  // Veloure is fully visible at 2.5s from page load.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoaderLeaving(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);


  // Scroll listener + locks for the non-scrollable states.
  useEffect(() => {
    const c = scrollContainerRef.current;
    if (!c) return undefined;
    let raf = 0;
    let pending = false;
    let touchStartY = 0;

    const getLockBounds = () => {
      const vh = c.clientHeight || window.innerHeight || 1;
      const maxScroll = Math.max(c.scrollHeight - vh, 0);
      const splitLockY = Math.min(vh * SPLIT_SCROLL_LOCK, maxScroll);

      if (!selectedPathRef.current) {
        return { min: 0, max: splitLockY };
      }

      const outro = c.querySelector('[data-section="outro"]');
      if (outro) {
        return { min: splitLockY, max: Math.min(outro.offsetTop + vh * 0.9, maxScroll) };
      }

      return { min: splitLockY, max: maxScroll };
    };

    const clampScroll = () => {
      const { min, max } = getLockBounds();
      if (c.scrollTop < min) { c.scrollTop = min; return true; }
      if (c.scrollTop > max) { c.scrollTop = max; return true; }
      return false;
    };

    const update = () => {
      pending = false;
      clampScroll();

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

    const shouldBlockScrollDelta = (deltaY) => {
      const { min, max } = getLockBounds();
      return (deltaY < 0 && c.scrollTop <= min) || (deltaY > 0 && c.scrollTop >= max);
    };

    const exitSelectedPathAtTop = (deltaY) => {
      const { min } = getLockBounds();
      if (!selectedPathRef.current || deltaY >= 0 || c.scrollTop > min) return false;
      selectedPathRef.current = null;
      setSelectedPath(null);
      c.scrollTop = min;
      return true;
    };

    const onWheel = (event) => {
      if (exitSelectedPathAtTop(event.deltaY)) {
        event.preventDefault();
        return;
      }
      if (shouldBlockScrollDelta(event.deltaY)) {
        event.preventDefault();
        clampScroll();
      }
    };

    const onTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event) => {
      const nextY = event.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - nextY;
      touchStartY = nextY;
      if (exitSelectedPathAtTop(deltaY)) {
        event.preventDefault();
        return;
      }
      if (shouldBlockScrollDelta(deltaY)) {
        event.preventDefault();
        clampScroll();
      }
    };

    update();
    c.addEventListener('scroll', onScroll, { passive: true });
    c.addEventListener('wheel', onWheel, { passive: false });
    c.addEventListener('touchstart', onTouchStart, { passive: true });
    c.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener('scroll', onScroll);
      c.removeEventListener('wheel', onWheel);
      c.removeEventListener('touchstart', onTouchStart);
      c.removeEventListener('touchmove', onTouchMove);
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

  // After leave animation kicks in (~950ms), fully unmount the loader.
  useEffect(() => {
    if (!loaderLeaving) return undefined;
    const timer = window.setTimeout(() => setLoaderVisible(false), 950);
    return () => window.clearTimeout(timer);
  }, [loaderLeaving]);

  return (
    <Scroll.Provider value={scrollState}>
      {loaderVisible && <LoadingOverlay leaving={loaderLeaving} />}

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
        <HomeSection
          sectionRef={homeRef}
          loaderDone={loaderLeaving}
          pathSelected={!!selectedPath}
        >
          <SplitScreenEntry selectedPath={selectedPath} onSelectPath={setSelectedPath} />
        </HomeSection>
        {selectedPath && (() => {
          const panels = selectedPath === 'focus' ? FOCUS_PANELS : SPEED_PANELS;
          return panels.map((p, i) => {
            const isLast = i === panels.length - 1;
            if (isLast) {
              return (
                <OutroVideoPanel
                  key={p.id}
                  previewSrc={p.previewSrc}
                  fullSrc={p.fullSrc}
                  poster={p.poster}
                  mission={OUTRO_MISSION_PLACEHOLDER}
                  contactEmail={OUTRO_EMAIL}
                  onOpen={setModalSrc}
                />
              );
            }
            return (
              <VideoPanel
                key={p.id}
                previewSrc={p.previewSrc}
                fullSrc={p.fullSrc}
                poster={p.poster}
                lazy={p.lazy}
                onOpen={setModalSrc}
              />
            );
          });
        })()}
      </div>

      {/* Modal overlay for full-quality video playback */}
      <VideoModal src={modalSrc} open={!!modalSrc} onClose={() => setModalSrc(null)} />

      {/* Global FX */}
      {debugFlags.debug && <PerfHUD />}
    </Scroll.Provider>
  );
}
