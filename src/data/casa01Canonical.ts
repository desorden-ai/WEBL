export type Casa01FloorKey = 'ground' | 'level1' | 'loft';
export type Casa01ViewMode = 'exterior' | 'dollhouse' | 'floor-ground' | 'floor-level1' | 'floor-loft' | 'roof-hide';
export type TimeOfDay = 'day' | 'sunset' | 'night';

export interface RoomInfo {
  id: string;
  name: string;
  floor: Casa01FloorKey;
  floorName: string;
  dimensions: string;
  description: string;
  position: [number, number, number];
  cameraTarget: [number, number, number];
}

export const CASA01 = {
  name: 'Casa 01',
  codeName: 'SOL — CASA 01',
  description: 'Modern 3-level vertical residential architecture with compact footprint, sloped roof, and double-height glazed façade.',
  footprint: {
    width: 6.2,
    depth: 10.8,
    slabThickness: 0.22,
    wallThickness: 0.18,
  },
  levels: {
    ground: {
      key: 'ground' as const,
      name: 'Ground Floor (Planta Baja)',
      y0: 0.0,
      y1: 3.2,
      clearHeight: 2.85,
      elevationLabel: '±0.00 m',
    },
    level1: {
      key: 'level1' as const,
      name: 'First Floor (Primera Planta)',
      y0: 3.2,
      y1: 6.3,
      clearHeight: 2.8,
      elevationLabel: '+3.20 m',
    },
    loft: {
      key: 'loft' as const,
      name: 'Second Floor / Loft (Planta Loft)',
      y0: 6.3,
      y1: 9.3,
      highPoint: 10.7,
      clearHeight: 2.7,
      elevationLabel: '+6.30 m to +10.70 m',
    },
  },
  roof: {
    lowEave: 9.3,
    highEave: 10.7,
    overhangFront: 0.55,
    overhangSide: 0.35,
    slopeDirection: 'left-to-right' as const,
  },
  balconies: {
    upperFront: {
      level: 'loft',
      width: 4.9,
      depth: 1.4,
      xCenter: 0,
      zFrontOffset: 5.4 + 0.7,
      height: 6.3,
      railingHeight: 1.05,
    },
    midFrontLeft: {
      level: 'level1',
      width: 3.0,
      depth: 1.3,
      xCenter: -1.6,
      zFrontOffset: 5.4 + 0.65,
      height: 3.2,
      railingHeight: 1.05,
    },
  },
  terrace: {
    depth: 1.8,
    width: 4.8,
    steps: 3,
    height: 0.25,
    zCenter: 5.4 + 0.9,
  },
  facade: {
    glazingMainWidth: 4.9,
    glazingGroundHeight: 2.6,
    glazingUpperFullHeight: 3.8,
    frameDepth: 0.09,
    sideWindowWidth: 0.9,
    sideWindowHeight: 1.1,
  },
  materials: {
    cladding: '#1e2329',
    claddingAccent: '#16191d',
    frames: '#111111',
    warmWood: '#8e6b45',
    deck: '#b88f63',
    interiorWall: '#f4f1ea',
    floorOak: '#c8a47a',
    planter: '#22262b',
    glassTint: '#90b8d0',
    foundationConcrete: '#a0a3a8',
    steelBeam: '#2d3238',
  },
};

export const ROOMS: RoomInfo[] = [
  {
    id: 'living',
    name: 'Living Area (Salón)',
    floor: 'ground',
    floorName: 'Ground Floor',
    dimensions: '5.10 m × 3.40 m',
    description: 'Bright open-plan living room with direct connection to the front wooden deck through full-height sliding glass doors.',
    position: [0, 1.2, 3.0],
    cameraTarget: [0, 1.2, 2.5],
  },
  {
    id: 'dining',
    name: 'Dining Area (Comedor)',
    floor: 'ground',
    floorName: 'Ground Floor',
    dimensions: '3.60 m × 3.20 m',
    description: 'Central dining zone featuring a 6-seater solid oak table connecting living and kitchen areas.',
    position: [0, 1.2, -0.5],
    cameraTarget: [0, 1.2, -0.5],
  },
  {
    id: 'kitchen',
    name: 'Kitchen (Cocina)',
    floor: 'ground',
    floorName: 'Ground Floor',
    dimensions: '3.50 m × 3.00 m',
    description: 'Modern open kitchen with full cabinetry, central island prep station, integrated cooktop, and sink.',
    position: [0, 1.2, -3.8],
    cameraTarget: [0, 1.2, -3.8],
  },
  {
    id: 'bedroom1',
    name: 'Primary Suite (Dormitorio Principal)',
    floor: 'level1',
    floorName: 'First Floor',
    dimensions: '4.90 m × 4.60 m',
    description: 'Spacious master bedroom with king bed, lounge seating, and direct access to the middle cantilevered balcony.',
    position: [0, 4.4, 2.0],
    cameraTarget: [0, 4.4, 1.5],
  },
  {
    id: 'bathroom',
    name: 'Primary Bathroom (Baño Principal)',
    floor: 'level1',
    floorName: 'First Floor',
    dimensions: '2.40 m × 2.40 m',
    description: 'Private bathroom with walk-in glass shower enclosure, contemporary vanity, and toilet.',
    position: [1.8, 4.4, -3.8],
    cameraTarget: [1.8, 4.4, -3.8],
  },
  {
    id: 'loft_study',
    name: 'Loft Studio & Workspace (Estudio Loft)',
    floor: 'loft',
    floorName: 'Loft Level',
    dimensions: '4.60 m × 2.30 m',
    description: 'Sunlit upper workspace overlooking the front landscape and double-height glazed façade with access to top balcony.',
    position: [0, 7.5, 2.5],
    cameraTarget: [0, 7.5, 2.0],
  },
  {
    id: 'loft_lounge',
    name: 'Loft Lounge & Bedroom (Estar / Dormitorio Loft)',
    floor: 'loft',
    floorName: 'Loft Level',
    dimensions: '4.60 m × 3.20 m',
    description: 'Secondary lounge and guest sleeping area beneath the exposed sloped ceiling.',
    position: [0, 7.8, -2.5],
    cameraTarget: [0, 7.8, -2.5],
  },
];

export function getCasa01FloorY(key: Casa01FloorKey) {
  return CASA01.levels[key].y0;
}

export function getCasa01TotalHeight() {
  return CASA01.roof.highEave;
}
