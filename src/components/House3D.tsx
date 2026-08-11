import React from 'react';
import { HouseState } from '../types';
import { Casa01House } from './house/Casa01House';
import type { Casa01FloorKey, Casa01ViewMode } from '../data/casa01Canonical';

interface House3DProps {
  state: HouseState;
}

export const House3D: React.FC<House3DProps> = ({ state }) => {
  const floorMap: Record<string, Casa01FloorKey | null> = {
    all: null,
    level1: 'ground',
    level2: 'level1',
    level3: 'loft',
  };

  const floorIsolation = floorMap[state.activeFloor] ?? null;

  let viewMode: Casa01ViewMode = 'exterior';
  if (state.viewMode === 'dollhouse') viewMode = 'dollhouse';
  if (state.hideRoof) viewMode = 'roof-hide';

  return (
    <Casa01House
      progress={state.constructionProgress}
      viewMode={viewMode}
      floorIsolation={floorIsolation}
      timeOfDay={state.timeOfDay}
    />
  );
};
