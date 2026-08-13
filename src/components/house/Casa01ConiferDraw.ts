export type TreeType='near'|'mid'|'far';
export function drawTrunk(ctx:CanvasRenderingContext2D,w:number,h:number,cx:number,variant:number){
 const bottom=h*.94,top=h*.05,bw=w*(variant===2?.024:.032);
 ctx.beginPath();ctx.moveTo(cx-bw/2,bottom);ctx.lineTo(cx+bw/2,bottom);ctx.lineTo(cx+1,top);ctx.lineTo(cx-1,top);ctx.closePath();
 const g=ctx.createLinearGradient(cx-bw,0,cx+bw,0);g.addColorStop(0,'#16100c');g.addColorStop(.5,'#281f18');g.addColorStop(1,'#120d09');ctx.fillStyle=g;ctx.fill();
}
export function drawTier(ctx:CanvasRenderingContext2D,w:number,h:number,cx:number,variant:number,type:TreeType,t:number,y:number,rnd:()=>number){
 let reach=.32;
 if(variant===0)reach=.30*Math.pow(1-t,.75)+.04;
 else if(variant===1)reach=t<.25?.18:.35*Math.sin((t-.2)*Math.PI*1.2)+.06;
 else if(variant===2)reach=.22*Math.pow(1-t,.6)+.03;
 else reach=.31*Math.pow(1-t,.7)+.05+Math.sin(t*Math.PI*3.5)*.08;
 const left=w*reach*(.65+rnd()*.65),right=w*reach*(.65+rnd()*.65);
 if(rnd()<.12&&t>.15&&t<.85)return;
 [-1,1].forEach(dir=>{
  const len=dir===-1?left:right;if(len<w*.02)return;
  const ex=cx+dir*len,droop=h*(variant===0?.018:.010)*(1-t*.5),ey=y+droop;
  ctx.beginPath();ctx.moveTo(cx,y);ctx.quadraticCurveTo(cx+dir*len*.5,y+droop*.4,ex,ey);ctx.strokeStyle='#18120e';ctx.lineWidth=Math.max(1,(1-t)*(type==='near'?3.5:2));ctx.stroke();
  const count=4+Math.floor(rnd()*5);
  for(let c=0;c<count;c++){
   const frac=(c+1)/count,sx=cx+dir*len*frac+(rnd()-.5)*(w*.015),sy=y+droop*frac+(rnd()-.5)*(h*.012),rx=(len*.28)*(1-t*.4)*(.6+rnd()*.6),ry=rx*(.38+rnd()*.25);
   const gv=Math.floor(28+rnd()*32+t*20),rv=Math.floor(14+rnd()*16),bv=Math.floor(18+rnd()*18),alpha=.72+rnd()*.28;
   ctx.save();ctx.beginPath();const angle=(rnd()-.5)*.35+dir*.1;ctx.ellipse(sx,sy,Math.max(2,rx),Math.max(1.5,ry),angle,0,Math.PI*2);ctx.fillStyle=`rgba(${rv}, ${gv}, ${bv}, ${alpha})`;ctx.fill();
   if(type!=='far'&&rnd()>.3){ctx.strokeStyle=`rgba(${rv+12}, ${gv+18}, ${bv+12}, 0.55)`;ctx.lineWidth=1.2;const n=type==='near'?5:2;for(let k=0;k<n;k++){const nx=sx+(rnd()-.5)*rx*1.1,ny=sy+(rnd()-.5)*ry*.8;ctx.beginPath();ctx.moveTo(nx,ny);ctx.lineTo(nx+(rnd()-.5)*6,ny-3-rnd()*5);ctx.stroke();}}
   ctx.restore();
  }
 });
}
