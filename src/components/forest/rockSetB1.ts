import type { RockData, RockVariant } from './RockData';
const raw='rf-big-01|LARGE_B|16.5|14|2.1|1.4|1.8|0.1|0.45|-0.05|0.30;rf-rock-02|ROCK_B|14.2|16.5|1.1|0.9|1|-0.1|1.8|0.1|0.26;rf-rock-03|ROCK_A|18|12.5|0.6|0.5|0.55|0.2|2.3|0|0.20;rf-rock-04|ROCK_C|15|10|0.8|0.4|0.75|0.05|0.7|-0.1|0.35';
export const ROCK_SET_B1:RockData[]=raw.split(';').map((row)=>{const p=row.split('|');const n=p.slice(2).map(Number);return{id:p[0],variant:p[1] as RockVariant,position:[n[0],n[1]],scale:[n[2],n[3],n[4]],rotation:[n[5],n[6],n[7]],embedRatio:n[8]};});
