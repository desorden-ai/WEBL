import { CSSProperties } from 'react';
import {
  CINEMATIC_INTRO,
  cinematicAsset,
  smoothstep,
} from '../data/cinematicIntro';

interface DepthTransitionProps {
  progress: number;
}

const layerStyle = (
  src: string,
  translateX: number,
  translateY: number,
  scale: number,
  opacity = 1
): CSSProperties => ({
  position: 'absolute',
  inset: '-1.5%',
  width: '103%',
  height: '103%',
  objectFit: 'cover',
  objectPosition: 'center',
  transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
  transformOrigin: 'center',
  opacity,
  willChange: 'transform, opacity',
  pointerEvents: 'none',
});

export function DepthTransition({ progress }: DepthTransitionProps) {
  const intro = CINEMATIC_INTRO;
  const p = smoothstep(intro.depthStartProgress, intro.depthEndProgress, progress);
  const fadeTo3D = 1 - smoothstep(intro.threeStartProgress, 0.985, progress);
  const opacity = Math.max(0, Math.min(1, p * fadeTo3D));

  if (opacity <= 0.001) return null;

  const drift = p;
  const foregroundX = -intro.parallaxPx.foreground * drift;
  const houseX = -intro.parallaxPx.house * drift;
  const midgroundX = -intro.parallaxPx.midground * drift;
  const backgroundX = intro.parallaxPx.background * drift;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity,
        pointerEvents: 'none',
        willChange: 'opacity',
      }}
    >
      <img
        src={cinematicAsset(intro.assets.background)}
        alt=""
        draggable={false}
        style={layerStyle(intro.assets.background, backgroundX, -0.5 * drift, 1.018)}
      />
      <img
        src={cinematicAsset(intro.assets.midground)}
        alt=""
        draggable={false}
        style={layerStyle(intro.assets.midground, midgroundX, 0, 1.022)}
      />
      <img
        src={cinematicAsset(intro.assets.house)}
        alt=""
        draggable={false}
        style={layerStyle(intro.assets.house, houseX, 0.25 * drift, 1.024)}
      />
      <img
        src={cinematicAsset(intro.assets.foreground)}
        alt=""
        draggable={false}
        style={layerStyle(intro.assets.foreground, foregroundX, 0.6 * drift, 1.03)}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 48%, rgba(0,0,0,0) 32%, rgba(2,8,6,0.22) 100%)',
          opacity: 0.18 + 0.28 * drift,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
