import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_VIEWS, VIEW_ORDER, VISUAL_FILTERS } from '../data/config';
import { CINEMATIC_POIS } from '../data/cinematicPOIs';
import { CameraViewId, EnvironmentId, VisualFilterId, InteractiveElementData } from '../types';
import {
  createBarkMossTexture,
  createBlackWoodTexture,
  createInteriorWoodTexture,
  createMossTexture,
  createRealisticTreeTexture,
  createStoneTexture,
  createFireTexture,
  createEmberTexture,
  createAcousticWoodTexture,
} from '../utils/textures';
import {
  easeInOutCubic,
  getBezierControlPoint,
  sampleBezierCurve,
} from '../utils/cameraTransition';
import { computeSolarLighting } from '../utils/sunCalculator';
import { AtmosphericSky, createAtmosphericSky } from '../utils/atmosphericSky';

interface Viewport3DProps {
  currentView: CameraViewId;
  currentEnv: EnvironmentId;
  visualFilter?: VisualFilterId;
  timeOfDay: number; // 0.0 - 24.0
  lightsOn: boolean;
  flashlightOn: boolean;
  isAutoPanorama: boolean;
  isCinematicTour: boolean;
  isManual360: boolean;
  resetCameraTrigger?: number;
  onViewChange: (view: CameraViewId) => void;
  onNextView?: () => void;
  onPrevView?: () => void;
  onInteract?: () => void;
  onPOIUpdate?: (poiIndex: number, progress: number) => void;
}

