import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSolPbrTextures } from '../materials/useSolPbrTextures';

interface TerrainBlockoutProps { showGrid?: boolean; showAxes?: boolean; wireframeMode?: boolean; }
function createTerrainGeometry(width:number,height:number,segX:number,segY:number,centerWorldX:number,centerWorldZ:number):THREE.PlaneGeometry {
  const geom=new THREE.PlaneGeometry(width,height,segX,segY); const pos=geom.attributes.position; const uv=geom.attributes.uv; const tile=2.8; const angle=0.48; const cosA=Math.cos(angle),sinA=Math.sin(angle);
  for(let i=0;i<pos.count;i++){ const lx=pos.getX(i),ly=pos.getY(i); const wx=centerWorldX+lx,wz=centerWorldZ-ly; uv.setXY(i,(wx*cosA-wz*sinA)/tile,(wx*sinA+wz*cosA)/tile); }
  uv.needsUpdate=true; return geom;
}
export const TerrainBlockout:React.FC<TerrainBlockoutProps>=({showGrid=false,showAxes=false,wireframeMode=false})=>{
  const {map,roughnessMap}=useSolPbrTextures('01_forest_ground',{repeat:[0.25,0.25],enableNormal:false});
  const plane1Geom=useMemo(()=>createTerrainGeometry(140,140,32,32,0,0),[]); const plane2Geom=useMemo(()=>createTerrainGeometry(80,50,16,16,10,20),[]); const plane3Geom=useMemo(()=>createTerrainGeometry(160,60,16,16,0,-35),[]);
  const material=(<meshStandardMaterial map={map} normalMap={null} roughnessMap={roughnessMap} roughness={0.85} metalness={0} wireframe={wireframeMode}/>);
  return <group name="Environment_Terrain_Massing">
    <mesh geometry={plane1Geom} position={[0,-0.1,0]} rotation={[-Math.PI/2-0.02,0.015,-0.01]} receiveShadow>{material}</mesh>
    <mesh geometry={plane2Geom} position={[10,-0.3,20]} rotation={[-Math.PI/2-0.01,-0.01,0.02]} receiveShadow>{material}</mesh>
    <mesh geometry={plane3Geom} position={[0,0.8,-35]} rotation={[-Math.PI/2-0.04,0.02,0]} receiveShadow>{material}</mesh>
    {showGrid&&<gridHelper args={[80,80,'#38bdf8','#52525b']} position={[0,0.01,0]}/>} {showAxes&&<axesHelper args={[10]} position={[0,0.05,0]}/>} </group>;
};
