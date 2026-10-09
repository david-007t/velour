import { useEffect, useRef, useState } from 'react';
import VideoModal from '../fx/VideoModal';
import {
  PULSE_CTA_LABEL,
  PULSE_DESCRIPTION,
  PULSE_EMAIL,
  PULSE_HEADING,
  PULSE_VIDEOS,
} from '../lib/pulseContent';

const canPreview = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * One work sample. Shows only the poster until the visitor shows
 * intent: hovering (or keyboard focus) mounts a tiny muted loop,
 * clicking opens the full file in the modal. Nothing else is fetched.
 */
function PulseCard({ video, index, featured, onPlay }) {
  const [previewing, setPreviewing] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const allowPreview = useRef(false);

  useEffect(() => { allowPreview.current = canPreview(); }, []);

  const start = () => { if (allowPreview.current) setPreviewing(true); };
  const stop = () => { setPreviewing(false); setPreviewReady(false); };

  return (
    <li className={`pulse-card${featured ? ' pulse-card--featured' : ''}`}>
      <button
        type="button"
        className="pulse-card__button"
        data-interactive=""
        aria-label={`Play ${video.title}, ${video.duration}`}
        onClick={() => onPlay(video)}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
      >
        <span className="pulse-card__media">
          <img
            className="pulse-card__poster"
            src={video.poster}
            alt=""
            width="1280"
            height="720"
            loading={featured ? 'eager' : 'lazy'}
            decoding="async"
          />
          {previewing && (
            <video
              className={`pulse-card__preview${previewReady ? ' is-ready' : ''}`}
              src={video.previewSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onPlaying={() => setPreviewReady(true)}
            />
          )}
          <span className="pulse-card__shade" aria-hidden="true" />
          <span className="pulse-card__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          </span>
        </span>
        <span className="pulse-card__meta">
          <span className="pulse-card__index">{String(index + 1).padStart(2, '0')}</span>
          <span className="pulse-card__title">{video.title}</span>
          <span className="pulse-card__info">
            <span className="pulse-card__cta">Play</span>
            <span className="pulse-card__rule" />
            <span>{video.duration}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

function CtaButton({ className = '' }) {
  return (
    <a
      className={`pulse-cta ${className}`}
      href={`mailto:${PULSE_EMAIL}`}
      data-interactive=""
    >
      <span>{PULSE_CTA_LABEL}</span>
      <span className="pulse-cta__arrow" aria-hidden="true">→</span>
    </a>
  );
}

/**
 * Pulse portfolio. Rendered two ways:
 *   - standalone at /pulse (outreach link — no intro, page scroll)
 *   - in-flow on the homepage after choosing Pulse in the split
 */
export default function PulseSection({ standalone = false }) {
  const [playing, setPlaying] = useState(null);
  const Heading = standalone ? 'h1' : 'h2';

  return (
    <section
      data-section="pulse"
      className={`pulse${standalone ? ' pulse--standalone' : ''}`}
      aria-labelledby="pulse-heading"
    >
      <header className="pulse__intro">
        <p className="pulse__eyebrow">
          <span className="pulse__eyebrow-rule" aria-hidden="true" />
          Pulse
        </p>
        <Heading id="pulse-heading" className="pulse__heading">
          {PULSE_HEADING}
        </Heading>
        <p className="pulse__description">{PULSE_DESCRIPTION}</p>
        <CtaButton />
      </header>

      <ul className="pulse__grid" aria-label="Work samples">
        {PULSE_VIDEOS.map((v, i) => (
          <PulseCard key={v.id} video={v} index={i} featured={i === 0} onPlay={setPlaying} />
        ))}
      </ul>

      <footer className="pulse__outro">
        <p className="pulse__outro-line">Have an event or launch coming up?</p>
        <CtaButton className="pulse-cta--quiet" />
        <a className="pulse__email" href={`mailto:${PULSE_EMAIL}`} data-interactive="">
          {PULSE_EMAIL}
        </a>
      </footer>

      <VideoModal
        src={playing?.src}
        poster={playing?.poster}
        label={playing?.title}
        open={!!playing}
        onClose={() => setPlaying(null)}
      />
    </section>
  );
}
