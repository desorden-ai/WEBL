import React from 'react';
import {TimeOfDay} from '../../types';
import {Casa01LandscapeGround} from './Casa01LandscapeGround';
import {Casa01Midground} from './Casa01Midground';
import {Casa01DistantForest} from './Casa01DistantForest';
export const Casa01Landscaping:React.FC<{timeOfDay:TimeOfDay}>=({timeOfDay})=><group position={[0,0,0]}><Casa01LandscapeGround timeOfDay={timeOfDay}/><Casa01Midground timeOfDay={timeOfDay}/><Casa01DistantForest timeOfDay={timeOfDay}/></group>;
