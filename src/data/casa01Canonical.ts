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
    width: 6.2, // meters
    depth: 10.8, // meters
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
    slopeDirection: 'left-to-right' as const, // High point on left (X=-3.1), low point on right (X=+3.1)
  },
  balconies: {
    upperFront: {
      level: 'loft',
      width: 4.9,
      depth: 1.4,
      xCenter: 0,
      zFrontOffset: 5.4 + 0.7, // 1.4m depth out from z=5.4
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
    cladding: '#121519', // Deep pitch black anthracite facade panels
    claddingAccent: '#0e1014',
    frames: '#111317', // Black aluminum window and door frames
    warmWood: '#a87848', // Warm amber cedar wood ceiling soffit under eaves and balcony undersides
    deck: '#a87848', // Natural teak outdoor terrace deck
    interiorWall: '#f4f1ea', // Off-white warm interior plaster
    floorOak: '#c8a47a', // Natural oak hardwood flooring
    planter: '#181b20', // Dark charcoal concrete planters
    glassTint: '#80a8c8', // Soft ice-blue tinted glass
    foundationConcrete: '#788898', // Light slate concrete plinth and balcony slabs
    steelBeam: '#22262c',
  },
};

export const ROOMS: RoomInfo[] = [
  // PLANTA BAJA
  {
    id: 'living',
    name: 'Salón (Living Room)',
    floor: 'ground',
    floorName: 'Planta Baja',
    dimensions: '4.80 m × 3.10 m',
    description: 'Living area with L-shaped sofa, armchair, coffee table, TV console on left stair wall, and direct terrace connection.',
    position: [0.8, 1.2, 1.5],
    cameraTarget: [0.8, 1.2, 1.5],
  },
  {
    id: 'dining',
    name: 'Comedor (Dining)',
    floor: 'ground',
    floorName: 'Planta Baja',
    dimensions: '4.80 m × 3.00 m',
    description: 'Central dining area with a 6-seater solid oak table and side credenza.',
    position: [0.7, 1.2, -1.5],
    cameraTarget: [0.7, 1.2, -1.5],
  },
  {
    id: 'kitchen',
    name: 'Cocina (Kitchen)',
    floor: 'ground',
    floorName: 'Planta Baja',
    dimensions: '4.80 m × 2.40 m',
    description: 'Full kitchen with rear counter, double sink, cooktop, fridge, and central marble island with 3 bar stools.',
    position: [0.7, 1.2, -4.2],
    cameraTarget: [0.7, 1.2, -4.2],
  },
  {
    id: 'powder_room',
    name: 'Aseo (Powder Room)',
    floor: 'ground',
    floorName: 'Planta Baja',
    dimensions: '1.40 m × 1.20 m',
    description: 'Compact guest toilet with sink tucked under rear-left corner.',
    position: [-2.4, 1.2, -4.8],
    cameraTarget: [-2.4, 1.2, -4.8],
  },
  {
    id: 'pantry',
    name: 'Almacén (Pantry)',
    floor: 'ground',
    floorName: 'Planta Baja',
    dimensions: '1.40 m × 1.20 m',
    description: 'Storage room next to powder room under stairwell.',
    position: [-2.4, 1.2, -3.6],
    cameraTarget: [-2.4, 1.2, -3.6],
  },

  // PRIMERA PLANTA
  {
    id: 'bedroom1',
    name: 'Dormitorio / Estudio',
    floor: 'level1',
    floorName: 'Primera Planta',
    dimensions: '6.20 m × 5.20 m',
    description: 'Spacious master bedroom with king bed, nightstands, study desk with chair, and front balcony access.',
    position: [0.5, 4.4, 0.8],
    cameraTarget: [0.5, 4.4, 0.8],
  },
  {
    id: 'bathroom',
    name: 'Baño Principal',
    floor: 'level1',
    floorName: 'Primera Planta',
    dimensions: '3.30 m × 2.10 m',
    description: 'Primary bathroom with vanity counter, walk-in glass shower, and toilet.',
    position: [1.4, 4.4, -4.3],
    cameraTarget: [1.4, 4.4, -4.3],
  },
  {
    id: 'dressing_room',
    name: 'Vestidor (Walk-in Closet)',
    floor: 'level1',
    floorName: 'Primera Planta',
    dimensions: '3.30 m × 1.60 m',
    description: 'Walk-in wardrobe with double fitted closets and dressing bench.',
    position: [1.4, 4.4, -2.5],
    cameraTarget: [1.4, 4.4, -2.5],
  },

  // SEGUNDA PLANTA / LOFT
  {
    id: 'loft_bedroom',
    name: 'Dormitorio Loft',
    floor: 'loft',
    floorName: 'Loft Level',
    dimensions: '3.60 m × 3.20 m',
    description: 'Top floor double bedroom with nightstands, rug, and corner wardrobe.',
    position: [0.2, 7.5, -3.8],
    cameraTarget: [0.2, 7.5, -3.8],
  },
  {
    id: 'loft_lounge',
    name: 'Lounge Loft',
    floor: 'loft',
    floorName: 'Loft Level',
    dimensions: '4.60 m × 4.20 m',
    description: 'Upper living lounge with L-shaped sectional sofa, round coffee table, and media wall.',
    position: [0.5, 7.5, -0.2],
    cameraTarget: [0.5, 7.5, -0.2],
  },
  {
    id: 'loft_study',
    name: 'Zona de Estudio',
    floor: 'loft',
    floorName: 'Loft Level',
    dimensions: '4.60 m × 2.00 m',
    description: 'Executive study zone with wide wooden desk facing front glass facade and balcony.',
    position: [0.2, 7.5, 3.0],
    cameraTarget: [0.2, 7.5, 3.0],
  },
];

export function getCasa01FloorY(key: Casa01FloorKey) {
  return CASA01.levels[key].y0;
}

export function getCasa01TotalHeight() {
  return CASA01.roof.highEave;
}
