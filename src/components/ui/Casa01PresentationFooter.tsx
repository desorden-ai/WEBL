import React from 'react';
import {NavigationMode,CameraPreset} from '../../types';
import {Casa01ModeSwitcher} from './Casa01ModeSwitcher';
import {Casa01PresetStrip} from './Casa01PresetStrip';
export const Casa01PresentationFooter:React.FC<{mode:NavigationMode;setMode:(m:NavigationMode)=>void;preset:CameraPreset;setPreset:(p:CameraPreset)=>void;showInfo:boolean;setShowInfo:(s:boolean)=>void}>=p=><footer className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 pointer-events-none z-10"><Casa01ModeSwitcher mode={p.mode} setMode={p.setMode}/><Casa01PresetStrip preset={p.preset} setPreset={p.setPreset} showInfo={p.showInfo} setShowInfo={p.setShowInfo}/></footer>;
