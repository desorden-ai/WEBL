import type { RockData, RockVariant } from './RockData';
const val=(s:string)=>s.startsWith('n')?-Number(s.slice(1)):Number(s);
const raw='rear-big-01|LARGE_A|n10.5|n12|1.9|1.4|1.6|0.1|2.2|n0.1|0.32;rear-big-02|LARGE_B|8|n15|2.2|1.5|1.9|n0.1|0.8|0.05|0.35;rear-rock-03|ROCK_B|n4|n14|1|0.8|0.9|0.15|1.3|n0.1|0.25;rear-rock-04|ROCK_A|10.5|n13.5|0.55|0.45|0.5|0.05|0.4|0.1|0.20;rear-rock-05|ROCK_C|n12|n8|0.85|0.42|0.8|0.2|1.7|n0.05|0.42';
export const ROCK_SET_C:RockData[]=raw.split(';').map((row)=>{const p=row.split('|');const n=p.slice(2).map(val);return{id:p[0],variant:p[1] as RockVariant,position:[n[0],n[1]],scale:[n[2],n[3],n[4]],rotation:[n[5],n[6],n[7]],embedRatio:n[8]};});
