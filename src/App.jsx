import { useCallback, useEffect, useRef, useState } from 'react';
import { Scroll, useIsMobile } from './lib/ScrollContext';
import HomeSection from './sections/HomeSection';
import SplitScreenEntry from './sections/SplitScreenEntry';
import LoadingOverlay from './fx/LoadingOverlay';
import VideoPanel from './fx/VideoPanel';
import OutroVideoPanel from './fx/OutroVideoPanel';
import VideoModal from './fx/VideoModal';
import CategoryNav from './fx/CategoryNav';
import PerfHUD from './fx/PerfHUD';
import { debugFlags } from './lib/debugFlags';
import { CONTACT_EMAIL, MISSION, categoryById, categoryFromPath } from './lib/categories';
import { prefersReducedMotion } from './lib/useReducedMotion';

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
  { id: 'pulse',   label: 'Pulse',   num: '04' },
  { id: 'contact', label: 'Contact', num: '05' },
];

// Films, copy, and URLs for Speed / Focus / Pulse live in
// lib/categories.js. Every category renders through the same panels.

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

// /speed, /focus, /pulse open that category directly (outreach links,
// refresh) — no loader, no intro, straight onto its title card.
const INITIAL_PATH = typeof window === 'undefined' ? null : categoryFromPath(window.location.pathname);

