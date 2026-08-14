export type RockVariant='ROCK_A'|'ROCK_B'|'ROCK_C'|'LARGE_A'|'LARGE_B';
export interface RockData{id:string;variant:RockVariant;position:[number,number];scale:[number,number,number];rotation:[number,number,number];embedRatio:number;}
export function getTerrainHeight(x:number,z:number):number{let y=-0.1+z*0.02-x*0.015;if(z<-10){const f=Math.min(1,(-10-z)/25);y=y*(1-f)+(0.8+(z+35)*0.04-x*0.02)*f;}else if(z>15&&x>-5){const f=Math.min(1,(z-15)/25);y+=f*0.15*Math.sin((x+z)*0.05);}return y;}
