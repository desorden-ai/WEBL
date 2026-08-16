import { useEffect, useRef, useState } from 'react';
import type { GraphicsQuality } from '../types';

type RuntimeState = 'disabled' | 'checking' | 'loading' | 'ready' | 'unsupported' | 'error';

interface ModelManifest {
  enabled: boolean;
  model: string;
  decoderPath?: string;
}

interface ProgressiveModelViewerProps {
  quality: GraphicsQuality;
}

interface RuntimeHandle {
  applyQuality: (quality: GraphicsQuality) => void;
  dispose: () => void;
}

const DEFAULT_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

function resolveAsset(relativePath: string) {
  const normalized = relativePath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalized}`;
}

export function ProgressiveModelViewer({ quality }: ProgressiveModelViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<RuntimeHandle | null>(null);
  const openRef = useRef(false);
  const [manifest, setManifest] = useState<ModelManifest | null>(null);
  const [runtimeState, setRuntimeState] = useState<RuntimeState>('checking');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    openRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;

    const inspectManifest = async () => {
      try {
        const response = await fetch(resolveAsset('3d-manifest.json'), {
          cache: 'no-cache',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          if (!cancelled) setRuntimeState('disabled');
          return;
        }

        const candidate = (await response.json()) as Partial<ModelManifest>;
        if (!candidate.enabled || !candidate.model) {
          if (!cancelled) setRuntimeState('disabled');
          return;
        }

        if (!cancelled) {
          setRuntimeState('loading');
          setManifest({
            enabled: true,
            model: candidate.model,
            decoderPath: candidate.decoderPath || DEFAULT_DECODER_PATH,
          });
        }
      } catch {
        if (!cancelled) setRuntimeState('disabled');
      }
    };

    void inspectManifest();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!manifest || !hostRef.current) return;
    if (!isWebGLAvailable()) {
      setRuntimeState('unsupported');
      return;
    }

    let disposed = false;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;

    const boot = async () => {
      setRuntimeState('loading');
      setLoadingProgress(0);

      try {
        const [THREE, gltfModule, dracoModule, controlsModule] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/loaders/DRACOLoader.js'),
          import('three/examples/jsm/controls/OrbitControls.js'),
        ]);

        if (disposed || !hostRef.current) return;

        const host = hostRef.current;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#050807');
        scene.fog = new THREE.FogExp2('#07100e', 0.012);

        const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 1500);
        camera.position.set(10, 5.5, 14);

        const renderer = new THREE.WebGLRenderer({
          antialias: quality !== 'low',
          alpha: false,
          powerPreference: 'high-performance',
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor('#050807', 1);
        renderer.domElement.setAttribute('aria-label', 'Modelo 3D interactivo de Mansión Refugio');
        renderer.domElement.setAttribute('role', 'img');
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.touchAction = 'none';
        host.appendChild(renderer.domElement);

        const controls = new controlsModule.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.055;
        controls.enablePan = true;
        controls.screenSpacePanning = false;
        controls.minPolarAngle = 0.12;
        controls.maxPolarAngle = Math.PI / 2 - 0.045;
        controls.rotateSpeed = 0.55;
        controls.zoomSpeed = 0.72;
        controls.panSpeed = 0.55;

        const hemiLight = new THREE.HemisphereLight('#dce9e4', '#17201c', 1.25);
        scene.add(hemiLight);

        const keyLight = new THREE.DirectionalLight('#fff3df', 2.2);
        keyLight.position.set(16, 24, 12);
        keyLight.castShadow = true;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 180;
        keyLight.shadow.camera.left = -35;
        keyLight.shadow.camera.right = 35;
        keyLight.shadow.camera.top = 35;
        keyLight.shadow.camera.bottom = -35;
        keyLight.shadow.bias = -0.00035;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight('#8eb8af', 0.55);
        fillLight.position.set(-14, 10, -10);
        scene.add(fillLight);

        let loadedModel: InstanceType<typeof THREE.Group> | null = null;

        const resize = () => {
          if (disposed || !hostRef.current) return;
          const width = Math.max(1, hostRef.current.clientWidth || window.innerWidth);
          const height = Math.max(1, hostRef.current.clientHeight || window.innerHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };

        const applyQuality = (level: GraphicsQuality) => {
          const deviceRatio = window.devicePixelRatio || 1;
          const pixelRatio =
            level === 'low'
              ? 1
              : level === 'medium'
                ? Math.min(deviceRatio, 1.5)
                : Math.min(deviceRatio, 2);

          renderer.setPixelRatio(pixelRatio);
          renderer.shadowMap.enabled = level !== 'low';
          renderer.shadowMap.type =
            level === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
          renderer.toneMapping =
            level === 'low' ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = level === 'high' ? 1.08 : 1;

          keyLight.castShadow = level !== 'low';
          const shadowSize = level === 'high' ? 2048 : level === 'medium' ? 1024 : 512;
          if (keyLight.shadow.mapSize.width !== shadowSize) {
            keyLight.shadow.map?.dispose();
            keyLight.shadow.map = null;
            keyLight.shadow.mapSize.set(shadowSize, shadowSize);
          }

          loadedModel?.traverse((child) => {
            const mesh = child as InstanceType<typeof THREE.Mesh>;
            if (!mesh.isMesh) return;
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((material) => {
              material.needsUpdate = true;
            });
          });
          resize();
        };

        const loadingManager = new THREE.LoadingManager();
        loadingManager.onStart = () => setLoadingProgress(2);
        loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
          if (!itemsTotal) return;
          setLoadingProgress(Math.max(2, Math.min(99, Math.round((itemsLoaded / itemsTotal) * 100))));
        };
        loadingManager.onError = (url) => {
          console.error(`Error cargando asset 3D: ${url}`);
        };

        const dracoLoader = new dracoModule.DRACOLoader(loadingManager);
        dracoLoader.setDecoderPath(manifest.decoderPath || DEFAULT_DECODER_PATH);
        dracoLoader.preload();

        const gltfLoader = new gltfModule.GLTFLoader(loadingManager);
        gltfLoader.setDRACOLoader(dracoLoader);

        gltfLoader.load(
          resolveAsset(manifest.model),
          (gltf) => {
            if (disposed) return;
            loadedModel = gltf.scene;
            loadedModel.traverse((child) => {
              const mesh = child as InstanceType<typeof THREE.Mesh>;
              if (!mesh.isMesh) return;
              mesh.frustumCulled = true;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((material) => {
                const candidate = material as InstanceType<typeof THREE.MeshStandardMaterial>;
                if ('map' in candidate && candidate.map) {
                  candidate.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
                }
              });
            });

            const box = new THREE.Box3().setFromObject(loadedModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const radius = Math.max(1, size.length() * 0.5);

            controls.target.copy(center);
            controls.minDistance = Math.max(2.5, radius * 1.02);
            controls.maxDistance = Math.max(30, radius * 4.2);
            camera.near = Math.max(0.05, radius / 150);
            camera.far = Math.max(250, radius * 18);
            camera.position.set(
              center.x + radius * 1.15,
              center.y + radius * 0.58,
              center.z + radius * 1.6
            );
            camera.updateProjectionMatrix();
            controls.update();
            scene.add(loadedModel);
            applyQuality(quality);
            setLoadingProgress(100);
            setRuntimeState('ready');
          },
          undefined,
          (error) => {
            console.error('No se pudo cargar el modelo 3D:', error);
            if (!disposed) setRuntimeState('error');
          }
        );

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        window.addEventListener('resize', resize);
        applyQuality(quality);

        const render = () => {
          if (disposed) return;
          if (openRef.current) {
            controls.update();
            renderer.render(scene, camera);
          }
          animationFrame = requestAnimationFrame(render);
        };
        animationFrame = requestAnimationFrame(render);

        runtimeRef.current = {
          applyQuality,
          dispose: () => {
            window.removeEventListener('resize', resize);
            resizeObserver?.disconnect();
            controls.dispose();
            dracoLoader.dispose();
            loadedModel?.traverse((child) => {
              const mesh = child as InstanceType<typeof THREE.Mesh>;
              if (!mesh.isMesh) return;
              mesh.geometry.dispose();
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((material) => material.dispose());
            });
            renderer.dispose();
            renderer.domElement.remove();
          },
        };
      } catch (error) {
        console.error('Error inicializando el runtime Three.js:', error);
        if (!disposed) setRuntimeState('error');
      }
    };

    void boot();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
      resizeObserver?.disconnect();
    };
  }, [manifest]);

  useEffect(() => {
    runtimeRef.current?.applyQuality(quality);
  }, [quality]);

  if (runtimeState === 'disabled' || runtimeState === 'checking') return null;

  return (
    <>
      <div
        id="three-runtime-status"
        role="status"
        aria-live="polite"
        className="fixed left-3 bottom-24 sm:left-4 sm:bottom-4 z-50 pointer-events-none"
      >
        {runtimeState === 'loading' && (
          <div className="w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-white/15 bg-black/70 p-3 text-white shadow-xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-widest">
              <span>Preparando modelo 3D</span>
              <span className="font-mono">{loadingProgress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div className="h-full bg-emerald-400 transition-[width] duration-300" style={{ width: `${loadingProgress}%` }} />
            </div>
          </div>
        )}

        {runtimeState === 'unsupported' && (
          <div role="alert" className="max-w-sm rounded-xl border border-amber-300/30 bg-black/75 p-4 text-sm text-white shadow-xl backdrop-blur-xl">
            <strong className="block mb-1">WebGL no disponible</strong>
            <span className="text-white/75">Se mantiene el recorrido cinematográfico 2D como fallback.</span>
          </div>
        )}

        {runtimeState === 'error' && (
          <div role="alert" className="max-w-sm rounded-xl border border-red-300/30 bg-black/75 p-4 text-sm text-white shadow-xl backdrop-blur-xl">
            <strong className="block mb-1">Modelo 3D no disponible</strong>
            <span className="text-white/75">La experiencia de vídeo continúa funcionando con normalidad.</span>
          </div>
        )}
      </div>

      {runtimeState === 'ready' && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed left-3 bottom-24 sm:left-4 sm:bottom-4 z-50 rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-xl backdrop-blur-xl hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
        >
          Abrir modelo 3D
        </button>
      )}

      <section
        data-three-stage
        aria-label="Visor 3D interactivo"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[60] bg-[#050807] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div ref={hostRef} className="absolute inset-0" />

        {isOpen && (
          <>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 z-10 min-h-11 rounded-lg border border-white/15 bg-black/55 px-4 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
            >
              Volver al recorrido
            </button>
            <aside className="absolute left-3 bottom-3 z-10 max-w-[calc(100vw-1.5rem)] rounded-lg border border-white/15 bg-black/55 px-3 py-2 text-[11px] text-white/80 backdrop-blur-md" aria-label="Controles del modelo 3D">
              Arrastrar: orbitar · Rueda/pellizco: zoom · Shift + arrastrar: desplazar
            </aside>
          </>
        )}
      </section>
    </>
  );
}
