import type { GraphicsQuality } from '../types';

interface ExperienceControlsGuideProps {
  quality: GraphicsQuality;
  onQualityChange: (quality: GraphicsQuality) => void;
}

export function ExperienceControlsGuide({
  quality,
  onQualityChange,
}: ExperienceControlsGuideProps) {
  return (
    <aside
      className="fixed left-3 bottom-3 z-40 hidden max-w-[min(34rem,calc(100vw-1.5rem))] items-center gap-3 rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-[11px] text-white/80 shadow-lg backdrop-blur-md md:flex"
      aria-label="Guía de controles y calidad gráfica"
    >
      <span className="whitespace-nowrap">
        Scroll/arrastre: recorrer · ←/→: navegar · Espacio: auto · M: audio · H: interfaz
      </span>
      <span className="h-4 w-px bg-white/15" aria-hidden="true" />
      <label className="flex items-center gap-2 whitespace-nowrap">
        <span>Calidad 3D</span>
        <select
          value={quality}
          onChange={(event) => onQualityChange(event.target.value as GraphicsQuality)}
          className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-white outline-none focus:border-emerald-300"
        >
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </label>
    </aside>
  );
}
