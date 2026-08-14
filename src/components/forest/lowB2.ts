import type {LowPlantItem,LowPlantKind} from './floraTypes';
const v=(s:string)=>Number(s)/100;
const r='l19|LOW_STEMS|-700|2100|85|80|85|280;l20|LOW_BROAD|800|1700|100|90|100|60;l21|LOW_STEMS|100|750|80|75|80|180;l22|LOW_BROAD|-700|650|85|80|85|220;l23|LOW_STEMS|3650|4150|90|85|90|30;l24|LOW_BROAD|-250|-1650|100|90|100|150';
export const LOW_B2:LowPlantItem[]=r.split(';').map(x=>{const p=x.split('|'),a=p.slice(2).map(v);return{id:p[0],kind:p[1] as LowPlantKind,position:[a[0],a[1]],scale:[a[2],a[3],a[4]],rotationY:a[5]};});
