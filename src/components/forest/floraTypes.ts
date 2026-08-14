export type MossKind='MOSS_A'|'MOSS_B';
export type FernKind='FERN_S'|'FERN_M'|'FERN_L'|'FERN_C';
export type LowPlantKind='LOW_STEMS'|'LOW_BROAD';
export interface MossItem{id:string;kind:MossKind;position:[number,number];scale:[number,number,number];rotationY:number;}
export interface FernItem{id:string;kind:FernKind;position:[number,number];scale:[number,number,number];rotationY:number;tiltX?:number;tiltZ?:number;}
export interface LowPlantItem{id:string;kind:LowPlantKind;position:[number,number];scale:[number,number,number];rotationY:number;}
