import React from 'react';
import {TimeOfDay,NavigationMode,CameraPreset} from '../../types';
import {Casa01PresentationHeader} from './Casa01PresentationHeader';
import {Casa01PresentationFooter} from './Casa01PresentationFooter';
import {Casa01InfoOverlay} from './Casa01InfoOverlay';
import {useCasaFullscreen} from './useCasaFullscreen';
interface Props{timeOfDay:TimeOfDay;setTimeOfDay:(t:TimeOfDay)=>void;mode:NavigationMode;setMode:(m:NavigationMode)=>void;preset:CameraPreset;setPreset:(p:CameraPreset)=>void;showInfo:boolean;setShowInfo:(s:boolean)=>void}
export const Casa01PresentationDock:React.FC<Props>=(p)=>{const{isFullscreen,toggleFullscreen}=useCasaFullscreen();return <><Casa01PresentationHeader timeOfDay={p.timeOfDay} setTimeOfDay={p.setTimeOfDay} isFullscreen={isFullscreen} toggleFullscreen={()=>{void toggleFullscreen()}}/><Casa01PresentationFooter mode={p.mode} setMode={p.setMode} preset={p.preset} setPreset={p.setPreset} showInfo={p.showInfo} setShowInfo={p.setShowInfo}/><Casa01InfoOverlay show={p.showInfo} close={()=>p.setShowInfo(false)}/></>};
