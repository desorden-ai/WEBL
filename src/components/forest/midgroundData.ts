export interface MidgroundTreeData { id: string; position: [number, number, number]; height: number; trunkRadiusBase: number; bareTrunkHeight: number; maxCrownRadius: number; rotationY: number; tiltAngleX: number; tiltAngleZ: number; variant: number; seed: number; }
export interface FoliageSpray { pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number]; colorVariant: number; }
function createPRNG(seed: number) { let s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function getGroundY(x: number, z: number): number { let y = -0.1 - z * 0.02 + x * 0.012; if (z < -25) y += (-25 - z) * 0.025; return y; }
const HERO_POSITIONS: [number, number][] = [[17,30],[24,25],[-13,15],[15,9],[-9,-9],[11,-11],[-2.5,-18]];

export function generateMidgroundTrees(): MidgroundTreeData[] {
  const rng = createPRNG(3003); const trees: MidgroundTreeData[] = [];
  const distanceToHero = (x:number,z:number) => Math.min(...HERO_POSITIONS.map(([hx,hz]) => Math.hypot(x-hx,z-hz)));
  function isInsideHouseExclusion(x:number,z:number) { const dx=Math.max(0,Math.abs(x)-7.6); const dz=Math.max(0,Math.abs(z)-3.9); const angle=Math.atan2(z,x); const margin=5.8+1.2*Math.sin(angle*3+1.2)+0.6*Math.cos(angle*5); return Math.hypot(dx,dz)<margin; }
  function isInCameraCorridor(x:number,z:number) { if(z<2)return false; const x1=39,z1=54,x2=0,z2=-2; const l2=(x2-x1)**2+(z2-z1)**2; let t=((x-x1)*(x2-x1)+(z-z1)*(z2-z1))/l2; t=Math.max(0,Math.min(1,t)); return Math.hypot(x-(x1+t*(x2-x1)),z-(z1+t*(z2-z1)))<6.8; }
  function valid(x:number,z:number) { if(isInsideHouseExclusion(x,z)||distanceToHero(x,z)<3.2||isInCameraCorridor(x,z)) return false; for(const t of trees) if(Math.hypot(x-t.position[0],z-t.position[2])<3.2)return false; return true; }
  const zones:{bounds:[number,number,number,number];count:number}[]=[
    {bounds:[-26,26,-23,-15],count:5},{bounds:[-33,33,-33,-23],count:9},{bounds:[-36,36,-44,-33],count:7},{bounds:[-36,-15,-12,22],count:7},{bounds:[15,36,-12,22],count:7},{bounds:[-35,35,22,42],count:3}
  ];
  let treeIdCount=1;
  for(const zc of zones){ let placed=0,attempts=0; while(placed<zc.count&&attempts<400){ attempts++; const [minX,maxX,minZ,maxZ]=zc.bounds; const rx=minX+rng()*(maxX-minX), rz=minZ+rng()*(maxZ-minZ); if(!valid(rx,rz))continue; const hRoll=rng(); let height=hRoll<0.25?16.5+rng()*3.5:hRoll<0.85?20+rng()*5:25+rng()*2; const trunkRadiusBase=0.17+rng()*0.07; const bareTrunkHeight=height*(0.36+rng()*0.08); const maxCrownRadius=1.25+rng()*0.55; const rotationY=rng()*Math.PI*2; const tiltAngleX=(rng()-0.5)*0.024, tiltAngleZ=(rng()-0.5)*0.024; const variant=Math.floor(rng()*4); const ry=getGroundY(rx,rz); trees.push({id:`midground-tree-${String(treeIdCount++).padStart(2,'0')}`,position:[Number(rx.toFixed(2)),Number(ry.toFixed(2)),Number(rz.toFixed(2))],height:Number(height.toFixed(2)),trunkRadiusBase:Number(trunkRadiusBase.toFixed(2)),bareTrunkHeight:Number(bareTrunkHeight.toFixed(2)),maxCrownRadius:Number(maxCrownRadius.toFixed(2)),rotationY:Number(rotationY.toFixed(2)),tiltAngleX:Number(tiltAngleX.toFixed(3)),tiltAngleZ:Number(tiltAngleZ.toFixed(3)),variant,seed:3000+treeIdCount}); placed++; }}
  return trees;
}

export function generateSpraysForTree(tree: MidgroundTreeData): FoliageSpray[] {
  const rng=createPRNG(tree.seed), sprays:FoliageSpray[]=[]; const {height,bareTrunkHeight,maxCrownRadius,variant}=tree; const crownHeight=height-bareTrunkHeight; const sprayCounts=[34,28,32,38]; const total=sprayCounts[variant%4]; const golden=2.39996; const nodes=Math.floor(total/2); let generated=0;
  for(let i=0;i<nodes&&generated<total-1;i++){ const p=i/Math.max(1,nodes-1); const yLocal=bareTrunkHeight+p*crownHeight*0.94; const profile=p<0.45?0.45+0.55*Math.sin((p/0.45)*(Math.PI/2)):Math.pow(Math.max(0,1-(p-0.45)/0.55),0.85); const localMax=Math.max(0.35,maxCrownRadius*Math.max(0.18,profile)); const branchLength=localMax*(0.80+rng()*0.30); const azimuth=i*golden+(rng()-0.5)*0.35; let n=p>=0.3&&p<=0.7?(rng()<0.7?2:3):p>0.85?1:2; n=Math.min(n,total-1-generated); for(let g=0;g<n;g++){ const frac=(g+0.65)/(n+0.35); const radial=branchLength*frac*(0.85+rng()*0.25); const offX=Math.cos(azimuth)*radial, offZ=Math.sin(azimuth)*radial, yOffset=(rng()-0.5)*0.18*(1-p); const pitch=-0.25+p*0.35+(rng()-0.5)*0.10, yaw=azimuth+(rng()-0.5)*0.18, roll=(rng()-0.5)*0.22; const length=branchLength*(0.50+frac*0.45)*(0.85+rng()*0.25), width=Math.max(0.32,localMax*(0.35+(1-g*0.15)*0.25)), thickness=Math.max(0.14,0.18+(1-p)*0.14); sprays.push({pos:[offX,yLocal+yOffset,offZ],rot:[pitch,yaw,roll],scale:[width,thickness,length],colorVariant:Math.floor(rng()*3)}); generated++; }}
  sprays.push({pos:[0,height-0.12,0],rot:[0,rng()*Math.PI,0],scale:[0.22,0.95,0.22],colorVariant:0}); return sprays;
}
export const MIDGROUND_TREES_DATA = generateMidgroundTrees();
