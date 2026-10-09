import PulseSection from './sections/PulseSection';

// Direct-link entry for /pulse: straight to the work, no loader,
// mesh intro, or split screen. The wordmark leads back to the full
// site for anyone who wants to see Speed and Focus.
export default function PulsePage() {
  return (
    <div className="pulse-page">
      <nav className="pulse-page__bar" aria-label="Site">
        <a className="pulse-page__mark" href="/" data-interactive="" aria-label="Veloure home">
          <span className="pulse-page__wordmark">Veloure</span>
          <span className="pulse-page__divider" aria-hidden="true" />
          <span className="pulse-page__studio">Studio</span>
        </a>
        <a className="pulse-page__home" href="/" data-interactive="">
          All work
        </a>
      </nav>
      <main>
        <PulseSection standalone />
      </main>
    </div>
  );
}
