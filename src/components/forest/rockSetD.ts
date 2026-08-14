import type { RockData, RockVariant } from './RockData';
const val=(s:string)=>s.startsWith('n')?-Number(s.slice(1)):Number(s);
const raw='periph-01|ROCK_A|28|6|0.65|0.5|0.6|0.1|0.9|0|0.22;periph-02|ROCK_C|25|2|0.72|0.35|0.7|n0.1|1.6|0.1|0.35;periph-03|LARGE_A|n22|5|2|1.6|1.8|0.2|0.5|n0.1|0.30;periph-04|ROCK_A|n20|8|0.6|0.48|0.52|0|1.2|0|0.25;periph-05|ROCK_A|6.8|7.5|0.42|0.35|0.4|0.15|2|0.1|0.28';
export const ROCK_SET_D:RockData[]=raw.split(';').map((row)=>{const p=row.split('|');const n=p.slice(2).map(val);return{id:p[0],variant:p[1] as RockVariant,position:[n[0],n[1]],scale:[n[2],n[3],n[4]],rotation:[n[5],n[6],n[7]],embedRatio:n[8]};});
