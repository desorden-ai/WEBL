import React,{useMemo} from 'react';
import * as THREE from 'three';
import {TimeOfDay} from '../../types';
import {CrossedConiferTree} from './Casa01ForestAssets';
import {getMossTexture} from './Casa01ForestTextures';
export const Casa01LandscapeGround:React.FC<{timeOfDay:TimeOfDay}>=({timeOfDay})=>{
const mossMap=useMemo(()=>getMossTexture(),[]);const groundGeometry=useMemo(()=>{const geo=new THREE.PlaneGeometry(160,160,64,64);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),d=Math.sqrt(x*x+z*z);if(d<12)pos.setY(i,0);else{const wave=Math.sin(x*.06)*Math.cos(z*.06)*.14,fade=Math.min((d-12)/20,1);pos.setY(i,wave*fade)}}geo.computeVertexNormals();return geo},[]);
const heroes:{position:[number,number,number];scale:[number,number,number];variant:0|1|2|3}[]=[{position:[-22,0,16],scale:[1,1.05,1],variant:0},{position:[23,0,18],scale:[.95,1,.95],variant:1},{position:[-26,0,-2],scale:[1,1,1],variant:2},{position:[26,0,2],scale:[.98,1,.98],variant:3},{position:[-23,0,-20],scale:[1.02,1.02,1.02],variant:1},{position:[24,0,-22],scale:[.96,.98,.96],variant:0}];
return <><mesh geometry={groundGeometry} receiveShadow><meshStandardMaterial map={mossMap} color={timeOfDay==='NIGHT'?'#141814':timeOfDay==='SUNSET'?'#2d3326':'#283325'} roughness={.92} metalness={.02}/></mesh><mesh position={[0,.02,0]} receiveShadow><boxGeometry args={[20.5,.03,13.5]}/><meshStandardMaterial color="#191a17" roughness={.95}/></mesh><mesh position={[0,.01,0]} receiveShadow><boxGeometry args={[23,.02,16]}/><meshStandardMaterial color="#21221c" roughness={.92}/></mesh>{heroes.map((h,i)=><CrossedConiferTree key={i} position={h.position} scale={h.scale} variant={h.variant} timeOfDay={timeOfDay} type="near"/>)}</>};
