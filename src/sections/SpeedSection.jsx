import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Scroll, useIsMobile } from '../lib/ScrollContext';
import { clamp01, easeInOutCubic, easeOutCubic, easeOutQuint } from '../lib/easing';
import PlaceholderMedia from '../fx/PlaceholderMedia';

// Hand-tuned tile sizing rhythm — "mimics a real edit, not a uniform grid"
export const SPEED_TILES = [
  { label: 'Porsche 911 Targa',    w: 1100, h: 620,  seed: 3  },
  { label: 'Atelier — interior',   w: 520,  h: 360,  seed: 7  },
  { label: 'Margot — campaign',    w: 780,  h: 1040, seed: 12 },
  { label: 'Lake Como, 06:14',     w: 1380, h: 720,  seed: 19 },
  { label: 'Vinland — table read', w: 540,  h: 380,  seed: 23 },
  { label: 'Nocturne / nightlife', w: 880,  h: 580,  seed: 31 },
  { label: 'Maison — couture',     w: 460,  h: 640,  seed: 37 },
  { label: 'Sable — film still',   w: 1240, h: 700,  seed: 43 },
];

// Desktop scroll breakdown:
//   0 → REGULAR_VH   : horizontal track scroll (with smear entry in first SMEAR_VH portion)
//   REGULAR_VH → HOLD_VH_END : last tile frozen (held beat before punch)
//   HOLD_VH_END → SECTION_VH : punch-in phase (track zooms, UI fades)
const SMEAR_VH   = 0.35; // first 35% of a viewport — smear clears
const REGULAR_VH = 5;    // viewports of regular scroll travel
const HOLD_VH    = 1;    // viewports of frozen hold
const PUNCH_VH   = 1;    // viewports of punch-in
const SECTION_VH = REGULAR_VH + HOLD_VH + PUNCH_VH; // 7

// Mobile: vertical reel — 8 tiles × 1.8vh each
const MOBILE_PER_TILE_VH = 1.8;
const MOBILE_SECTION_VH  = SPEED_TILES.length * MOBILE_PER_TILE_VH;

