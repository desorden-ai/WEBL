import React from 'react';
import { MidTrunks } from './forest/MidTrunks';
import { MidFoliage } from './forest/MidFoliage';

interface MidgroundForestProps { wireframeMode?: boolean; }
export const MidgroundForest: React.FC<MidgroundForestProps> = ({ wireframeMode = false }) => (
  <group name="Midground_Forest_Phase03">
    <MidTrunks wireframeMode={wireframeMode} />
    <MidFoliage wireframeMode={wireframeMode} />
  </group>
);
