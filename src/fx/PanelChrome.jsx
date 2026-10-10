/**
 * The text + controls laid over every full-screen piece of footage:
 * the category intro, each film panel, and the outro's first state.
 * One component so type, spacing, scrims, and controls stay identical
 * across Speed, Focus, and Pulse.
 *
 *   eyebrow     — small mono line ("Pulse · 01 / 03")
 *   title       — optional heading
 *   display     — true = large display face (category intro)
 *   description — optional mono line under the title
 *   onPlay      — shows a "Play with sound" button when given
 *   duration    — shown inside the play button
 *   next        — { label, onClick } → bottom-right scroll cue
 *   style       — merged onto the root (e.g. opacity for the outro)
 */
export function PlayIcon({ size = 12 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
    </svg>
  );
}

export default function PanelChrome({
  eyebrow,
  title,
  titleAs: TitleTag = 'h2',
  display = false,
  description,
  onPlay,
  playLabel = 'Play with sound',
  duration,
  next,
  interactive = true,
  style,
}) {
  return (
    <div className="chrome" style={style}>
      <div className="chrome__scrim" aria-hidden="true" />
      <div className="chrome__bar">
        <div className="chrome__text">
          {eyebrow && <p className="chrome__eyebrow">{eyebrow}</p>}
          {title && (
            <TitleTag className={display ? 'chrome__title chrome__title--display' : 'chrome__title'}>
              {title}
            </TitleTag>
          )}
          {description && <p className="chrome__description">{description}</p>}
          {onPlay && (
            <button
              type="button"
              className="chrome__play"
              data-interactive=""
              tabIndex={interactive ? 0 : -1}
              onClick={(e) => { e.stopPropagation(); onPlay(); }}
            >
              <span className="chrome__play-icon"><PlayIcon /></span>
              <span>{playLabel}</span>
              {duration && <span className="chrome__play-duration">{duration}</span>}
            </button>
          )}
        </div>
        {next && (
          <button
            type="button"
            className="chrome__next"
            data-interactive=""
            tabIndex={interactive ? 0 : -1}
            onClick={(e) => { e.stopPropagation(); next.onClick(); }}
          >
            <span>{next.label}</span>
            <span className="chrome__next-line" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
