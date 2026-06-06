import MeshBackground from './MeshBackground';

export default function LoadingOverlay({ leaving }) {
  return (
    <div className={`loader-overlay${leaving ? ' loader-overlay--leaving' : ''}`}>
      <div className="loader-overlay__mesh" aria-hidden="true">
        {/* Mesh stays mounted through the leaving fade so the overlay
            doesn't pop to black at the 3s mark — we trade ~950ms of
            extra WebGL during the fade for a clean visual handoff. */}
        <MeshBackground context="loader" />
      </div>
    </div>
  );
}
