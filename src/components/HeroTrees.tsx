import React from 'react';
import { HERO_TREES_DATA } from './forest/heroTreesData';
import { HeroConifer } from './forest/HeroConifer';

interface HeroTreesProps { wireframeMode?: boolean; }

export const HeroTrees: React.FC<HeroTreesProps> = ({ wireframeMode = false }) => (
  <group name="Hero_Conifer_Trees_Phase02_FinalRefinement">
    {HERO_TREES_DATA.map((tree) => <HeroConifer key={tree.id} tree={tree} wireframeMode={wireframeMode} />)}
  </group>
);