export default function App() {
  const scrollContainerRef = useRef(null);
  const [scrollState, setScrollState]   = useState({ y: 0, vh: 800 });
  const [activeIndex, setActiveIndex]   = useState(0);
  const [hasScrolled, setHasScrolled]   = useState(false);
  const [loaderLeaving, setLoaderLeaving] = useState(!!INITIAL_PATH);
  const [loaderVisible, setLoaderVisible] = useState(!INITIAL_PATH);
  const [selectedPath, setSelectedPath] = useState(INITIAL_PATH);
  const [modalFilm, setModalFilm] = useState(null);
  const isMobile = useIsMobile();

  const homeRef    = useRef(null);
  const sectionRefs = [homeRef];

  // Ref so event handlers always see current selectedPath
  const selectedPathRef = useRef(null);
  useEffect(() => { selectedPathRef.current = selectedPath; }, [selectedPath]);

  // The open category's URL stays in the bar (/speed, /focus, /pulse;
  // / when none) without a navigation, so a copied link or a refresh
  // lands in the same place.
  useEffect(() => {
    const path = categoryById(selectedPath)?.path || '/';
    if (window.location.pathname !== path) {
      window.history.replaceState(null, '', path + window.location.search);
    }
  }, [selectedPath]);

  // ── Scroll helpers (nav, "View films", "Next film") ──────────────────
  const scrollToY = useCallback((top) => {
    const c = scrollContainerRef.current;
    if (!c) return;
    c.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, []);

  // Category title card = the split, locked fully open.
  const introY = () => {
    const c = scrollContainerRef.current;
    return c ? c.clientHeight * SPLIT_SCROLL_LOCK : 0;
  };

  const scrollToFilm = useCallback((index) => {
    const c = scrollContainerRef.current;
    const el = c?.querySelector(`[data-film="${index}"]`);
    if (el) scrollToY(el.offsetTop);
  }, [scrollToY]);

  // Past the last film: the outro card + mission + contact.
  const scrollToOutro = useCallback(() => {
    const c = scrollContainerRef.current;
    const el = c?.querySelector('[data-section="outro"]');
    if (el) scrollToY(el.offsetTop + c.clientHeight * 0.9);
  }, [scrollToY]);

  const goToCategory = useCallback((id) => {
    setModalFilm(null);
    selectedPathRef.current = id;
    setSelectedPath(id);
    // Wait for the new films to render, then land on the title card.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToY(introY())));
  }, [scrollToY]);

  const goToAllWork = useCallback(() => {
    setModalFilm(null);
    selectedPathRef.current = null;
    setSelectedPath(null);
    const c = scrollContainerRef.current;
    if (c) c.scrollTop = introY();
  }, []);

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

    // Snap between the Veloure title (top) and the full selector so the
    // crossfade never rests half-done (dim, and not yet clickable).
    // Once scrolling goes idle in between, finish the move in the
    // direction the visitor was heading.
    let lastY = c.scrollTop;
    let heading = 0;          // +1 down, -1 up
    let touching = false;
    let snapTimer = 0;
    const SNAP_IDLE_MS = 140;

    const snapIfBetween = () => {
      snapTimer = 0;
      if (selectedPathRef.current || touching) return;
      const vh = c.clientHeight || 1;
      const lockY = Math.min(vh * SPLIT_SCROLL_LOCK, Math.max(c.scrollHeight - vh, 0));
      const y = c.scrollTop;
      if (y <= 1 || y >= lockY - 1) return;
      const target = heading < 0 ? 0 : lockY;
      c.scrollTo({ top: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    };

    const scheduleSnap = () => {
      if (snapTimer) window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(snapIfBetween, SNAP_IDLE_MS);
    };

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
      const y = c.scrollTop;
      if (y !== lastY) heading = y > lastY ? 1 : -1;
      lastY = y;
      scheduleSnap();
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

    const onTouchEnd = () => {
      touching = false;
      scheduleSnap();
    };

    const onTouchStart = (event) => {
      touching = true;
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
    // This effect re-attaches on the first scroll (hasScrolled flips),
    // which cleared any pending snap — re-arm it.
    scheduleSnap();
    c.addEventListener('scroll', onScroll, { passive: true });
    c.addEventListener('wheel', onWheel, { passive: false });
    c.addEventListener('touchstart', onTouchStart, { passive: true });
    c.addEventListener('touchmove', onTouchMove, { passive: false });
    c.addEventListener('touchend', onTouchEnd, { passive: true });
    c.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      if (snapTimer) window.clearTimeout(snapTimer);
      c.removeEventListener('touchend', onTouchEnd);
      c.removeEventListener('touchcancel', onTouchEnd);
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

      {/* First in the DOM so keyboard users reach it before the films. */}
      <CategoryNav
        activeId={selectedPath}
        visible={!!selectedPath && !modalFilm}
        onSelect={goToCategory}
        onAllWork={goToAllWork}
      />

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
          <SplitScreenEntry
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
            onViewFilms={() => scrollToFilm(0)}
          />
        </HomeSection>
        {(() => {
          const cat = categoryById(selectedPath);
          if (!cat) return null;
          const total = cat.films.length;
          return cat.films.map((film, i) => {
            const isLast = i === total - 1;
            const chrome = {
              eyebrow: `${cat.label} · ${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
              title: film.title,
              duration: film.duration,
              next: isLast
                ? { label: 'Contact', onClick: scrollToOutro }
                : { label: 'Next film', onClick: () => scrollToFilm(i + 1) },
            };
            const open = () => setModalFilm(film);
            if (isLast) {
              return (
                <OutroVideoPanel
                  key={`${cat.id}-${film.id}`}
                  filmIndex={i}
                  previewSrc={film.previewSrc}
                  fullSrc={film.fullSrc}
                  poster={film.poster}
                  mission={MISSION}
                  contactEmail={CONTACT_EMAIL}
                  onOpen={open}
                  chrome={chrome}
                />
              );
            }
            return (
              <VideoPanel
                key={`${cat.id}-${film.id}`}
                filmIndex={i}
                previewSrc={film.previewSrc}
                fullSrc={film.fullSrc}
                poster={film.poster}
                lazy={film.lazy}
                onOpen={open}
                chrome={chrome}
              />
            );
          });
        })()}
      </div>

      {/* Modal overlay for full-quality video playback */}
      <VideoModal
        src={modalFilm?.fullSrc}
        poster={modalFilm?.poster}
        label={modalFilm ? (modalFilm.title || `${categoryById(selectedPath)?.label} film`) : undefined}
        open={!!modalFilm}
        onClose={() => setModalFilm(null)}
      />


      {/* Global FX */}
      {debugFlags.debug && <PerfHUD />}
    </Scroll.Provider>
  );
}
