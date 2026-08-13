import {drawTrunk,drawTier,TreeType} from './Casa01ConiferDraw';
export function generateConiferCanvas(variant:number,type:TreeType):HTMLCanvasElement{
 const canvas=document.createElement('canvas');canvas.width=type==='near'?512:type==='mid'?384:256;canvas.height=type==='near'?1024:type==='mid'?768:512;
 const ctx=canvas.getContext('2d');if(!ctx)return canvas;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
 let seed=(variant+1)*777+(type==='near'?10:type==='mid'?20:30);const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};const cx=w/2;
 drawTrunk(ctx,w,h,cx,variant);
 const start=h*(variant===1?.62:variant===3?.68:.72),end=h*.06,tiers=variant===2?26:22;
 for(let i=0;i<tiers;i++){const t=i/(tiers-1),y=start-t*(start-end);drawTier(ctx,w,h,cx,variant,type,t,y,rnd)}
 ctx.beginPath();ctx.arc(cx,end,w*.012,0,Math.PI*2);ctx.fillStyle='rgba(18, 48, 28, 0.95)';ctx.fill();
 const fade=ctx.createLinearGradient(0,h*.88,0,h);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');ctx.globalCompositeOperation='destination-out';ctx.fillStyle=fade;ctx.fillRect(0,h*.88,w,h*.12);ctx.globalCompositeOperation='source-over';return canvas;
}
