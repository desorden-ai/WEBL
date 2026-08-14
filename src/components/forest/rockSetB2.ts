import type { RockData, RockVariant } from './RockData';
const val=(s:string)=>s.startsWith('n')?-Number(s.slice(1)):Number(s);
const raw='lf-big-01|LARGE_A|n14|18|1.8|1.5|1.7|0.15|1.1|0.1|0.28;lf-rock-02|ROCK_B|n11.5|21|1.2|0.95|1.1|n0.05|0.3|0.15|0.25;lf-rock-03|ROCK_A|n16.2|16|0.52|0.42|0.48|0.1|1.9|n0.1|0.22;lf-rock-04|ROCK_C|n9.5|24|0.65|0.32|0.6|0.2|0.6|0|0.40;lf-rock-05|ROCK_A|n13|22.5|0.42|0.35|0.45|0|1.5|0.1|0.30';
export const ROCK_SET_B2:RockData[]=raw.split(';').map((row)=>{const p=row.split('|');const n=p.slice(2).map(val);return{id:p[0],variant:p[1] as RockVariant,position:[n[0],n[1]],scale:[n[2],n[3],n[4]],rotation:[n[5],n[6],n[7]],embedRatio:n[8]};});
