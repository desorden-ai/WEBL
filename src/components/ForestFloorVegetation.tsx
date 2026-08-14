import React from 'react';
import {MossLayer} from './forest/MossLayer';
import {FernLayer} from './forest/FernLayer';
import {LowPlantLayer} from './forest/LowPlantLayer';
export const ForestFloorVegetation:React.FC<{wireframeMode?:boolean}>=({wireframeMode=false})=><group name="Environment_Forest_Floor_Vegetation_Phase06"><MossLayer wireframeMode={wireframeMode}/><FernLayer wireframeMode={wireframeMode}/><LowPlantLayer wireframeMode={wireframeMode}/></group>;