export default function SpeedSection({ sectionRef }) {
  const { y, vh } = useContext(Scroll);
  const isMobile = useIsMobile();
  const trackRef  = useRef(null);
  const [sectionTop, setSectionTop]   = useState(0);
  const [trackWidth, setTrackWidth]   = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      if (sectionRef.current) setSectionTop(sectionRef.current.offsetTop);
      if (trackRef.current)   setTrackWidth(trackRef.current.scrollWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [sectionRef]);

  // -- Shared --
  const localY = y - sectionTop;

  // -- Velocity for motion blur --
  const lastYRef = useRef(y);
  const lastTRef = useRef(performance.now());
  const [velocity, setVelocity] = useState(0);
  useEffect(() => {
    const now = performance.now();
    const dy  = y - lastYRef.current;
    const dt  = Math.max(8, now - lastTRef.current);
    setVelocity(Math.abs(dy / dt));
    lastYRef.current = y;
    lastTRef.current = now;
  }, [y]);

  const motionBlur = Math.min(velocity * 8, 18);

  // Section entrance fade
  const enterProgress = clamp01((localY + vh * 0.6) / (vh * 0.6));

  // ===========================================================================
  // DESKTOP layout
  // ===========================================================================
  if (!isMobile) {
    const sectionHeight  = vh * SECTION_VH;
    const regularHeight  = vh * REGULAR_VH;
    const holdEnd        = regularHeight + vh * HOLD_VH;

    // 1. Smear entry — track rushes in from right with Home's peak blur
    const smearLocalY    = clamp01(localY / (vh * SMEAR_VH));
    const smearProgress  = easeOutCubic(smearLocalY);
    const smearBlur      = (1 - smearProgress) * 28;
    const smearOffset    = (1 - smearProgress) * 1400;

    // 2. Regular horizontal scroll (after smear phase)
    const regularStart   = vh * SMEAR_VH;
    const adjustedLocalY = Math.max(0, localY - regularStart);
    const adjustedHeight = Math.max(1, regularHeight - regularStart);
    const rawProgress    = clamp01(adjustedLocalY / adjustedHeight);

    // Steep deceleration for last 20%
    let eased;
    if (rawProgress < 0.8) {
      eased = easeInOutCubic(rawProgress / 0.8) * 0.85;
    } else {
      const t = (rawProgress - 0.8) / 0.2;
      eased = 0.85 + easeOutQuint(t) * 0.15;
    }

    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const maxX      = Math.max(0, trackWidth - viewportW + 200);
    const translateX = -(eased * maxX) + smearOffset;

    // 3. Hold phase — track frozen, subtle breathing
    const holdProgress  = clamp01((localY - regularHeight) / (vh * HOLD_VH));

    // 4. Punch-in phase — track scales up, UI fades
    const punchProgress = clamp01((localY - holdEnd) / (vh * PUNCH_VH));
    const punchScale    = 1 + punchProgress * 0.65;
    const chromeOpacity = Math.max(0, 1 - punchProgress * 1.5);

    // Total blur: max of smear blur and velocity blur
    const totalBlur = Math.max(smearBlur, motionBlur);

    const sectionInView = localY > -vh * 0.6 && localY < sectionHeight + vh * 0.4;

    return (
      <section
        ref={sectionRef}
        data-section="speed"
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
            opacity: sectionInView ? 1 : 0,
          }}
        >
          {/* Section label — only "02 — SPEED", no subtitle */}
          <div
            style={{
              position: 'absolute',
              top: '5vh',
              left: '5vw',
              zIndex: 3,
              opacity: enterProgress * chromeOpacity,
              transition: 'opacity 600ms ease',
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
              02 — SPEED
            </div>
          </div>

          {/* The horizontal track */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              transform: `translateY(-50%) translateX(${translateX}px) scale(${punchScale})`,
              transformOrigin: 'center center',
              display: 'flex',
              alignItems: 'center',
              gap: 40,
              paddingLeft: '8vw',
              paddingRight: '8vw',
              willChange: 'transform, filter',
              filter: `blur(${totalBlur * 0.6}px)`,
            }}
            ref={trackRef}
          >
            {SPEED_TILES.map((tile, i) => (
              <DesktopTile key={i} tile={tile} />
            ))}
          </div>

          {/* Reel counter — bottom-right only */}
          <div
            style={{
              position: 'absolute',
              right: '5vw',
              bottom: '5vh',
              zIndex: 3,
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              opacity: enterProgress * chromeOpacity,
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'rgba(245,242,236,0.85)',
              letterSpacing: '0.08em',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(245,242,236,0.5)',
              }}
            >
              REEL
            </span>
            {String(
              Math.min(SPEED_TILES.length, Math.floor(rawProgress * SPEED_TILES.length) + 1)
            ).padStart(2, '0')}
            <span style={{ color: 'rgba(245,242,236,0.35)' }}>/ {SPEED_TILES.length}</span>
          </div>

          {/* Punch-in dark overlay — builds as track zooms */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0A0908',
              opacity: punchProgress * 0.55,
              pointerEvents: 'none',
              zIndex: 4,
            }}
          />
        </div>
      </section>
    );
  }

  // ===========================================================================
  // MOBILE layout — vertical reel
  // ===========================================================================
  const mobileSectionHeight = vh * MOBILE_SECTION_VH;
  // Add 1 vh for hold + punch-in equivalent
  const mobileTotalHeight   = mobileSectionHeight + vh * 2;

  return (
    <section
      ref={sectionRef}
      data-section="speed"
      style={{
        position: 'relative',
        height: `${(MOBILE_SECTION_VH + 2) * 100}vh`,
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Section label */}
        <div
          style={{
            position: 'absolute',
            top: '5vh',
            left: '5vw',
            zIndex: 3,
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
            02 — SPEED
          </div>
        </div>

        {/* Reel counter */}
        <div
          style={{
            position: 'absolute',
            right: '5vw',
            bottom: '5vh',
            zIndex: 3,
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'rgba(245,242,236,0.85)',
            letterSpacing: '0.08em',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.5)',
            }}
          >
            REEL
          </span>
          {String(
            Math.min(
              SPEED_TILES.length,
              Math.max(
                1,
                Math.floor(clamp01(localY / mobileSectionHeight) * SPEED_TILES.length) + 1
              )
            )
          ).padStart(2, '0')}
          <span style={{ color: 'rgba(245,242,236,0.35)' }}>/ {SPEED_TILES.length}</span>
        </div>

        {/* Vertical tile stack */}
        {SPEED_TILES.map((tile, i) => {
          const tileStart = i * MOBILE_PER_TILE_VH * vh;
          const tileEnd   = (i + 1) * MOBILE_PER_TILE_VH * vh;
          const tileMid   = (tileStart + tileEnd) / 2;
          const dist      = localY - tileMid;
          const range     = MOBILE_PER_TILE_VH * vh * 0.8;
          const tileProgress = 1 - clamp01(Math.abs(dist) / range);
          const entering     = dist < 0 ? clamp01((dist + range) / range) : 1;

          const tileOpacity   = easeOutCubic(tileProgress);
          const tileTranslateY = dist < 0
            ? (1 - entering) * 60
            : clamp01((dist - range * 0.2) / (range * 0.8)) * -40;

          // Mobile tile sizing rhythm: vary widths/heights based on tile
          const isPortrait = tile.h > tile.w;
          const mobileH    = isPortrait ? '72vh' : '58vh';
          const mobileW    = isPortrait ? '76%' : '92%';
          // Alternate positioning for rhythm
          const mobileLeft = i % 3 === 0 ? '4%' : i % 3 === 1 ? '50%' : '4%';
          const mobileTransform = i % 3 === 1 ? 'translateX(-50%)' : 'none';

          // Vertical motion blur on fast scroll
          const vBlur = Math.min(velocity * 5, 12);

          return (
            <div
              key={i}
              data-tile="speed"
              style={{
                position: 'absolute',
                top: '50%',
                left: mobileLeft,
                transform: `${mobileTransform} translateY(calc(-50% + ${tileTranslateY}px))`,
                width: mobileW,
                height: mobileH,
                opacity: tileOpacity,
                filter: `blur(${vBlur}px)`,
                willChange: 'transform, opacity, filter',
                overflow: 'hidden',
                background: '#111',
              }}
            >
              <PlaceholderMedia seed={tile.seed} label={tile.label} kind="video" />
            </div>
          );
        })}

        {/* Punch-in overlay for mobile */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#0A0908',
            opacity: clamp01((localY - mobileSectionHeight) / (vh * 1)),
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      </div>
    </section>
  );
}

function DesktopTile({ tile }) {
  return (
    <div
      data-tile="speed"
      style={{
        position: 'relative',
        width: tile.w,
        height: tile.h,
        flex: '0 0 auto',
        overflow: 'hidden',
        background: '#111',
      }}
    >
      <PlaceholderMedia seed={tile.seed} label={tile.label} kind="video" />
    </div>
  );
}
