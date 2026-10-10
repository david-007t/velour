import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { debugFlags } from '../lib/debugFlags';
import { CATEGORIES, categoryById } from '../lib/categories';
import { useReducedMotion } from '../lib/useReducedMotion';
import PanelChrome from '../fx/PanelChrome';

// Each side is a category the visitor can choose. Order = left → right
// (top → bottom on mobile).
const DEFAULT_SIDES = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
  video: c.hero.video,
  poster: c.hero.poster,
}));

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

export default function SplitScreenEntry({
  sides = DEFAULT_SIDES,
  selectedPath = null,
  onSelectPath,
  onViewFilms,
}) {
  const [hoveredSide, setHoveredSide] = useState(null);
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const [isMobile, setIsMobile] = useState(false);
  const reducedMotion = useReducedMotion();

  const selectedSide = selectedPath;

  useEffect(() => {
    if (!selectedPath) setHoveredSide(null);
  }, [selectedPath]);

  // Rest: equal split. Hover: hovered side takes half, others share
  // the rest. Selected: chosen side fills the screen.
  const restShare = 100 / sides.length;
  const otherShare = 50 / (sides.length - 1);
  const sizeFor = (id) => {
    if (selectedSide) return selectedSide === id ? '100%' : '0%';
    if (hoveredSide) return hoveredSide === id ? '50%' : `${otherShare}%`;
    return `${restShare}%`;
  };

  const handleClick = (id) => {
    if (onSelectPath) onSelectPath(id);
  };

  // Mobile has no hover, so the first tap previews (expands) a side
  // and the second tap opens it.
  const handleSidePress = (id) => {
    if (isMobile && !selectedSide && hoveredSide !== id) {
      setHoveredSide(id);
      return;
    }
    handleClick(id);
  };

  const handleUnselect = () => {
    setHoveredSide(null);
    if (onSelectPath) onSelectPath(null);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedSide) handleUnselect();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSide]);

  useLayoutEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Paused until the user hovers / selects a side.
  // Priority: selected (post-click) > hovered.
  useEffect(() => {
    const playing = selectedSide || hoveredSide;
    sides.forEach(({ id }) => {
      const v = videoRefs.current[id];
      if (!v) return;
      if (playing === id && !reducedMotion) v.play().catch(() => {});
      else {
        v.pause();
        try { v.currentTime = 0; } catch (error) { /* ignore seek restrictions */ }
      }
    });
  }, [hoveredSide, selectedSide, sides, reducedMotion]);

  const videoStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const baseOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  // When one side is hovered, the OTHER sides' labels dim + shrink.
  // Same treatment when one side is selected.
  const labelStyleFor = (id) => {
    const active = selectedSide === id || (!selectedSide && hoveredSide === id);
    const other = (selectedSide || hoveredSide) && !active;
    return {
      color: 'white',
      fontFamily: 'var(--display)',
      fontSize: isMobile ? 'clamp(40px, 12vw, 64px)' : 'clamp(40px, 6.2vw, 112px)',
      fontWeight: 400,
      textTransform: 'uppercase',
      letterSpacing: '0',
      lineHeight: 0.88,
      textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      opacity: selectedSide ? 0 : (other ? 0.35 : 1),
      transform: other ? 'scale(0.78)' : 'scale(1)',
      transformOrigin: 'center',
      transition: 'opacity 0.45s cubic-bezier(.2,.6,.2,1), transform 0.45s cubic-bezier(.2,.6,.2,1)',
    };
  };

  // Small "open" cue under the label so the panels read as clickable.
  const cueStyleFor = (id) => {
    const active = !selectedSide && hoveredSide === id;
    return {
      marginTop: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--mono)',
      fontSize: 10.5,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'rgba(245,242,236,0.9)',
      textShadow: '0 2px 12px rgba(0,0,0,0.6)',
      whiteSpace: 'nowrap',
      opacity: selectedSide ? 0 : active ? 1 : (hoveredSide ? 0 : 0.55),
      transform: active ? 'translateY(0)' : 'translateY(6px)',
      transition: 'opacity 0.45s cubic-bezier(.2,.6,.2,1), transform 0.45s cubic-bezier(.2,.6,.2,1)',
    };
  };

  return (
    <section
      data-section="choice"
      ref={containerRef}
      aria-label="Choose a body of work"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        background: '#000',
      }}
    >
      {sides.map((side) => {
        const size = sizeFor(side.id);
        const lit = hoveredSide === side.id || selectedSide === side.id;
        const collapsed = selectedSide && selectedSide !== side.id;
        const showOpenCue = isMobile ? hoveredSide === side.id : true;
        return (
          <div
            key={side.id}
            className="split-side"
            role="button"
            tabIndex={collapsed || selectedSide ? -1 : 0}
            aria-hidden={collapsed ? true : undefined}
            aria-label={`Open ${side.label}`}
            data-interactive=""
            style={{
              position: 'relative',
              flex: 'none',
              width: isMobile ? '100%' : size,
              height: isMobile ? size : '100%',
              overflow: 'hidden',
              transition: isMobile ? `height 0.6s ${EASE}` : `width 0.6s ${EASE}`,
              cursor: selectedSide ? 'default' : 'pointer',
            }}
            onMouseEnter={() => !selectedSide && !isMobile && setHoveredSide(side.id)}
            onMouseLeave={() => !selectedSide && !isMobile && setHoveredSide(null)}
            // Keyboard focus only — a tap also focuses, and must not
            // count as the mobile "first tap".
            onFocus={(e) => {
              if (!selectedSide && e.currentTarget.matches(':focus-visible')) setHoveredSide(side.id);
            }}
            onBlur={() => !selectedSide && setHoveredSide(null)}
            onClick={() => !selectedSide && handleSidePress(side.id)}
            onKeyDown={(e) => {
              if (selectedSide) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(side.id);
              }
            }}
          >
            {!debugFlags.noVideos && (
              <video
                ref={(el) => { videoRefs.current[side.id] = el; }}
                loop
                muted
                playsInline
                preload="metadata"
                poster={side.poster}
                style={videoStyle}
              >
                <source src={side.video} type="video/mp4" />
              </video>
            )}
            <div
              style={{
                ...baseOverlayStyle,
                backgroundColor: lit ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={labelStyleFor(side.id)}>{side.label}</div>
              <div style={cueStyleFor(side.id)} aria-hidden="true">
                {showOpenCue && (
                  <>
                    <span>{isMobile ? 'Tap to open' : 'View work'}</span>
                    <span style={{ width: 22, height: 1, background: 'currentColor', display: 'block' }} />
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Category intro: once a side fills the screen it becomes the
          category's title card — same overlay as every film panel. */}
      {(() => {
        const cat = categoryById(selectedSide);
        if (!cat) return null;
        return (
          <PanelChrome
            key={cat.id}
            eyebrow={`Veloure · ${String(CATEGORIES.indexOf(cat) + 1).padStart(2, '0')} / ${String(CATEGORIES.length).padStart(2, '0')}`}
            title={cat.label}
            titleAs="h1"
            display
            description={cat.description}
            next={onViewFilms ? { label: `View ${cat.films.length} films`, onClick: onViewFilms } : undefined}
            style={{ zIndex: 5, animation: 'chrome-in 900ms cubic-bezier(.16,1,.3,1) 350ms both' }}
          />
        );
      })()}
    </section>
  );
}
