import type {LowPlantItem,LowPlantKind} from './floraTypes';
const v=(s:string)=>Number(s)/100;
const r='l13|LOW_STEMS|2320|2580|90|85|90|70;l14|LOW_BROAD|-1380|1420|100|90|100|250;l15|LOW_STEMS|-980|-820|85|80|85|140;l16|LOW_BROAD|2200|1000|100|90|100|10;l17|LOW_STEMS|-1800|1600|90|85|90|200;l18|LOW_BROAD|2600|400|95|90|95|120';
export const LOW_B1:LowPlantItem[]=r.split(';').map(x=>{const p=x.split('|'),a=p.slice(2).map(v);return{id:p[0],kind:p[1] as LowPlantKind,position:[a[0],a[1]],scale:[a[2],a[3],a[4]],rotationY:a[5]};});
