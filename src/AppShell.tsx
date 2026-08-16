import { useState } from 'react';
import App from './App';
import { ExperienceControlsGuide } from './components/ExperienceControlsGuide';
import { ProgressiveModelViewer } from './components/ProgressiveModelViewer';
import type { GraphicsQuality } from './types';

function getDefaultQuality(): GraphicsQuality {
  if (typeof window === 'undefined') return 'medium';
  const mobileLike = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  return mobileLike ? 'low' : 'medium';
}

export default function AppShell() {
  const [quality, setQuality] = useState<GraphicsQuality>(getDefaultQuality);

  return (
    <>
      <App />
      <ExperienceControlsGuide quality={quality} onQualityChange={setQuality} />
      <ProgressiveModelViewer quality={quality} />
    </>
  );
}
