import React,{useMemo} from 'react';
import * as THREE from 'three';
import {TimeOfDay} from '../../types';
import {getConiferTexture} from './Casa01ForestTextures';
interface Props{position:[number,number,number];scale?:[number,number,number];variant?:0|1|2|3;timeOfDay?:TimeOfDay;type?:'near'|'mid'|'far';customTint?:string}
export const CrossedConiferTree:React.FC<Props>=({position,scale=[1,1,1],variant=0,timeOfDay='DAY',type='near',customTint})=>{
const texture=useMemo(()=>getConiferTexture(variant,type),[variant,type]);
const tintColor=useMemo(()=>customTint?customTint:timeOfDay==='SUNSET'?'#d4aa90':timeOfDay==='NIGHT'?'#557788':'#ffffff',[timeOfDay,customTint]);
const height=12*scale[1],width=6.2*scale[0];
return <group position={position}><mesh position={[0,height*.45,0]} castShadow={type==='near'} receiveShadow><cylinderGeometry args={[.07*scale[0],.20*scale[0],height*.9,8]}/><meshStandardMaterial color={timeOfDay==='NIGHT'?'#120e0b':'#231a14'} roughness={.9}/></mesh>{[0,Math.PI/3,2*Math.PI/3].map((angle,idx)=><mesh key={idx} position={[0,height*.5,0]} rotation={[0,angle,0]} castShadow={type==='near'} receiveShadow><planeGeometry args={[width,height]}/><meshStandardMaterial map={texture} transparent alphaTest={.25} side={THREE.DoubleSide} color={tintColor} roughness={.9} metalness={.02} depthWrite/></mesh>)}</group>;
};
