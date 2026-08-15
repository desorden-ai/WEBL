export interface CinematicPOI {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  tag: string;
  duration: number; // in milliseconds
  startPos: { x: number; y: number; z: number };
  endPos: { x: number; y: number; z: number };
  startLookAt: { x: number; y: number; z: number };
  endLookAt: { x: number; y: number; z: number };
  controlPoint?: { x: number; y: number; z: number };
  fov?: number;
}

export const CINEMATIC_POIS: CinematicPOI[] = [
  {
    id: 'poi-facade',
    index: 1,
    title: 'Voladizo Cantilever y Fachada Frontal',
    subtitle: 'Estructura suspendida sobre pilares de acero integrados en la roca alpina y manto de musgo',
    tag: 'Arquitectura Exterior',
    duration: 14200,
    startPos: { x: -7.5, y: 6.2, z: 29.0 },
    endPos: { x: 7.0, y: 6.8, z: 25.0 },
    startLookAt: { x: -0.5, y: 5.2, z: 0.0 },
    endLookAt: { x: 1.5, y: 5.4, z: 0.0 },
    controlPoint: { x: 0.0, y: 7.2, z: 28.0 },
    fov: 58,
  },
  {
    id: 'poi-interior',
    index: 2,
    title: 'Fogar Rectangular & Barra de Cocina',
    subtitle: 'Fogar rectangular suspendido con fuego vivo, barra de cocina con nevera integrada y sala de estar lounge',
    tag: 'Espacio Interior',
    duration: 13300,
    startPos: { x: 0.1, y: 6.45, z: 1.6 },
    endPos: { x: 0.72, y: 6.36, z: 0.45 },
    startLookAt: { x: -2.6, y: 6.15, z: -0.8 },
    endLookAt: { x: -2.35, y: 6.12, z: -0.92 },
    controlPoint: { x: 0.45, y: 6.40, z: 1.1 },
    fov: 63,
  },
  {
    id: 'poi-deck',
    index: 3,
    title: 'Terraza Volada y Dosel de Pinos',
    subtitle: 'Deck perimetral en voladizo sobre la pendiente natural, abrazando la bruma y los pinos',
    tag: 'Mirador Panorámico',
    duration: 14200,
    startPos: { x: 3.8, y: 5.8, z: 8.5 },
    endPos: { x: 8.5, y: 7.2, z: 5.5 },
    startLookAt: { x: 0.2, y: 5.5, z: 2.5 },
    endLookAt: { x: -4.0, y: 5.0, z: -4.0 },
    controlPoint: { x: 6.5, y: 6.8, z: 7.8 },
    fov: 60,
  },
  {
    id: 'poi-suite',
    index: 4,
    title: 'Suite y Bañera Panorámica',
    subtitle: 'Zona de descanso y desconexión con bañera exenta orientada a la ladera montañosa',
    tag: 'Zona Privada',
    duration: 12500,
    startPos: { x: 5.8, y: 6.6, z: 3.0 },
    endPos: { x: 4.6, y: 6.4, z: 0.8 },
    startLookAt: { x: 5.5, y: 5.8, z: -1.0 },
    endLookAt: { x: 5.5, y: 5.8, z: -2.2 },
    controlPoint: { x: 5.4, y: 6.6, z: 2.0 },
    fov: 56,
  },
  {
    id: 'poi-steps',
    index: 5,
    title: 'Escalinata de Piedra y Raíces',
    subtitle: 'Veinte peldaños de granito natural labrados a mano entre la masa boscosa centenaria',
    tag: 'Acceso Paisajístico',
    duration: 13300,
    startPos: { x: -5.8, y: 2.2, z: 18.0 },
    endPos: { x: -3.0, y: 4.2, z: 10.0 },
    startLookAt: { x: -2.5, y: 5.0, z: 2.0 },
    endLookAt: { x: 0.0, y: 5.5, z: 0.0 },
    controlPoint: { x: -4.8, y: 3.4, z: 14.5 },
    fov: 60,
  },
  {
    id: 'poi-aerial',
    index: 6,
    title: 'Encuadre Aéreo Cenital',
    subtitle: 'Perspectiva superior que revela la cubierta Shou Sugi Ban y la inmersión en la naturaleza',
    tag: 'Vista Cenital',
    duration: 14200,
    startPos: { x: 0.0, y: 15.5, z: 18.0 },
    endPos: { x: 12.0, y: 14.0, z: 8.0 },
    startLookAt: { x: 1.0, y: 5.2, z: -1.0 },
    endLookAt: { x: 0.5, y: 5.2, z: 0.0 },
    controlPoint: { x: 7.0, y: 16.0, z: 14.0 },
    fov: 55,
  },
];
