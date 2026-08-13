import * as THREE from 'three';
import { generateConiferCanvas } from './Casa01ConiferCanvas';
const textureCache = new Map<string, THREE.CanvasTexture>();
export function getConiferTexture(variant: number, type: 'near' | 'mid' | 'far'): THREE.CanvasTexture {
const key = `${type}_${variant}`;
if (textureCache.has(key)) return textureCache.get(key)!;
const canvas = generateConiferCanvas(variant, type);
const texture = new THREE.CanvasTexture(canvas);
texture.colorSpace = THREE.SRGBColorSpace;
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;
textureCache.set(key, texture);
return texture;
}
export function getMossTexture(): THREE.CanvasTexture {
const key = 'moss_ground';
if (textureCache.has(key)) return textureCache.get(key)!;
const canvas = document.createElement('canvas');
canvas.width = 512; canvas.height = 512;
const ctx = canvas.getContext('2d');
if (ctx) {
ctx.fillStyle = '#1e241b'; ctx.fillRect(0, 0, 512, 512);
let seed = 999;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
for (let i = 0; i < 2000; i++) {
const x=rnd()*512,y=rnd()*512,r=3+rnd()*12,g=40+Math.floor(rnd()*55),b=25+Math.floor(rnd()*25);
ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=`rgba(20, ${g}, ${b}, ${0.2+rnd()*0.5})`;ctx.fill();
}
}
const texture=new THREE.CanvasTexture(canvas);texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(12,12);textureCache.set(key,texture);return texture;
}
