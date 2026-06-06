import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Scroll } from '../lib/ScrollContext';
import { clamp01 } from '../lib/easing';

const DEFAULT_REEL_ITEMS = [
  { id: 'afro-rave', label: 'Afro Rave', src: '/afro-rave.mp4', loop: true },
  {
    id: 'one-of-one',
    label: '1 of 1',
    src: '/1of1.mp4',
    nextSrc: '/final-1of1.mp4',
    loop: false,
  },
  { id: 'focus', label: 'Focus', src: '/focus.mp4', loop: true },
  { id: 'yomi-wunmi', label: 'Yomi & Wunmi', src: '/yomi-wunmi.mp4', loop: true },
  { id: 'p2w-arcana', label: 'P2W Arcana', src: '/p2w-arcana.mp4', loop: true },
];

const canUseDom = typeof window !== 'undefined';

export default function SingleVideoReel({ items = DEFAULT_REEL_ITEMS }) {
  const { y, vh } = useContext(Scroll);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [sectionTop, setSectionTop] = useState(0);
  const [muted, setMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageSrc, setStageSrc] = useState(items[0]?.src);

  useLayoutEffect(() => {
    const update = () => {
      if (sectionRef.current) setSectionTop(sectionRef.current.offsetTop);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    setStageSrc(items[0]?.src);
  }, [items]);

  useEffect(() => {
    const localY = y - sectionTop;
    const nextIndex = Math.max(0, Math.min(items.length - 1, Math.floor((localY + vh * 0.5) / vh)));
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
      setStageSrc(items[nextIndex].src);
    }
  }, [activeIndex, items, sectionTop, vh, y]);

  const activeItem = items[activeIndex] || items[0];
  const inReel = y + vh > sectionTop && y < sectionTop + items.length * vh;
  const localProgress = clamp01((y - sectionTop) / (items.length * vh));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stageSrc || !activeItem) return;

    if (video.dataset.src === stageSrc) return;
    video.dataset.src = stageSrc;
    video.src = stageSrc;
    video.loop = activeItem.loop || stageSrc === activeItem.nextSrc;
    video.muted = muted;
    video.playsInline = true;
    video.preload = 'auto';
    video.load();
    if (inReel) video.play().catch(() => {});
  }, [activeItem, activeItem?.loop, activeItem?.nextSrc, inReel, muted, stageSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inReel) video.play().catch(() => {});
    else video.pause();
  }, [inReel, activeIndex, stageSrc]);

  const handleEnded = () => {
    if (!activeItem?.nextSrc || stageSrc === activeItem.nextSrc) return;
    setStageSrc(activeItem.nextSrc);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: `${items.length * 100}vh`,
        background: '#000',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Tap to unmute' : 'Tap to mute'}
          data-interactive=""
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            border: 0,
            padding: 0,
            background: 'transparent',
            color: 'inherit',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleEnded}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '5vh',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(245,242,236,0.7)',
              opacity: muted ? 1 : 0,
              transition: 'opacity 600ms ease',
              pointerEvents: 'none',
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}
          >
            Tap for sound
          </span>
        </button>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 'clamp(18px, 3vw, 36px)',
            bottom: 'clamp(18px, 3vw, 36px)',
            zIndex: 3,
            fontFamily: 'var(--mono)',
            fontSize: 9.5,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(245,242,236,0.68)',
            pointerEvents: 'none',
          }}
        >
          {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            transformOrigin: 'left center',
            transform: `scaleX(${localProgress})`,
            background: 'rgba(245,242,236,0.55)',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />
      </div>

      {canUseDom && items.map((item, index) => (
        <div
          key={item.id}
          aria-label={item.label}
          style={{
            position: 'absolute',
            top: `${index * 100}vh`,
            left: 0,
            width: '100%',
            height: '100vh',
            pointerEvents: 'none',
          }}
        />
      ))}
    </section>
  );
}