export function Viewport3D({
  currentView,
  visualFilter = 'normal',
  timeOfDay,
  lightsOn,
  flashlightOn,
  isAutoPanorama,
  isCinematicTour,
  isManual360,
  resetCameraTrigger = 0,
  onViewChange,
  onNextView,
  onPrevView,
  onInteract,
  onPOIUpdate,
}: Viewport3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const atmosphericSkyRef = useRef<AtmosphericSky | null>(null);
  const interactiveObjectsRef = useRef<THREE.Object3D[]>([]);

  const interiorLightsRef = useRef<THREE.PointLight[]>([]);
  const deckLightsRef = useRef<THREE.PointLight[]>([]);
  const fireLightRef = useRef<THREE.PointLight | null>(null);
  const fireMeshesRef = useRef<THREE.Mesh[]>([]);
  const tvGlowLightRef = useRef<THREE.PointLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fogRef = useRef<THREE.Fog | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);

  // Flashlight references
  const flashlightRef = useRef<THREE.SpotLight | null>(null);
  const flashlightTargetRef = useRef<THREE.Object3D | null>(null);

  // Transition and trajectory state
  const prevViewRef = useRef<CameraViewId>(currentView);
  const startPosRef = useRef(new THREE.Vector3(...Object.values(CAMERA_VIEWS[currentView].pos) as [number, number, number]));
  const startLookAtRef = useRef(new THREE.Vector3(...Object.values(CAMERA_VIEWS[currentView].lookAt) as [number, number, number]));
  const targetPosRef = useRef(new THREE.Vector3(...Object.values(CAMERA_VIEWS[currentView].pos) as [number, number, number]));
  const targetLookAtRef = useRef(new THREE.Vector3(...Object.values(CAMERA_VIEWS[currentView].lookAt) as [number, number, number]));
  const controlPointRef = useRef(new THREE.Vector3(...Object.values(CAMERA_VIEWS[currentView].pos) as [number, number, number]));

  const currentLookAtRef = useRef(new THREE.Vector3(...Object.values(CAMERA_VIEWS[currentView].lookAt) as [number, number, number]));
  const transitionStartRef = useRef<number>(0);
  const transitionDuration = 1350; // ms (fluid, stabilized cinematic camera glide)
  const isTransitioningRef = useRef<boolean>(false);

  // Look-Around Touch/Mouse Dragging State
  const userYawRef = useRef<number>(0);
  const targetUserYawRef = useRef<number>(0);
  const userPitchRef = useRef<number>(0);
  const targetUserPitchRef = useRef<number>(0);
  const userPanXRef = useRef<number>(0);
  const targetUserPanXRef = useRef<number>(0);
  const isDraggingLookRef = useRef<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cinematic Tour State
  const poiIndexRef = useRef<number>(0);
  const poiStartTimeRef = useRef<number>(0);
  const isCinematicTourRef = useRef(isCinematicTour);
  isCinematicTourRef.current = isCinematicTour;

  // Parallax pointer target & smoothed values
  const pointerTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keep fresh refs to props
  const onViewChangeRef = useRef(onViewChange);
  onViewChangeRef.current = onViewChange;
  const onNextViewRef = useRef(onNextView);
  onNextViewRef.current = onNextView;
  const onPrevViewRef = useRef(onPrevView);
  onPrevViewRef.current = onPrevView;
  const currentViewRef = useRef(currentView);
  currentViewRef.current = currentView;
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;
  const onPOIUpdateRef = useRef(onPOIUpdate);
  onPOIUpdateRef.current = onPOIUpdate;
  const flashlightOnRef = useRef(flashlightOn);
  flashlightOnRef.current = flashlightOn;
  const isAutoPanoramaRef = useRef(isAutoPanorama);
  isAutoPanoramaRef.current = isAutoPanorama;
  const isManual360Ref = useRef(isManual360);
  isManual360Ref.current = isManual360;
  const timeOfDayRef = useRef(timeOfDay);
  timeOfDayRef.current = timeOfDay;

  const lastScrollTimeRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);

  // Reset cinematic sequence timer whenever cinematic mode starts
  useEffect(() => {
    if (isCinematicTour) {
      poiStartTimeRef.current = performance.now();
      poiIndexRef.current = 0;
    }
  }, [isCinematicTour]);

  // Trigger smooth curved transition whenever currentView prop changes
  useEffect(() => {
    if (isAutoPanorama || isCinematicTour) return;

    const fromView = prevViewRef.current;
    const toView = currentView;
    const fromConfig = CAMERA_VIEWS[fromView];
    const toConfig = CAMERA_VIEWS[toView];

    if (cameraRef.current) {
      startPosRef.current.copy(cameraRef.current.position);
    } else {
      startPosRef.current.set(fromConfig.pos.x, fromConfig.pos.y, fromConfig.pos.z);
    }

    startLookAtRef.current.copy(currentLookAtRef.current);
    targetPosRef.current.set(toConfig.pos.x, toConfig.pos.y, toConfig.pos.z);
    targetLookAtRef.current.set(toConfig.lookAt.x, toConfig.lookAt.y, toConfig.lookAt.z);

    // Reset user look offsets smoothly for new scene
    targetUserYawRef.current = 0;
    targetUserPitchRef.current = 0;
    targetUserPanXRef.current = 0;
    userYawRef.current = 0;
    userPitchRef.current = 0;
    userPanXRef.current = 0;

    // Calculate bezier intermediate flight control point with current position vectors
    controlPointRef.current = getBezierControlPoint(
      fromView,
      toView,
      startPosRef.current,
      targetPosRef.current
    );

    transitionStartRef.current = performance.now();
    isTransitioningRef.current = true;
    prevViewRef.current = currentView;
  }, [currentView, isAutoPanorama, isCinematicTour]);

  // Handle Reset Camera trigger: smoothly reset yaw, pitch, pan and position to scene default
  useEffect(() => {
    if (resetCameraTrigger === 0) return;
    const viewConfig = CAMERA_VIEWS[currentView];
    if (cameraRef.current) {
      startPosRef.current.copy(cameraRef.current.position);
    }
    startLookAtRef.current.copy(currentLookAtRef.current);
    targetPosRef.current.set(viewConfig.pos.x, viewConfig.pos.y, viewConfig.pos.z);
    targetLookAtRef.current.set(viewConfig.lookAt.x, viewConfig.lookAt.y, viewConfig.lookAt.z);
    controlPointRef.current.set(
      (startPosRef.current.x + viewConfig.pos.x) / 2,
      (startPosRef.current.y + viewConfig.pos.y) / 2,
      (startPosRef.current.z + viewConfig.pos.z) / 2
    );
    targetUserYawRef.current = 0;
    targetUserPitchRef.current = 0;
    targetUserPanXRef.current = 0;
    userYawRef.current = 0;
    userPitchRef.current = 0;
    userPanXRef.current = 0;
    transitionStartRef.current = performance.now();
    isTransitioningRef.current = true;
  }, [resetCameraTrigger, currentView]);

  // Update light intensities when lightsOn changes
  useEffect(() => {
    interiorLightsRef.current.forEach((light, idx) => {
      light.intensity = lightsOn ? (idx === 3 ? 2.5 : 3.0) : 0;
    });
    deckLightsRef.current.forEach((light) => {
      light.intensity = lightsOn ? 1.5 : 0;
    });
  }, [lightsOn]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialSolar = computeSolarLighting(timeOfDayRef.current);

    // --- Procedural Atmospheric Sky Gradient ---
    const atmosphericSky = createAtmosphericSky(initialSolar);
    scene.add(atmosphericSky.mesh);
    atmosphericSkyRef.current = atmosphericSky;

    const fog = new THREE.Fog(initialSolar.fogColor, initialSolar.fogNear, initialSolar.fogFar);
    scene.fog = fog;
    fogRef.current = fog;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );
    const initialConfig = CAMERA_VIEWS[currentViewRef.current];
    camera.position.set(initialConfig.pos.x, initialConfig.pos.y, initialConfig.pos.z);
    currentLookAtRef.current.set(initialConfig.lookAt.x, initialConfig.lookAt.y, initialConfig.lookAt.z);
    camera.lookAt(currentLookAtRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(initialSolar.ambientColor, initialSolar.ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(initialSolar.sunColor, initialSolar.sunIntensity);
    dirLight.position.copy(initialSolar.sunPosition);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 35;
    dirLight.shadow.camera.bottom = -35;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // --- Camera Interactive Flashlight (Interior Explorer Spotlight) ---
    const flashlight = new THREE.SpotLight(0xfff5dd, 0, 24, Math.PI / 4.8, 0.45, 1.2);
    flashlight.castShadow = true;
    flashlight.shadow.mapSize.width = 1024;
    flashlight.shadow.mapSize.height = 1024;
    flashlight.shadow.bias = -0.0005;

    const flashlightTarget = new THREE.Object3D();
    scene.add(flashlightTarget);
    flashlight.target = flashlightTarget;
    scene.add(flashlight);
    flashlightRef.current = flashlight;
    flashlightTargetRef.current = flashlightTarget;

    // --- Procedural Textures ---
    const mossTex = createMossTexture(maxAnisotropy);
    const stoneTex = createStoneTexture(maxAnisotropy);
    const exteriorTex = createBlackWoodTexture(maxAnisotropy);
    const interiorTex = createInteriorWoodTexture(maxAnisotropy);
    const barkTex = createBarkMossTexture(maxAnisotropy);
    const realisticTreeTexture = createRealisticTreeTexture(maxAnisotropy);
    const fireTex = createFireTexture();
    const emberTex = createEmberTexture();
    const acousticWoodTex = createAcousticWoodTexture(maxAnisotropy);

    // --- 1. Hillside Terrain ---
    const terrainGeo = new THREE.PlaneGeometry(130, 130, 64, 64);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, (y + 50) * 0.16 + Math.sin(x * 0.2) * 0.5 + Math.cos(y * 0.25) * 0.8);
    }
    terrainGeo.computeVertexNormals();

    const terrain = new THREE.Mesh(
      terrainGeo,
      new THREE.MeshStandardMaterial({
        map: mossTex,
        bumpMap: mossTex,
        bumpScale: 0.15,
        roughness: 0.95,
      })
    );
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, -1, -20);
    terrain.receiveShadow = true;
    scene.add(terrain);

    // --- 2. Mansion Pavilion & Interior ---
    const cabinGroup = new THREE.Group();
    const interactiveObjects: THREE.Object3D[] = [];

    const exteriorMat = new THREE.MeshStandardMaterial({
      map: exteriorTex,
      bumpMap: exteriorTex,
      bumpScale: 0.05,
      roughness: 0.85,
    });
    const interiorFloorMat = new THREE.MeshStandardMaterial({
      map: interiorTex,
      bumpMap: interiorTex,
      bumpScale: 0.02,
      roughness: 0.5,
    });
    const pillarMat = new THREE.MeshStandardMaterial({
      color: '#111111',
      roughness: 0.8,
      metalness: 0.6,
    });

    const pillarPositions = [
      [-5.5, 1.8],
      [-1.8, 1.8],
      [1.8, 1.8],
      [5.5, 1.8],
      [-5.5, -1.0],
      [-1.8, -1.0],
      [1.8, -1.0],
      [5.5, -1.0],
    ];
    pillarPositions.forEach((pPos, idx) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.0, 8), pillarMat);
      pillar.position.set(pPos[0], -2.5, pPos[1]);
      pillar.castShadow = true;
      pillar.userData.interactiveData = {
        id: `pillar-${idx}`,
        name: 'Pilares de Acero Estructural',
        category: 'estructura',
        description: 'Micropilotes cilíndricos de alta resistencia empotrados en roca madre.',
        targetView: 'lowAngle',
        hint: 'Clic para enfocar base y cimentación',
        color: '#64748b',
        icon: '🏗️',
      } as InteractiveElementData;
      cabinGroup.add(pillar);
      interactiveObjects.push(pillar);
    });

    const floorBase = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.2, 4.0), exteriorMat);
    floorBase.position.set(0, 0.1, 0);
    floorBase.receiveShadow = true;
    floorBase.castShadow = true;
    cabinGroup.add(floorBase);

    const floorInner = new THREE.Mesh(new THREE.PlaneGeometry(12.8, 3.8), interiorFloorMat);
    floorInner.rotation.x = -Math.PI / 2;
    floorInner.position.set(0, 0.21, 0);
    floorInner.receiveShadow = true;
    floorInner.userData.interactiveData = {
      id: 'interior-floor',
      name: 'Tarima de Madera Interior',
      category: 'interior',
      description: 'Suelo continuo de roble cepillado con suelo radiante de baja inercia.',
      targetView: 'interior',
      hint: 'Clic para entrar al espacio interior',
      color: '#f59e0b',
      icon: '🪵',
    } as InteractiveElementData;
    cabinGroup.add(floorInner);
    interactiveObjects.push(floorInner);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.2, 5.0), exteriorMat);
    roof.position.set(0, 2.5, 0.3);
    roof.castShadow = true;
    roof.receiveShadow = true;
    roof.userData.interactiveData = {
      id: 'roof',
      name: 'Cubierta Shou Sugi Ban',
      category: 'material',
      description: 'Alerce carbonizado mediante técnica milenaria japonesa Yakisugi.',
      targetView: 'lateral',
      hint: 'Clic para perspectiva lateral',
      color: '#38bdf8',
      icon: '📐',
    } as InteractiveElementData;
    cabinGroup.add(roof);
    interactiveObjects.push(roof);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(13.0, 2.2, 0.2), exteriorMat);
    backWall.position.set(0, 1.3, -1.9);
    backWall.castShadow = true;
    cabinGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 3.8), exteriorMat);
    leftWall.position.set(-6.4, 1.3, 0);
    leftWall.castShadow = true;
    cabinGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 3.8), exteriorMat);
    rightWall.position.set(6.4, 1.3, 0);
    rightWall.castShadow = true;
    cabinGroup.add(rightWall);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.2, 3.5), exteriorMat);
    deck.position.set(0, 0.1, 3.65);
    deck.receiveShadow = true;
    deck.userData.interactiveData = {
      id: 'deck',
      name: 'Terraza Deck Voladiza',
      category: 'arquitectura',
      description: 'Mirador panorámico suspendido con luminarias rasantes integradas.',
      targetView: 'lateral',
      hint: 'Clic para perspectiva de terraza',
      color: '#10b981',
      icon: '🌲',
    } as InteractiveElementData;
    cabinGroup.add(deck);
    interactiveObjects.push(deck);

    const wallMat = new THREE.MeshStandardMaterial({ color: '#e8e6e1', roughness: 0.9 });
    const w1b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 1.8), wallMat);
    w1b.position.set(1.3, 1.3, -1.0);
    cabinGroup.add(w1b);

    const w1f = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 1.0), wallMat);
    w1f.position.set(1.3, 1.3, 1.4);
    cabinGroup.add(w1f);

    const w1t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.0), wallMat);
    w1t.position.set(1.3, 2.2, 0.4);
    cabinGroup.add(w1t);

    const w2b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 2.8), wallMat);
    w2b.position.set(4.3, 1.3, -0.5);
    cabinGroup.add(w2b);

    const w2t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.0), wallMat);
    w2t.position.set(4.3, 2.2, 1.4);
    cabinGroup.add(w2t);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0.15,
      roughness: 0.05,
      transmission: 0.96,
      transparent: true,
      opacity: 1,
      reflectivity: 0.9,
      clearcoat: 1.0,
      side: THREE.DoubleSide,
    });
    const glassFront = new THREE.Mesh(new THREE.PlaneGeometry(12.8, 2.2), glassMat);
    glassFront.position.set(0, 1.3, 1.91);
    glassFront.userData.interactiveData = {
      id: 'glass-front',
      name: 'Cerramiento Vidrio Low-E',
      category: 'arquitectura',
      description: 'Superficie acristalada continua de 12.8m con protección solar pasiva.',
      targetView: 'general',
      hint: 'Clic para vista frontal panorámica',
      color: '#38bdf8',
      icon: '🪟',
    } as InteractiveElementData;
    cabinGroup.add(glassFront);
    interactiveObjects.push(glassFront);

    const frameMat = new THREE.MeshStandardMaterial({ color: '#050505', metalness: 0.5 });
    for (let x = -6.4; x <= 6.5; x += 1.6) {
      const vFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.08), frameMat);
      vFrame.position.set(x, 1.3, 1.93);
      cabinGroup.add(vFrame);
    }
    const hFrameTop = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.08, 0.08), frameMat);
    hFrameTop.position.set(0, 2.36, 1.93);
    cabinGroup.add(hFrameTop);

    const hFrameBottom = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.08, 0.08), frameMat);
    hFrameBottom.position.set(0, 0.24, 1.93);
    cabinGroup.add(hFrameBottom);

    // =========================================================================
    // 1. REESTRUCTURACIÓN DEL HABITÁCULO: FOGAR MONOLÍTICO VERTICAL CONTINUO
    //    Elemento rectangular vertical que mantiene EXACTAMENTE las mismas
    //    dimensiones prismáticas (1.30m x 0.68m) en el interior y en el exterior.
    // =========================================================================
    const hearthGroup = new THREE.Group();
    hearthGroup.position.set(-1.6, 0.2, -0.4);

    // Material de piedra volcánica oscura refractaria / acero carbón arquitectónico
    const monolithMat = new THREE.MeshStandardMaterial({
      color: '#131315',
      roughness: 0.88,
      metalness: 0.28,
    });

    const hearthStoneMat = new THREE.MeshStandardMaterial({
      color: '#0e0e10',
      roughness: 0.94,
      metalness: 0.15,
    });

    // 1.1 Base / Plinto inferior monolítico (1.30m x 0.18m x 0.68m)
    const hearthBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.30, 0.18, 0.68),
      hearthStoneMat
    );
    hearthBase.position.y = 0.09;
    hearthBase.receiveShadow = true;
    hearthBase.castShadow = true;
    hearthGroup.add(hearthBase);

    // Zócalo perimetral de sombra en acero negro
    const hearthPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.03, 0.70),
      new THREE.MeshStandardMaterial({ color: '#050505', metalness: 0.8, roughness: 0.3 })
    );
    hearthPlinth.position.y = 0.015;
    hearthGroup.add(hearthPlinth);

    // 1.2 Cámara de combustión interior (apertura frontal limpia hacia el salón)
    // Pared posterior refractaria de la cámara
    const chamberBack = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, 1.05, 0.08),
      hearthStoneMat
    );
    chamberBack.position.set(0, 0.70, -0.29);
    chamberBack.castShadow = true;
    chamberBack.receiveShadow = true;
    hearthGroup.add(chamberBack);

    // Columna / Muela lateral izquierda (forma el marco rectangular vertical de 1.30m x 0.68m)
    const chamberLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 1.05, 0.66),
      monolithMat
    );
    chamberLeft.position.set(-0.595, 0.70, 0.0);
    chamberLeft.castShadow = true;
    chamberLeft.receiveShadow = true;
    hearthGroup.add(chamberLeft);

    // Columna / Muela lateral derecha
    const chamberRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 1.05, 0.66),
      monolithMat
    );
    chamberRight.position.set(0.595, 0.70, 0.0);
    chamberRight.castShadow = true;
    chamberRight.receiveShadow = true;
    hearthGroup.add(chamberRight);

    // Dintel superior de la boca del fogar (conecta las jambas manteniendo 1.30m x 0.68m)
    const chamberLintel = new THREE.Mesh(
      new THREE.BoxGeometry(1.30, 0.22, 0.68),
      monolithMat
    );
    chamberLintel.position.set(0, 1.33, 0.0);
    chamberLintel.castShadow = true;
    hearthGroup.add(chamberLintel);

    // 1.3 Lecho refractario de brasas incandescentes
    const emberBed = new THREE.Mesh(
      new THREE.BoxGeometry(1.04, 0.06, 0.46),
      new THREE.MeshStandardMaterial({
        map: emberTex,
        color: '#ff4400',
        emissive: '#ff3300',
        emissiveIntensity: 2.4,
        roughness: 0.7,
      })
    );
    emberBed.position.set(0, 0.19, 0.02);
    hearthGroup.add(emberBed);

    // Troncos de leña cruzados de madera natural en disposición longitudinal
    const logMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      color: '#2d1e14',
      roughness: 0.95,
    });
    
    // Tronco frontal horizontal
    const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.88, 12), logMat);
    log1.rotation.z = Math.PI / 2 + 0.04;
    log1.position.set(0.0, 0.24, 0.10);
    hearthGroup.add(log1);

    // Tronco posterior longitudinal
    const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.82, 12), logMat);
    log2.rotation.z = Math.PI / 2 - 0.03;
    log2.position.set(-0.02, 0.25, -0.10);
    hearthGroup.add(log2);

    // Troncos diagonales cruzados
    const log3 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.40, 12), logMat);
    log3.rotation.x = Math.PI / 3.2;
    log3.rotation.y = 0.35;
    log3.position.set(-0.28, 0.28, 0.02);
    hearthGroup.add(log3);

    const log4 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 12), logMat);
    log4.rotation.x = -Math.PI / 3.0;
    log4.rotation.y = -0.3;
    log4.position.set(0.26, 0.28, -0.01);
    hearthGroup.add(log4);

    const log5 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.34, 12), logMat);
    log5.rotation.x = Math.PI / 2.8;
    log5.position.set(0.02, 0.30, 0.04);
    hearthGroup.add(log5);

    // Llamas de fuego vivo animadas
    const fireMat = new THREE.MeshBasicMaterial({
      map: fireTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const fireMeshes: THREE.Mesh[] = [];
    const flamePositions = [
      { x: -0.34, z: -0.02, rot: 0, scale: 0.60 },
      { x: -0.18, z: 0.03, rot: Math.PI / 4, scale: 0.70 },
      { x: -0.02, z: -0.03, rot: -Math.PI / 6, scale: 0.80 },
      { x: 0.14, z: 0.04, rot: Math.PI / 3, scale: 0.74 },
      { x: 0.30, z: -0.02, rot: -Math.PI / 4, scale: 0.62 },
    ];

    flamePositions.forEach((fp) => {
      const flame = new THREE.Mesh(new THREE.PlaneGeometry(fp.scale, fp.scale * 1.25), fireMat);
      flame.rotation.y = fp.rot;
      flame.position.set(fp.x, 0.52, fp.z);
      hearthGroup.add(flame);
      fireMeshes.push(flame);
    });
    fireMeshesRef.current = fireMeshes;

    // 1.4 CUERPO VERTICAL SUPERIOR MONOLÍTICO CONTINUO (Interior + Traspaso de Cubierta + Exterior)
    // Mantiene EXACTAMENTE la misma sección rectangular (1.30m de ancho x 0.68m de fondo)
    // Se eleva desde encima de la boca (y = 1.44) hasta atravesar el techo (y = 2.50) y sobresalir en el exterior (y = 3.90)
    const upperMonolithColumn = new THREE.Mesh(
      new THREE.BoxGeometry(1.30, 2.48, 0.68),
      monolithMat
    );
    upperMonolithColumn.position.set(0, 2.68, 0);
    upperMonolithColumn.castShadow = true;
    upperMonolithColumn.receiveShadow = true;
    hearthGroup.add(upperMonolithColumn);

    // 1.5 REMATE EXTERIOR SUPERIOR ARQUITECTÓNICO (En la cumbrera exterior)
    // Sombra perimetral y tapa monolítica con remate limpio
    const roofChimneyShadow = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 0.04, 0.60),
      new THREE.MeshStandardMaterial({ color: '#030303', metalness: 0.9, roughness: 0.2 })
    );
    roofChimneyShadow.position.set(0, 3.93, 0);
    hearthGroup.add(roofChimneyShadow);

    const roofChimneyCap = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 0.06, 0.74),
      monolithMat
    );
    roofChimneyCap.position.set(0, 3.97, 0);
    roofChimneyCap.castShadow = true;
    hearthGroup.add(roofChimneyCap);

    // Luz puntual parpadeante del fogar
    const fireLight = new THREE.PointLight('#ff6010', 3.4, 7.5);
    fireLight.position.set(0, 0.5, 0);
    fireLight.castShadow = true;
    hearthGroup.add(fireLight);
    fireLightRef.current = fireLight;

    hearthGroup.userData.interactiveData = {
      id: 'chimney',
      name: 'Fogar Monolítico Vertical Continuo',
      category: 'interior',
      description: 'Elemento rectangular vertical continuo de basalto y acero oscuro que mantiene la misma sección prismática de 1.30m x 0.68m en el interior y exterior.',
      targetView: 'interior',
      hint: 'Clic para enfocar el fogar monolítico',
      color: '#f97316',
      icon: '🔥',
    } as InteractiveElementData;

    cabinGroup.add(hearthGroup);
    interactiveObjects.push(hearthGroup);

    // =========================================================================
    // 2. PARED IZQUIERDA: BARRA DE COCINA AMERICANA CON NEVERA INTEGRADA
    // =========================================================================
    const kitchenGroup = new THREE.Group();

    // --- A. NEVERA INTEGRADA DE ALTA GAMA (En esquina posterior izquierda) ---
    const fridgeMat = new THREE.MeshStandardMaterial({
      color: '#22252a', // Acero inoxidable grafito oscuro cepillado
      metalness: 0.88,
      roughness: 0.25,
    });
    
    // Cuerpo principal de la nevera
    const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.96, 0.76), fridgeMat);
    fridgeBody.position.set(-5.88, 1.18, -1.35);
    fridgeBody.castShadow = true;
    fridgeBody.receiveShadow = true;
    kitchenGroup.add(fridgeBody);

    // Tiradores verticales y división de puertas francesas superiores
    const handleMat = new THREE.MeshStandardMaterial({ color: '#c5a059', metalness: 0.9, roughness: 0.2 }); // Latón cepillado dorado
    const fridgeHandleL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.70, 0.03), handleMat);
    fridgeHandleL.position.set(-5.46, 1.45, -1.40);
    kitchenGroup.add(fridgeHandleL);

    const fridgeHandleR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.70, 0.03), handleMat);
    fridgeHandleR.position.set(-5.46, 1.45, -1.30);
    kitchenGroup.add(fridgeHandleR);

    // Tirador horizontal del cajón congelador inferior
    const freezerHandle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.52), handleMat);
    freezerHandle.position.set(-5.46, 0.52, -1.35);
    kitchenGroup.add(freezerHandle);

    // Panel táctil / dispensador con indicador LED azul sutil
    const fridgeDisplay = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.24),
      new THREE.MeshStandardMaterial({
        color: '#0a101d',
        emissive: '#38bdf8',
        emissiveIntensity: 0.55,
        roughness: 0.2,
      })
    );
    fridgeDisplay.rotation.y = Math.PI / 2;
    fridgeDisplay.position.set(-5.46, 1.55, -1.48);
    kitchenGroup.add(fridgeDisplay);

    // --- B. BARRA DE COCINA / ISLA CON ENCIMERA DE MÁRMOL Y TABURETES ---
    // Mueble bajo en madera alistonada oscura
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: '#1a1816',
      roughness: 0.75,
      metalness: 0.15,
    });
    const barCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 1.90), cabinetMat);
    barCabinet.position.set(-5.55, 0.45, 0.20);
    barCabinet.castShadow = true;
    barCabinet.receiveShadow = true;
    kitchenGroup.add(barCabinet);

    // Encimera volada de mármol negro veteado / granito pulido
    const counterMat = new THREE.MeshStandardMaterial({
      color: '#121316',
      roughness: 0.25,
      metalness: 0.35,
    });
    const barCounter = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.06, 1.98), counterMat);
    barCounter.position.set(-5.46, 0.91, 0.20);
    barCounter.castShadow = true;
    barCounter.receiveShadow = true;
    kitchenGroup.add(barCounter);

    // Fregadero bajo encimera de grafito
    const sinkMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.02, 0.46),
      new THREE.MeshStandardMaterial({ color: '#0a0a0a', metalness: 0.7, roughness: 0.3 })
    );
    sinkMesh.position.set(-5.62, 0.94, -0.32);
    kitchenGroup.add(sinkMesh);

    // Grifo monomando de cuello de cisne en latón dorado
    const faucetStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.28, 12),
      handleMat
    );
    faucetStem.position.set(-5.74, 1.08, -0.32);
    kitchenGroup.add(faucetStem);

    const faucetArch = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI),
      handleMat
    );
    faucetArch.position.set(-5.74, 1.22, -0.32);
    faucetArch.rotation.z = Math.PI / 2;
    kitchenGroup.add(faucetArch);

    // Placa de inducción táctil con 3 zonas de cocción
    const cooktop = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.01, 0.62),
      new THREE.MeshStandardMaterial({
        color: '#080808',
        roughness: 0.1,
        metalness: 0.9,
      })
    );
    cooktop.position.set(-5.62, 0.94, 0.48);
    kitchenGroup.add(cooktop);

    // Anillos circulares de inducción
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#ff4422',
      emissive: '#ff2200',
      emissiveIntensity: 0.6,
    });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.075, 20), ringMat);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.set(-5.62, 0.95, 0.32);
    kitchenGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.095, 20), ringMat);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.set(-5.62, 0.95, 0.60);
    kitchenGroup.add(ring2);

    // Cava enfriadora de vinos integrada bajo encimera con puerta de cristal
    const wineCooler = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.65, 0.45),
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.1,
        metalness: 0.8,
        emissive: '#f59e0b',
        emissiveIntensity: 0.25,
      })
    );
    wineCooler.position.set(-5.11, 0.44, 0.20);
    kitchenGroup.add(wineCooler);

    // Taburetes altos de barra de diseño (facing the living room)
    const stoolMat = new THREE.MeshStandardMaterial({ color: '#111', metalness: 0.85, roughness: 0.3 });
    const stoolSeatMat = new THREE.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.5 }); // Cuero/madera noble

    const stoolPositions = [
      { x: -4.68, z: -0.22 },
      { x: -4.68, z: 0.52 },
    ];

    stoolPositions.forEach((sp) => {
      // Asiento redondo
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 24), stoolSeatMat);
      seat.position.set(sp.x, 0.64, sp.z);
      seat.castShadow = true;
      kitchenGroup.add(seat);

      // Pata central y base
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.60, 12), stoolMat);
      pole.position.set(sp.x, 0.32, sp.z);
      kitchenGroup.add(pole);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 20), stoolMat);
      base.position.set(sp.x, 0.03, sp.z);
      kitchenGroup.add(base);

      // Aro reposapiés
      const footrest = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 8, 20), stoolMat);
      footrest.rotation.x = Math.PI / 2;
      footrest.position.set(sp.x, 0.22, sp.z);
      kitchenGroup.add(footrest);
    });

    // Estante superior flotante con cristalería e iluminación cálida
    const shelfWood = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.04, 1.80),
      new THREE.MeshStandardMaterial({ color: '#2b1b11', roughness: 0.6 })
    );
    shelfWood.position.set(-5.88, 2.05, 0.20);
    kitchenGroup.add(shelfWood);

    // Botellas y copas de diseño en el estante
    for (let bi = 0; bi < 4; bi++) {
      const bColor = bi % 2 === 0 ? '#10b981' : '#b45309';
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.22, 12),
        new THREE.MeshPhysicalMaterial({ color: bColor, transparent: true, opacity: 0.85, roughness: 0.1 })
      );
      bottle.position.set(-5.85, 2.18, -0.4 + bi * 0.35);
      kitchenGroup.add(bottle);
    }

    // Cafetera espresso de diseño sobre la barra
    const coffeeMaker = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.28, 0.24),
      new THREE.MeshStandardMaterial({ color: '#c5a059', metalness: 0.9, roughness: 0.2 })
    );
    coffeeMaker.position.set(-5.65, 1.05, -0.65);
    kitchenGroup.add(coffeeMaker);

    // Luz ambiental cálida de la barra de cocina
    const kitchenLight = new THREE.PointLight('#ffe4b5', 1.8, 4.5);
    kitchenLight.position.set(-5.45, 1.95, 0.20);
    kitchenGroup.add(kitchenLight);

    kitchenGroup.userData.interactiveData = {
      id: 'kitchen-bar',
      name: 'Barra de Cocina & Nevera',
      category: 'interior',
      description: 'Barra de cocina en mármol con placa de inducción, fregadero enrasado, taburetes de diseño y frigorífico integrado en acero grafito.',
      targetView: 'livingCorner',
      hint: 'Clic para vista frontal del salón desde la cocina',
      color: '#10b981',
      icon: '🍳',
    } as InteractiveElementData;
    cabinGroup.add(kitchenGroup);
    interactiveObjects.push(kitchenGroup);

    // =========================================================================
    // 3. REESTRUCTURACIÓN DEL HABITÁCULO: PARED MULTIMEDIA & TV OLED
    // =========================================================================
    // Panel alistonado vertical en madera acústica de nogal
    const acousticPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 2.0),
      new THREE.MeshStandardMaterial({
        map: acousticWoodTex,
        roughness: 0.85,
        metalness: 0.1,
      })
    );
    acousticPanel.position.set(-3.5, 1.25, -1.86);
    acousticPanel.receiveShadow = true;
    cabinGroup.add(acousticPanel);

    // Mueble flotante de TV (Credenza) en madera oscura y encimera de mármol negro
    const tvConsole = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.28, 0.44),
      new THREE.MeshStandardMaterial({
        color: '#151311',
        roughness: 0.6,
        metalness: 0.2,
      })
    );
    tvConsole.position.set(-3.5, 0.44, -1.65);
    tvConsole.castShadow = true;
    tvConsole.receiveShadow = true;
    cabinGroup.add(tvConsole);

    // Pantalla TV OLED 75" ultradelgada
    const tvScreen = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.2, 0.04),
      new THREE.MeshStandardMaterial({
        color: '#080808',
        roughness: 0.1,
        metalness: 0.9,
        emissive: '#0d1829',
        emissiveIntensity: 0.45,
      })
    );
    tvScreen.position.set(-3.5, 1.42, -1.80);
    tvScreen.castShadow = true;
    tvScreen.userData.interactiveData = {
      id: 'tv-screen',
      name: 'Centro Multimedia OLED',
      category: 'interior',
      description: 'Pantalla 4K de 75" integrada sobre panel acústico con iluminación ambiente tenue.',
      targetView: 'interior',
      hint: 'Clic para enfocar zona multimedia',
      color: '#38bdf8',
      icon: '📺',
    } as InteractiveElementData;
    cabinGroup.add(tvScreen);
    interactiveObjects.push(tvScreen);

    // Barra de sonido horizontal Hi-Fi (Soundbar)
    const soundbar = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.8 })
    );
    soundbar.position.set(-3.5, 0.68, -1.72);
    cabinGroup.add(soundbar);

    // Estante superior flotante con adornos y libros
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.04, 0.2),
      new THREE.MeshStandardMaterial({ color: '#2b1b11', roughness: 0.7 })
    );
    shelf.position.set(-3.5, 2.18, -1.74);
    cabinGroup.add(shelf);

    // Libros y elementos decorativos en el estante
    const book1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.16, 0.14),
      new THREE.MeshStandardMaterial({ color: '#a855f7' })
    );
    book1.position.set(-4.0, 2.28, -1.74);
    cabinGroup.add(book1);

    const book2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.18, 0.14),
      new THREE.MeshStandardMaterial({ color: '#f59e0b' })
    );
    book2.position.set(-3.92, 2.29, -1.74);
    cabinGroup.add(book2);

    const vase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.08, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: '#d1d5db', roughness: 0.3 })
    );
    vase.position.set(-3.0, 2.29, -1.74);
    cabinGroup.add(vase);

    // Iluminación trasera de ambiente tenue para la TV
    const tvGlow = new THREE.PointLight('#38bdf8', 0.8, 3.5);
    tvGlow.position.set(-3.5, 1.42, -1.82);
    cabinGroup.add(tvGlow);
    tvGlowLightRef.current = tvGlow;

    // =========================================================================
    // 4. REESTRUCTURACIÓN DEL HABITÁCULO: MOBILIARIO SALÓN (SOFÁ, SILLÓN, MESA)
    // =========================================================================
    // Gran alfombra nórdica de lana suave texturizada
    const rugMat = new THREE.MeshStandardMaterial({
      color: '#32302e',
      roughness: 0.95,
    });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.6), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-3.4, 0.22, 0.1);
    rug.receiveShadow = true;
    cabinGroup.add(rug);

    // Material de tapicería contemporánea gris antracita
    const sofaMat = new THREE.MeshStandardMaterial({
      color: '#2e333a',
      roughness: 0.85,
    });

    // Módulo principal del sofá (asiento ancho frente a TV y fogar)
    const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.38, 0.90), sofaMat);
    sofaMain.position.set(-3.4, 0.40, 0.85);
    sofaMain.castShadow = true;
    sofaMain.receiveShadow = true;
    sofaMain.userData.interactiveData = {
      id: 'sofa',
      name: 'Salón Lounge & Fogar',
      category: 'interior',
      description: 'Sofá contemporáneo ergonómico con orientación directa al fogar rectangular de fuego abierto y pantalla de cine.',
      targetView: 'interior',
      hint: 'Clic para enfocar el salón',
      color: '#a855f7',
      icon: '🛋️',
    } as InteractiveElementData;
    cabinGroup.add(sofaMain);
    interactiveObjects.push(sofaMain);

    // Respaldo del sofá principal
    const sofaMainBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 0.22), sofaMat);
    sofaMainBack.position.set(-3.4, 0.82, 1.25);
    sofaMainBack.castShadow = true;
    cabinGroup.add(sofaMainBack);

    // Cojines decorativos de diseño
    const cushionMat1 = new THREE.MeshStandardMaterial({ color: '#c2623a', roughness: 0.8 }); // Terracota cálido
    const cushion1 = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.34, 0.15), cushionMat1);
    cushion1.position.set(-4.1, 0.68, 1.15);
    cushion1.rotation.y = 0.2;
    cabinGroup.add(cushion1);

    const cushionMat2 = new THREE.MeshStandardMaterial({ color: '#d99b38', roughness: 0.8 }); // Mostaza cálido
    const cushion2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.15), cushionMat2);
    cushion2.position.set(-2.7, 0.68, 1.15);
    cushion2.rotation.y = -0.15;
    cabinGroup.add(cushion2);

    // Butaca / Sillón Lounge Escandinavo de Autor (Nogal curvado + Cuero negro)
    const loungeChairGroup = new THREE.Group();
    loungeChairGroup.position.set(-2.1, 0.22, 0.65);
    loungeChairGroup.rotation.y = -0.55; // Orientado diagonalmente hacia el fogar y la mesa

    const woodShellMat = new THREE.MeshStandardMaterial({
      color: '#2a1a10',
      roughness: 0.5,
      metalness: 0.1,
    });
    const leatherMat = new THREE.MeshStandardMaterial({
      color: '#1a1816',
      roughness: 0.6,
      metalness: 0.1,
    });

    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.12, 0.66), leatherMat);
    chairSeat.position.set(0, 0.22, 0);
    chairSeat.castShadow = true;
    loungeChairGroup.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.56, 0.12), leatherMat);
    chairBack.position.set(0, 0.54, 0.28);
    chairBack.rotation.x = -0.22;
    chairBack.castShadow = true;
    loungeChairGroup.add(chairBack);

    const chairShell = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.08, 0.70), woodShellMat);
    chairShell.position.set(0, 0.14, 0);
    loungeChairGroup.add(chairShell);

    const chairLegs = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8),
      new THREE.MeshStandardMaterial({ color: '#111', metalness: 0.8 })
    );
    chairLegs.position.set(0, 0.06, 0);
    loungeChairGroup.add(chairLegs);

    loungeChairGroup.userData.interactiveData = {
      id: 'lounge-chair',
      name: 'Butaca Lounge de Autor',
      category: 'interior',
      description: 'Sillón ergonómico de madera curvada y piel orientado hacia el fuego del fogar y el ventanal.',
      targetView: 'interior',
      hint: 'Clic para vista lounge',
      color: '#ec4899',
      icon: '🪑',
    } as InteractiveElementData;
    cabinGroup.add(loungeChairGroup);
    interactiveObjects.push(loungeChairGroup);

    // Otomana / Reposapiés de la butaca
    const ottoman = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.28, 0.42), leatherMat);
    ottoman.position.set(-2.3, 0.36, 0.15);
    ottoman.rotation.y = -0.55;
    ottoman.castShadow = true;
    cabinGroup.add(ottoman);

    // Mesa de Centro Escultórica en Roble Macizo
    const coffeeTable = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.26, 0.60),
      new THREE.MeshStandardMaterial({
        color: '#1d1712',
        roughness: 0.75,
        metalness: 0.1,
      })
    );
    coffeeTable.position.set(-3.4, 0.35, -0.05);
    coffeeTable.castShadow = true;
    coffeeTable.receiveShadow = true;
    cabinGroup.add(coffeeTable);

    // Detalles sobre la mesa de centro: Bandeja, taza humeante y libro de arte
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.02, 0.32),
      new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.3 })
    );
    tray.position.set(-3.55, 0.49, -0.05);
    cabinGroup.add(tray);

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.035, 0.07, 16),
      new THREE.MeshStandardMaterial({ color: '#e5e7eb', roughness: 0.2 })
    );
    cup.position.set(-3.65, 0.54, -0.05);
    cabinGroup.add(cup);

    const openBook = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.02, 0.2),
      new THREE.MeshStandardMaterial({ color: '#f3f4f6' })
    );
    openBook.position.set(-3.1, 0.49, -0.05);
    openBook.rotation.y = 0.25;
    cabinGroup.add(openBook);

    // Lámpara de Pie en Arco (Lectura y ambiente cálido)
    const lampArcMat = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.8, roughness: 0.2 });
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), lampArcMat);
    lampBase.position.set(-4.8, 0.24, 1.15);
    cabinGroup.add(lampBase);

    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 12), lampArcMat);
    lampPole.position.set(-4.8, 1.14, 1.15);
    cabinGroup.add(lampPole);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.18, 16, 1, true), lampArcMat);
    lampShade.position.set(-4.6, 1.95, 1.0);
    lampShade.rotation.x = Math.PI / 4;
    cabinGroup.add(lampShade);

    // =========================================================================
    // 5. ZONA COMEDOR CONTIGUA
    // =========================================================================
    const diningTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: '#2b1b11', roughness: 0.6 })
    );
    diningTable.position.set(-0.2, 0.75, 0.2);
    diningTable.castShadow = true;
    diningTable.userData.interactiveData = {
      id: 'dining',
      name: 'Mesa de Comedor de Nogal',
      category: 'interior',
      description: 'Mesa circular artesanal con acabado al aceite natural integrada entre el fogar y los ventanales.',
      targetView: 'interior',
      hint: 'Clic para enfocar zona de comedor',
      color: '#ec4899',
      icon: '🍽️',
    } as InteractiveElementData;
    cabinGroup.add(diningTable);
    interactiveObjects.push(diningTable);

    const diningBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: '#111', metalness: 0.8 })
    );
    diningBase.position.set(-0.2, 0.45, 0.2);
    cabinGroup.add(diningBase);

    // Sillas del comedor
    const chairMat = new THREE.MeshStandardMaterial({ color: '#1a1816', roughness: 0.7 });
    for (let ci = 0; ci < 3; ci++) {
      const cAngle = (ci * (Math.PI * 2)) / 3 + 0.3;
      const chairX = -0.2 + Math.cos(cAngle) * 0.72;
      const chairZ = 0.2 + Math.sin(cAngle) * 0.72;
      const diningChair = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16), chairMat);
      diningChair.position.set(chairX, 0.48, chairZ);
      cabinGroup.add(diningChair);
    }

    const bedBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.3, 2.0),
      new THREE.MeshStandardMaterial({ color: '#111' })
    );
    bedBase.position.set(2.8, 0.35, -0.5);
    bedBase.castShadow = true;
    bedBase.userData.interactiveData = {
      id: 'bedroom',
      name: 'Dormitorio Suite Principal',
      category: 'interior',
      description: 'Espacio de descanso íntimo con orientación este y luz rasante.',
      targetView: 'interior',
      hint: 'Clic para entrar al dormitorio',
      color: '#f59e0b',
      icon: '🛏️',
    } as InteractiveElementData;
    cabinGroup.add(bedBase);
    interactiveObjects.push(bedBase);

    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.2, 1.9),
      new THREE.MeshStandardMaterial({ color: '#d9d4cc', roughness: 0.9 })
    );
    mattress.position.set(2.8, 0.55, -0.45);
    mattress.castShadow = true;
    cabinGroup.add(mattress);

    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.4),
      new THREE.MeshStandardMaterial({ color: '#ffffff' })
    );
    pillow.position.set(2.8, 0.68, -1.2);
    cabinGroup.add(pillow);

    const lampGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({
        color: '#ffcc88',
        emissive: '#ffaa33',
        emissiveIntensity: 1.0,
      })
    );
    lampGlow.position.set(3.9, 0.8, -1.4);
    cabinGroup.add(lampGlow);

    const bathTub = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.5, 1.0),
      new THREE.MeshStandardMaterial({
        color: '#f0f0f0',
        roughness: 0.1,
        metalness: 0.1,
      })
    );
    bathTub.position.set(5.5, 0.45, -1.2);
    bathTub.castShadow = true;
    bathTub.userData.interactiveData = {
      id: 'bath',
      name: 'Baño y Spa Panorámico',
      category: 'interior',
      description: 'Bañera exenta con vistas protegidas y revestimientos cerámicos.',
      targetView: 'interior',
      hint: 'Clic para vista de spa',
      color: '#06b6d4',
      icon: '🛁',
    } as InteractiveElementData;
    cabinGroup.add(bathTub);
    interactiveObjects.push(bathTub);

    const bathScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.8), glassMat);
    bathScreen.position.set(4.8, 1.1, -0.7);
    cabinGroup.add(bathScreen);

    const sink = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: '#222' })
    );
    sink.position.set(5.5, 0.5, 0.8);
    sink.castShadow = true;
    cabinGroup.add(sink);

    const mirror = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: '#fff', metalness: 1.0, roughness: 0.0 })
    );
    mirror.position.set(5.5, 1.4, 1.09);
    mirror.rotation.y = Math.PI;
    cabinGroup.add(mirror);

    // Lights
    const lDist = 7;
    const iLights: THREE.PointLight[] = [];
    const light0 = new THREE.PointLight('#ffb366', lightsOn ? 3.0 : 0, lDist);
    light0.position.set(-4.0, 2.0, 0.0);
    cabinGroup.add(light0);
    iLights.push(light0);

    const light1 = new THREE.PointLight('#ffd899', lightsOn ? 2.0 : 0, lDist);
    light1.position.set(-1.0, 2.0, 0.0);
    cabinGroup.add(light1);
    iLights.push(light1);

    const light2 = new THREE.PointLight('#ffaa66', lightsOn ? 3.0 : 0, lDist);
    light2.position.set(2.8, 2.0, 0.0);
    cabinGroup.add(light2);
    iLights.push(light2);

    const light3 = new THREE.PointLight('#bbeecc', lightsOn ? 2.5 : 0, 5);
    light3.position.set(5.5, 2.0, 0.0);
    cabinGroup.add(light3);
    iLights.push(light3);
    interiorLightsRef.current = iLights;

    const dLights: THREE.PointLight[] = [];
    const dl0 = new THREE.PointLight('#ff9922', lightsOn ? 1.5 : 0, 6);
    dl0.position.set(-4.0, 0.6, 4.0);
    cabinGroup.add(dl0);
    dLights.push(dl0);

    const dl1 = new THREE.PointLight('#ff9922', lightsOn ? 1.5 : 0, 6);
    dl1.position.set(0.0, 0.6, 4.0);
    cabinGroup.add(dl1);
    dLights.push(dl1);

    const dl2 = new THREE.PointLight('#ff9922', lightsOn ? 1.5 : 0, 6);
    dl2.position.set(4.0, 0.6, 4.0);
    cabinGroup.add(dl2);
    dLights.push(dl2);
    deckLightsRef.current = dLights;

    cabinGroup.position.set(1.0, 5.4, -1.0);
    cabinGroup.rotation.y = -0.15;
    scene.add(cabinGroup);

    // --- 3. Stone Steps ---
    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      bumpMap: stoneTex,
      bumpScale: 0.08,
      roughness: 0.95,
    });
    const stepCount = 20;
    const startX = -4.5,
      startY = 1.6,
      startZ = 13.0;
    const endX = -2.5,
      endY = 5.5,
      endZ = 3.5;

    for (let i = 0; i < stepCount; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.9), stoneMat);
      const p = i / (stepCount - 1);
      const px = startX + p * (endX - startX) + Math.sin(p * Math.PI) * 0.4;
      const py = startY + p * (endY - startY);
      const pz = startZ + p * (endZ - startZ);

      step.position.set(px, py, pz);
      step.rotation.y = -0.05 + p * (-0.15 - -0.05);
      step.receiveShadow = true;
      step.castShadow = true;
      step.userData.interactiveData = {
        id: `stone-steps-${i}`,
        name: 'Escalinata de Piedra Rústica',
        category: 'paisaje',
        description: 'Sendero de acceso escalonado tallado en roca natural del terreno.',
        targetView: 'lowAngle',
        hint: 'Clic para vista de escalinata y cota baja',
        color: '#10b981',
        icon: '🏔️',
      } as InteractiveElementData;
      scene.add(step);
      interactiveObjects.push(step);
    }

    // --- 4. Foreground Pine Tree ---
    const barkMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      bumpMap: barkTex,
      bumpScale: 0.3,
      roughness: 0.95,
    });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 24, 18), barkMat);
    trunk.position.set(-5.8, 9.0, 16.5);
    trunk.rotation.z = -0.04;
    trunk.rotation.x = 0.05;
    trunk.castShadow = true;
    trunk.userData.interactiveData = {
      id: 'pine-trunk',
      name: 'Pino Centenario Autóctono',
      category: 'paisaje',
      description: 'Árbol centenario preservado in situ como eje compositivo natural.',
      targetView: 'general',
      hint: 'Clic para vista frontal paisajística',
      color: '#22c55e',
      icon: '🌲',
    } as InteractiveElementData;
    scene.add(trunk);
    interactiveObjects.push(trunk);

    interactiveObjectsRef.current = interactiveObjects;

    for (let i = 0; i < 6; i++) {
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 4.0, 8), barkMat);
      root.position.set(-5.8 + Math.cos(i) * 1.2, -1.0, 16.5 + Math.sin(i) * 1.2);
      root.rotation.z = 0.6 * (i % 2 === 0 ? 1 : -1);
      root.rotation.x = 0.4;
      scene.add(root);
    }

    // --- 5. Pine Forest — SEDON-inspired procedural instancing ---
    // The forest is described by a deterministic seed and rendered in six instanced
    // draw batches (two crossed billboards x three distance bands) instead of creating
    // hundreds of independent Group/Mesh objects. Near trees retain shadows; mid/far
    // bands rely on atmospheric depth and alpha-tested foliage.
    const nearTreeMat = new THREE.MeshStandardMaterial({
      map: realisticTreeTexture,
      transparent: true,
      alphaTest: 0.4,
      side: THREE.DoubleSide,
      roughness: 0.9,
      color: '#ffffff',
      depthWrite: true,
    });
    const midTreeMat = nearTreeMat.clone();
    const farTreeMat = nearTreeMat.clone();

    midTreeMat.transparent = false;
    midTreeMat.alphaTest = 0.42;
    midTreeMat.depthWrite = true;
    midTreeMat.color.set('#f3f7f3');

    farTreeMat.transparent = false;
    farTreeMat.alphaTest = 0.46;
    farTreeMat.depthWrite = true;
    farTreeMat.color.set('#dfe9e2');

    const planeGeo = new THREE.PlaneGeometry(6.4, 16.0);
    const totalTrees = 240;

    type ForestBand = {
      a: THREE.InstancedMesh;
      b: THREE.InstancedMesh;
      count: number;
      castsShadow: boolean;
      receivesShadow: boolean;
    };

    const createForestBand = (
      material: THREE.MeshStandardMaterial,
      castsShadow: boolean,
      receivesShadow: boolean
    ): ForestBand => ({
      a: new THREE.InstancedMesh(planeGeo, material, totalTrees),
      b: new THREE.InstancedMesh(planeGeo, material, totalTrees),
      count: 0,
      castsShadow,
      receivesShadow,
    });

    const forestBands: ForestBand[] = [
      createForestBand(nearTreeMat, true, true),
      createForestBand(midTreeMat, false, true),
      createForestBand(farTreeMat, false, false),
    ];

    // Mulberry32-style deterministic PRNG: the same compact scene description
    // always reconstructs the same forest across reloads and devices.
    let forestSeed = 0x6d2b79f5;
    const forestRandom = () => {
      forestSeed = (forestSeed + 0x6d2b79f5) | 0;
      let t = forestSeed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const treeTransform = new THREE.Object3D();

    for (let i = 0; i < totalTrees; i++) {
      const px = (forestRandom() - 0.5) * 120;
      const pz = 8.0 - forestRandom() * 98.0;

      // Preserve the architectural clearings from the original scene.
      if (px > -8.0 && px < 8.0 && pz > -5.0 && pz < 28.0) continue;
      if (px > 5.0 && px < 25.0 && pz > -5.0 && pz < 15.0) continue;

      const scale = pz < -30
        ? 1.4 + forestRandom() * 1.2
        : 0.42 + forestRandom() * 0.35;
      const rotation = forestRandom() * Math.PI;
      const terrainHeight = (pz + 20) * 0.16 + 8 * scale - 2.0;

      // Three perceptual LOD bands. The geometry stays tiny while shadows and
      // material cost fall away with distance.
      const depth = -pz;
      const bandIndex = depth < 20 ? 0 : depth < 55 ? 1 : 2;
      const band = forestBands[bandIndex];
      const instanceIndex = band.count;

      treeTransform.position.set(px, terrainHeight, pz);
      treeTransform.scale.set(scale, scale, scale);
      treeTransform.rotation.set(0, rotation, 0);
      treeTransform.updateMatrix();
      band.a.setMatrixAt(instanceIndex, treeTransform.matrix);

      treeTransform.rotation.y = rotation + Math.PI / 2;
      treeTransform.updateMatrix();
      band.b.setMatrixAt(instanceIndex, treeTransform.matrix);

      band.count += 1;
    }

    forestBands.forEach((band) => {
      for (const mesh of [band.a, band.b]) {
        mesh.count = band.count;
        mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        mesh.instanceMatrix.needsUpdate = true;
        mesh.castShadow = band.castsShadow;
        mesh.receiveShadow = band.receivesShadow;
        mesh.frustumCulled = true;
        mesh.computeBoundingBox();
        mesh.computeBoundingSphere();
        scene.add(mesh);
      }
    });

    // --- 6. Atmospheric Floating Particles ---
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArr[i] = (Math.random() - 0.5) * 80;
      posArr[i + 1] = Math.random() * 25;
      posArr[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particlePoints = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: '#ffffff',
        size: 0.15,
        transparent: true,
        opacity: 0.15,
      })
    );
    scene.add(particlePoints);
    particleSystemRef.current = particlePoints;

    // --- Resize Handler ---
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    const raycaster = new THREE.Raycaster();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();

      // Smooth pointer parallax
      pointerCurrentRef.current.x += (pointerTargetRef.current.x - pointerCurrentRef.current.x) * 0.05;
      pointerCurrentRef.current.y += (pointerTargetRef.current.y - pointerCurrentRef.current.y) * 0.05;

      const pX = pointerCurrentRef.current.x * 0.35;
      const pY = pointerCurrentRef.current.y * 0.25;

      // Handle Camera Movement: Cinematic Tour, Auto-Panorama, or Smooth Curved View Transitions
      if (cameraRef.current) {
        if (isCinematicTourRef.current) {
          // --- Automatic Inactivity Cinematic POI Tour ---
          const currentPOI = CINEMATIC_POIS[poiIndexRef.current];
          if (poiStartTimeRef.current === 0) {
            poiStartTimeRef.current = now;
          }
          const elapsed = now - poiStartTimeRef.current;
          const rawT = Math.min(1.0, elapsed / currentPOI.duration);
          const easedT = easeInOutCubic(rawT);

          const startP = new THREE.Vector3(currentPOI.startPos.x, currentPOI.startPos.y, currentPOI.startPos.z);
          const endP = new THREE.Vector3(currentPOI.endPos.x, currentPOI.endPos.y, currentPOI.endPos.z);
          const startL = new THREE.Vector3(currentPOI.startLookAt.x, currentPOI.startLookAt.y, currentPOI.startLookAt.z);
          const endL = new THREE.Vector3(currentPOI.endLookAt.x, currentPOI.endLookAt.y, currentPOI.endLookAt.z);

          let camPos: THREE.Vector3;
          if (currentPOI.controlPoint) {
            const ctrlP = new THREE.Vector3(currentPOI.controlPoint.x, currentPOI.controlPoint.y, currentPOI.controlPoint.z);
            camPos = sampleBezierCurve(startP, ctrlP, endP, easedT);
          } else {
            camPos = startP.clone().lerp(endP, easedT);
          }

          cameraRef.current.position.set(camPos.x, camPos.y, camPos.z);
          currentLookAtRef.current.lerpVectors(startL, endL, easedT);

          const targetFOV = currentPOI.fov || 60;
          cameraRef.current.fov = targetFOV + Math.sin(rawT * Math.PI) * 1.5;
          cameraRef.current.updateProjectionMatrix();

          // Notify UI about active POI progress
          if (onPOIUpdateRef.current) {
            onPOIUpdateRef.current(poiIndexRef.current, rawT);
          }

          // Advance to next POI seamlessly when time expires
          if (rawT >= 1.0) {
            poiIndexRef.current = (poiIndexRef.current + 1) % CINEMATIC_POIS.length;
            poiStartTimeRef.current = now;
          }
        } else if (isAutoPanoramaRef.current) {
          // Automatic 360 cinematic panoramic orbit
          const panTime = now * 0.00009;
          const orbitRadius = 24.0 + Math.sin(panTime * 2.0) * 3.0;
          const targetCamX = Math.sin(panTime) * orbitRadius;
          const targetCamZ = Math.cos(panTime) * orbitRadius;
          const targetCamY = 6.8 + Math.sin(panTime * 2.5) * 2.0;

          cameraRef.current.position.x += (targetCamX - cameraRef.current.position.x) * 0.04;
          cameraRef.current.position.y += (targetCamY - cameraRef.current.position.y) * 0.04;
          cameraRef.current.position.z += (targetCamZ - cameraRef.current.position.z) * 0.04;

          currentLookAtRef.current.x += (0.5 - currentLookAtRef.current.x) * 0.04;
          currentLookAtRef.current.y += (5.2 - currentLookAtRef.current.y) * 0.04;
          currentLookAtRef.current.z += (0.0 - currentLookAtRef.current.z) * 0.04;
        } else if (isTransitioningRef.current) {
          const elapsed = now - transitionStartRef.current;
          const rawT = Math.min(1.0, elapsed / transitionDuration);
          const easedT = easeInOutCubic(rawT);

          // Sample curved bezier position along stabilized 3D flight trajectory
          const curvePos = sampleBezierCurve(
            startPosRef.current,
            controlPointRef.current,
            targetPosRef.current,
            easedT
          );

          // Pure cinematic glide along mathematical curve (zero sudden snapping)
          cameraRef.current.position.copy(curvePos);

          // Interpolate lookAt target smoothly
          currentLookAtRef.current.lerpVectors(
            startLookAtRef.current,
            targetLookAtRef.current,
            easedT
          );

          // Subtle natural cinematic FOV dynamic during flight
          cameraRef.current.fov = 60 - Math.sin(rawT * Math.PI) * 1.2;
          cameraRef.current.updateProjectionMatrix();

          if (rawT >= 1.0) {
            isTransitioningRef.current = false;
            cameraRef.current.fov = 60;
            cameraRef.current.position.copy(targetPosRef.current);
            currentLookAtRef.current.copy(targetLookAtRef.current);
            cameraRef.current.updateProjectionMatrix();
            userYawRef.current = 0;
            userPitchRef.current = 0;
            userPanXRef.current = 0;
            targetUserYawRef.current = 0;
            targetUserPitchRef.current = 0;
            targetUserPanXRef.current = 0;
          }
        } else {
          // --- Interactive Look-Around & Smooth Cinematic Parallax in Active Scene ---
          userYawRef.current += (targetUserYawRef.current - userYawRef.current) * 0.09;
          userPitchRef.current += (targetUserPitchRef.current - userPitchRef.current) * 0.09;
          userPanXRef.current += (targetUserPanXRef.current - userPanXRef.current) * 0.09;

          const baseDir = new THREE.Vector3().subVectors(targetLookAtRef.current, targetPosRef.current);
          const dist = Math.max(3.0, baseDir.length());
          const baseYaw = Math.atan2(baseDir.x, baseDir.z);
          const basePitch = Math.asin(THREE.MathUtils.clamp(baseDir.y / dist, -0.99, 0.99));

          const parallaxInfluence = isManual360Ref.current ? 0 : 0.035;
          const totalYaw = baseYaw + userYawRef.current + pX * parallaxInfluence;
          const totalPitch = THREE.MathUtils.clamp(
            basePitch + userPitchRef.current + pY * parallaxInfluence,
            -1.25,
            1.25
          );

          const cosP = Math.cos(totalPitch);
          const fwdX = Math.sin(totalYaw) * cosP;
          const fwdY = Math.sin(totalPitch);
          const fwdZ = Math.cos(totalYaw) * cosP;

          const rightX = Math.cos(totalYaw);
          const rightZ = -Math.sin(totalYaw);

          const targetCamX = targetPosRef.current.x + rightX * userPanXRef.current;
          const targetCamY = targetPosRef.current.y;
          const targetCamZ = targetPosRef.current.z + rightZ * userPanXRef.current;

          cameraRef.current.position.x += (targetCamX - cameraRef.current.position.x) * 0.08;
          cameraRef.current.position.y += (targetCamY - cameraRef.current.position.y) * 0.08;
          cameraRef.current.position.z += (targetCamZ - cameraRef.current.position.z) * 0.08;

          const targetLookX = cameraRef.current.position.x + fwdX * dist;
          const targetLookY = cameraRef.current.position.y + fwdY * dist;
          const targetLookZ = cameraRef.current.position.z + fwdZ * dist;

          currentLookAtRef.current.x += (targetLookX - currentLookAtRef.current.x) * 0.09;
          currentLookAtRef.current.y += (targetLookY - currentLookAtRef.current.y) * 0.09;
          currentLookAtRef.current.z += (targetLookZ - currentLookAtRef.current.z) * 0.09;
        }

        cameraRef.current.lookAt(currentLookAtRef.current);
      }

      // Flashlight Aim & Dynamic Spotlight (Active in all scenes when toggled)
      if (flashlightRef.current && flashlightTargetRef.current && cameraRef.current) {
        const targetIntensity = flashlightOnRef.current ? 8.5 : 0;

        flashlightRef.current.intensity = THREE.MathUtils.lerp(
          flashlightRef.current.intensity,
          targetIntensity,
          0.12
        );

        if (flashlightRef.current.intensity > 0.02) {
          flashlightRef.current.position.copy(cameraRef.current.position);

          const aimDir = new THREE.Vector3().subVectors(currentLookAtRef.current, cameraRef.current.position).normalize();
          const aimDistance = 14.0;
          flashlightTargetRef.current.position.set(
            cameraRef.current.position.x + aimDir.x * aimDistance,
            cameraRef.current.position.y + aimDir.y * aimDistance,
            cameraRef.current.position.z + aimDir.z * aimDistance
          );
        }
      }

      // Dynamic Solar Calculation & Smooth Atmospheric Environment Interpolation
      const solar = computeSolarLighting(timeOfDayRef.current);

      // 1. Update procedural atmospheric sky shader
      if (atmosphericSkyRef.current) {
        atmosphericSkyRef.current.update(solar, now * 0.001);
      }

      // 2. Update scene fog, ambient & directional sunlight
      if (sceneRef.current && fogRef.current && ambientLightRef.current && dirLightRef.current) {
        fogRef.current.color.lerp(solar.fogColor, 0.05);
        fogRef.current.near += (solar.fogNear - fogRef.current.near) * 0.05;
        fogRef.current.far += (solar.fogFar - fogRef.current.far) * 0.05;

        ambientLightRef.current.color.lerp(solar.ambientColor, 0.05);
        ambientLightRef.current.intensity += (solar.ambientIntensity - ambientLightRef.current.intensity) * 0.05;

        dirLightRef.current.color.lerp(solar.sunColor, 0.05);
        dirLightRef.current.intensity += (solar.sunIntensity - dirLightRef.current.intensity) * 0.05;
        dirLightRef.current.position.lerp(solar.sunPosition, 0.05);
      }

      // 3. Dynamic Fire Hearth & Flame Animation
      if (fireLightRef.current) {
        const flicker =
          Math.sin(now * 0.014) * 0.38 +
          Math.cos(now * 0.029) * 0.24 +
          Math.sin(now * 0.007) * 0.15;
        fireLightRef.current.intensity = 2.8 + flicker;
      }

      if (fireMeshesRef.current && fireMeshesRef.current.length > 0) {
        fireMeshesRef.current.forEach((mesh, idx) => {
          const flameScaleY = 1.0 + Math.sin(now * 0.009 + idx * 1.5) * 0.12 + Math.cos(now * 0.017 + idx) * 0.08;
          const flameScaleX = 1.0 + Math.cos(now * 0.011 + idx * 0.8) * 0.06;
          mesh.scale.set(flameScaleX, flameScaleY, 1);
        });
      }

      // 4. Subtle TV screen backlight pulse
      if (tvGlowLightRef.current) {
        tvGlowLightRef.current.intensity = 0.75 + Math.sin(now * 0.003) * 0.12;
      }

      // Floating particles rotation
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y += 0.0003;
        (particleSystemRef.current.material as THREE.PointsMaterial).color.lerp(
          solar.sunColor,
          0.02
        );
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // --- Pointer & Touch Drag Handlers (Look-Around & Lateral Roaming or Scene Scroll) ---
    const handlePointerDown = (e: PointerEvent) => {
      // Allow primary button or touch pointers
      if (e.button === 0 || e.pointerType === 'touch') {
        isDraggingLookRef.current = true;
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
        touchStartYRef.current = e.clientY;
        touchStartXRef.current = e.clientX;
        if (onInteractRef.current) onInteractRef.current();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointerTargetRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTargetRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;

      if (isDraggingLookRef.current) {
        const dx = e.clientX - lastPointerPosRef.current.x;
        const dy = e.clientY - lastPointerPosRef.current.y;
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

        if (onInteractRef.current) onInteractRef.current();

        // 360° Look-around only allowed when manual scene selection is active
        if (isManual360Ref.current) {
          const sensX = 0.0040;
          const sensY = 0.0032;
          const panSens = 0.0055;

          targetUserYawRef.current -= dx * sensX;
          targetUserPitchRef.current = THREE.MathUtils.clamp(
            targetUserPitchRef.current + dy * sensY,
            -1.15,
            1.15
          );
          targetUserPanXRef.current = THREE.MathUtils.clamp(
            targetUserPanXRef.current - dx * panSens,
            -2.2,
            2.2
          );
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingLookRef.current && !isManual360Ref.current) {
        const totalDy = e.clientY - touchStartYRef.current;
        const now = performance.now();
        if (Math.abs(totalDy) > 35 && now - lastScrollTimeRef.current > 750) {
          if (totalDy < 0) {
            onNextViewRef.current?.();
          } else {
            onPrevViewRef.current?.();
          }
          lastScrollTimeRef.current = now;
        }
      }
      isDraggingLookRef.current = false;
    };

    // Touch Handlers for mobile & tablet drag gestures
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingLookRef.current = true;
        lastPointerPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchStartYRef.current = e.touches[0].clientY;
        touchStartXRef.current = e.touches[0].clientX;
        if (onInteractRef.current) onInteractRef.current();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        pointerTargetRef.current.x = (touch.clientX / window.innerWidth - 0.5) * 2;
        pointerTargetRef.current.y = -(touch.clientY / window.innerHeight - 0.5) * 2;

        if (isDraggingLookRef.current) {
          const dx = touch.clientX - lastPointerPosRef.current.x;
          const dy = touch.clientY - lastPointerPosRef.current.y;
          lastPointerPosRef.current = { x: touch.clientX, y: touch.clientY };

          if (onInteractRef.current) onInteractRef.current();

          // 360° Drag only when manual scene mode is active
          if (isManual360Ref.current) {
            const sensX = 0.0045;
            const sensY = 0.0035;
            const panSens = 0.006;

            targetUserYawRef.current -= dx * sensX;
            targetUserPitchRef.current = THREE.MathUtils.clamp(
              targetUserPitchRef.current + dy * sensY,
              -1.15,
              1.15
            );
            targetUserPanXRef.current = THREE.MathUtils.clamp(
              targetUserPanXRef.current - dx * panSens,
              -2.2,
              2.2
            );
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isDraggingLookRef.current && !isManual360Ref.current && e.changedTouches.length > 0) {
        const totalDy = e.changedTouches[0].clientY - touchStartYRef.current;
        const now = performance.now();
        if (Math.abs(totalDy) > 35 && now - lastScrollTimeRef.current > 750) {
          if (totalDy < 0) {
            onNextViewRef.current?.();
          } else {
            onPrevViewRef.current?.();
          }
          lastScrollTimeRef.current = now;
        }
      }
      isDraggingLookRef.current = false;
    };

    // Wheel Scroll Scene Transition (Initial Mode)
    const handleWheel = (e: WheelEvent) => {
      if (isAutoPanoramaRef.current || isCinematicTourRef.current) return;
      if (onInteractRef.current) onInteractRef.current();

      // If in initial mode (or not in 360 mode), wheel scroll navigates scenes
      if (!isManual360Ref.current) {
        const now = performance.now();
        if (Math.abs(e.deltaY) > 12 && now - lastScrollTimeRef.current > 750) {
          if (e.deltaY > 0) {
            onNextViewRef.current?.();
          } else {
            onPrevViewRef.current?.();
          }
          lastScrollTimeRef.current = now;
        }
      }
    };

    // Keyboard navigation (1, 2, 3, 4 for camera views)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAutoPanoramaRef.current || isCinematicTourRef.current) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const num = parseInt(e.key, 10) - 1;
        if (num >= 0 && num < VIEW_ORDER.length) {
          if (onInteractRef.current) onInteractRef.current();
          onViewChangeRef.current(VIEW_ORDER[num]);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        onNextViewRef.current?.();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        onPrevViewRef.current?.();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const activeCssFilter = VISUAL_FILTERS[visualFilter]?.cssFilter || 'none';

  return (
    <div
      id="webgl-container"
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0 transition-[filter] duration-700 ease-out"
      style={{ filter: activeCssFilter }}
    />
  );
}
