type Props = {
  onRetry: () => void;
};

export default function WebGLFallback({ onRetry }: Props) {
  return (
    <main className="hero-fallback" role="alert">
      <div className="hero-fallback__panel">
        <p className="hero-fallback__eyebrow">CASA 01 / BOSQUE</p>
        <h1>3D unavailable</h1>
        <p>The browser could not start the WebGL hero scene.</p>
        <button type="button" onClick={onRetry}>Retry</button>
      </div>
    </main>
  );
}
