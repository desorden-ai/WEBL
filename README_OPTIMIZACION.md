# Mansión Refugio 3D — Arquitectura de optimización

Este proyecto mantiene el recorrido cinematográfico React existente como experiencia principal y añade un runtime Three.js progresivo opcional. El visor 3D solo se activa cuando existe un modelo canónico.

## Pipeline GLB

1. Colocar el modelo fuente en `src/assets/raw/mansion.glb`.
2. Ejecutar `npm run optimize:models`.
3. El script genera `public/models/mansion.glb` con geometría Draco y texturas WebP.
4. También genera `public/3d-manifest.json`, que habilita el visor progresivo.

Si no existe ningún GLB fuente ni un modelo optimizado previo, el script genera un manifest desactivado y el build continúa con la experiencia cinematográfica. Esto evita que una ausencia de asset 3D rompa producción.

El pipeline usa glTF Transform CLI 4.4.2 con:

```bash
npx --yes @gltf-transform/cli@4.4.2 optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp
```

## Runtime progresivo

`ProgressiveModelViewer.tsx`:

- lee `3d-manifest.json`;
- detecta WebGL antes de crear el renderer;
- importa Three.js, GLTFLoader, DRACOLoader y OrbitControls de forma dinámica;
- usa `THREE.LoadingManager` para progreso real de assets;
- mantiene el vídeo como fallback si WebGL o el modelo fallan;
- activa frustum culling en cada mesh;
- limita órbita, polar angle y distancias para mantener la cámara fuera del volumen principal del edificio;
- ofrece modos Low / Medium / High con pixelRatio, sombras y tone mapping distintos.

El renderer 3D solo dibuja cuando el visor está abierto, reduciendo uso de GPU en el recorrido de vídeo.

## Calidad gráfica

- **Low**: pixel ratio 1, sin sombras, sin tone mapping.
- **Medium**: pixel ratio hasta 1.5, sombras 1024, ACES.
- **High**: pixel ratio hasta 2, sombras 2048 PCFSoft, ACES.

Móvil/coarse pointer parte en Low; escritorio parte en Medium.

## Seguridad y caché

`public/_headers` define CSP, `frame-ancestors`, permisos restringidos, MIME sniffing protection y caché inmutable para bundles versionados, modelos y texturas. El vídeo cinematográfico no se marca como immutable porque su ruta no contiene hash de contenido.

## SEO / A11y

`index.html` incluye canonical, Open Graph, Twitter Card, contenido semántico oculto para crawlers/lectores de pantalla, `noscript` y descripción del recorrido. La aplicación mantiene controles de teclado y añade una guía visible en escritorio.
