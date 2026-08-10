export type ViewMode = 'exterior' | 'dollhouse' | 'plan';

export type FloorLevel = 'all' | 'level1' | 'level2' | 'level3';

export type TimeOfDay = 'day' | 'sunset' | 'night';

export type CameraPreset = 
  | 'overview'
  | 'front'
  | 'balcony'
  | 'level1_interior'
  | 'level2_interior'
  | 'top_down';

export interface ConstructionStage {
  id: string;
  name: string;
  minProgress: number;
  maxProgress: number;
  description: string;
}

export interface HouseState {
  viewMode: ViewMode;
  activeFloor: FloorLevel;
  constructionProgress: number; // 0 to 100
  timeOfDay: TimeOfDay;
  hideRoof: boolean;
  showLandscaping: boolean;
  interiorLightsOn: boolean;
  autoRotate: boolean;
  useApprovedExteriorModel: boolean; // Must remain false
}

export const STAGES: ConstructionStage[] = [
  {
    id: 'foundation',
    name: '1. Foundation & Deck',
    minProgress: 0,
    maxProgress: 20,
    description: 'Site excavation, concrete footings, ground slab & terrace platform',
  },
  {
    id: 'structure',
    name: '2. Steel Structural Frame',
    minProgress: 20,
    maxProgress: 40,
    description: 'Black steel I-beam columns, floor beams & structural framing grid',
  },
  {
    id: 'envelope',
    name: '3. Walls & Roof Framing',
    minProgress: 40,
    maxProgress: 60,
    description: 'Interior wall framing, exterior panel substructure & gabled roof truss',
  },
  {
    id: 'cladding',
    name: '4. Façade & Glazing',
    minProgress: 60,
    maxProgress: 80,
    description: 'Dark vertical-seam panels, glass curtain walls & side windows',
  },
  {
    id: 'interiors',
    name: '5. Fit-out & Landscaping',
    minProgress: 80,
    maxProgress: 100,
    description: 'Wood flooring, kitchen, luxury bathroom, designer furniture & trees',
  },
];
