import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Scroll } from '../lib/ScrollContext';
import { clamp01 } from '../lib/easing';
import { attachHls } from '../lib/hls';
import { debugFlags } from '../lib/debugFlags';
import MeshBackground from './MeshBackground';

/**
 * Last panel of a bucket. Behaves like a normal VideoPanel at the
 * top of its section (fullscreen loop, click opens modal). As the
 * user scrolls into the panel, the SAME video element shrinks in
 * place, "by Veloure" converges in from off-screen,
 * and finally the mission paragraph + email fade in below.
 *
 * No duplicate video element. No separate outro section.
 *
 * Section is 200vh; the sticky inner pins for the full duration so
 * progress 0 → 1 maps to scrolling one full viewport past the panel.
 */
const TITLE = 'by Veloure';
const SUBTITLE = 'Our Mission';

export default function OutroVideoPanel({
  previewSrc,
  fullSrc,
  poster,
  mission,
  contactEmail,
  onOpen,
}) {
  const { y, vh } = useContext(Scroll);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const unloadTimerRef = useRef(null);

  const [sectionTop, setSectionTop] = useState(0);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const update = () => {
      if (sectionRef.current) setSectionTop(sectionRef.current.offsetTop);
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true); setInView(true); return undefined;
    }
    const findScrollRoot = (node) => {
      let n = node?.parentElement;
      while (n && n !== document.body) {
        const style = window.getComputedStyle(n);
        if (/(auto|scroll)/.test(style.overflowY)) return n;
        n = n.parentElement;
      }
      return null;
    };
    const root = findScrollRoot(el);
    const loadObserver = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          if (unloadTimerRef.current) { clearTimeout(unloadTimerRef.current); unloadTimerRef.current = null; }
          setShouldLoad(true);
        } else {
          if (unloadTimerRef.current) clearTimeout(unloadTimerRef.current);
          unloadTimerRef.current = setTimeout(() => { setShouldLoad(false); unloadTimerRef.current = null; }, 1500);
        }
      }
    }, { root, rootMargin: '75% 0px', threshold: 0 });
    const playObserver = new IntersectionObserver((entries) => {
      for (const e of entries) setInView(e.intersectionRatio >= 0.3);
    }, { root, threshold: [0, 0.3, 1] });
    loadObserver.observe(el);
    playObserver.observe(el);
    return () => {
      loadObserver.disconnect(); playObserver.disconnect();
      if (unloadTimerRef.current) { clearTimeout(unloadTimerRef.current); unloadTimerRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (debugFlags.noVideos) return attachHls(videoRef.current, null);
    return attachHls(videoRef.current, shouldLoad ? previewSrc : null);
  }, [shouldLoad, previewSrc]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && shouldLoad) v.play().catch(() => {});
    else {
      v.pause();
      if (!inView) { try { v.currentTime = 0; } catch (e) { /* ignore */ } }
    }
  }, [inView, shouldLoad]);

  // Scroll progress across the 200vh section (0 → 1 over 100vh of scroll).
  // The video stays fullscreen while p < 0.35 so the panel reads as a
  // normal video first; the animation only starts once the user has
  // committed to scrolling past it.
  const localY = y - sectionTop;
  const rawProgress = clamp01(localY / Math.max(vh * 0.9, 1));
  const startThreshold = 0.35;
  const p = rawProgress <= startThreshold
    ? 0
    : clamp01((rawProgress - startThreshold) / (1 - startThreshold));

  // Card sizing: starts as TRUE fullscreen (matches every other panel
  // before it — no margin, no rounded corners). Shrinks to ~300×400.
  const startWPx = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const startHPx = typeof window !== 'undefined' ? window.innerHeight : 900;
  const endWPx = isMobile ? 280 : 300;
  const endHPx = isMobile ? 360 : 400;
  const cardW = startWPx + (endWPx - startWPx) * p;
  const cardH = startHPx + (endHPx - startHPx) * p;

  // Text converges FROM off-screen INTO center (reverse of original).
  // Original: 0 → ±150vw as scroll progresses (splits apart).
  // Reversed: ±150vw → 0 as scroll progresses (comes together).
  const startOffsetVw = isMobile ? 180 : 150;
  const textTranslateX = startOffsetVw * (1 - p);
  const textOpacity = p; // only visible as the card shrinks
  const subtitleOpacity = clamp01((p - 0.2) / 0.8);
  // Mission paragraph + email fade in after card is mostly shrunk.
  const contentOpacity = clamp01((p - 0.7) / 0.3);
  const contentTranslateY = (1 - contentOpacity) * (isMobile ? 14 : 24);
  const contentGapPx = isMobile ? 34 : 56;

  const handleClick = () => {
    // Only treat as "open modal" when the panel is in its fullscreen
    // (pre-animation) state. Otherwise the click feels like an
    // accidental tap on the shrunk card.
    if (p < 0.05 && onOpen && fullSrc) onOpen(fullSrc);
  };

  const firstWord = TITLE.split(' ')[0];
  const restOfTitle = TITLE.split(' ').slice(1).join(' ');

  return (
    <section
      ref={sectionRef}
      data-section="outro"
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
        {/* Mesh background — only mount the WebGL shader when the card
            is actually shrinking (p > 0). At p=0 the video is fullscreen
            and the mesh is invisible anyway — no need to burn ~400MB GPU. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: p,
            zIndex: 0,
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        >
          {p > 0 && <MeshBackground />}
        </div>

        {/* The video — same element through all stages. No duplicate. */}
        <div
          onClick={handleClick}
          role={p < 0.05 ? 'button' : undefined}
          aria-label={p < 0.05 ? 'Play full video' : undefined}
          data-interactive=""
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${cardW}px`,
            height: `${cardH}px`,
            // No max constraints at p=0 so it's truly full-bleed like
            // every other VideoPanel before it.
            borderRadius: `${p * 20}px`,
            boxShadow: p > 0.15 ? `0 ${10 + p * 40}px ${30 + p * 60}px rgba(0, 0, 0, 0.45)` : 'none',
            overflow: 'hidden',
            cursor: p < 0.05 ? 'pointer' : 'default',
            willChange: 'width, height, border-radius',
            zIndex: 2,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* "by Veloure" — sits ABOVE the shrunk card, converges in from
            the sides as p → 1. Smaller and tighter to the card now so
            it doesn't hug the top edge of the viewport. */}
        <div
          style={{
            position: 'absolute',
            // 16px above the card's top edge (was 28)
            top: `calc(50% - ${cardH / 2}px - 16px)`,
            left: 0,
            right: 0,
            transform: 'translateY(-100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            zIndex: 3,
            pointerEvents: 'none',
            opacity: textOpacity,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(28px, 4vw, 56px)',
              fontWeight: 400,
              letterSpacing: '0',
              color: '#F5F2EC',
              margin: 0,
              lineHeight: 1,
              transform: `translateX(-${textTranslateX}vw)`,
              willChange: 'transform',
            }}
          >
            {firstWord}
          </h2>
          <h2
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(28px, 4vw, 56px)',
              fontWeight: 400,
              letterSpacing: '0',
              color: '#F5F2EC',
              margin: 0,
              lineHeight: 1,
              transform: `translateX(${textTranslateX}vw)`,
              willChange: 'transform',
            }}
          >
            {restOfTitle}
          </h2>
        </div>

        {/* "Our Mission" subtitle, positioned just under the card */}
        <div
          style={{
            position: 'absolute',
            top: `calc(50% + ${cardH / 2 + 14}px)`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            pointerEvents: 'none',
            opacity: subtitleOpacity,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(14px, 1.4vw, 20px)',
              color: '#F5F2EC',
              margin: 0,
              transform: `translateX(-${textTranslateX * 0.6}vw)`,
              willChange: 'transform',
            }}
          >
            {SUBTITLE}
          </p>
        </div>

        {/* Mission paragraph + email.
            Tighter spacing + smaller fonts so the block doesn't crowd
            the bottom of the viewport. */}
        <div
          style={{
            position: 'absolute',
            top: `calc(50% + ${endHPx / 2 + contentGapPx}px)`,
            left: '50%',
            transform: `translate(-50%, ${contentTranslateY}px)`,
            opacity: contentOpacity,
            zIndex: 3,
            width: isMobile ? 'min(560px, 88vw)' : 'min(560px, 84vw)',
            textAlign: 'center',
            color: '#F5F2EC',
            pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none',
            willChange: 'opacity, transform',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 'clamp(11px, 0.85vw, 13px)',
              lineHeight: 1.6,
              letterSpacing: '0.02em',
              color: 'rgba(245,242,236,0.78)',
              margin: '0 0 18px 0',
            }}
          >
            {mission}
          </p>

          <a
            href={`mailto:${contactEmail}`}
            data-interactive=""
            style={{
              display: 'inline-block',
              fontFamily: 'var(--mono)',
              fontSize: 'clamp(11px, 0.85vw, 13px)',
              letterSpacing: '0.14em',
              lineHeight: 1.4,
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.82)',
              padding: '2px 0',
              borderBottom: '1px solid rgba(245,242,236,0.35)',
              transition: 'border-color 240ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F5F2EC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,242,236,0.4)'; }}
          >
            {contactEmail}
          </a>
        </div>
      </div>
    </section>
  );
}
