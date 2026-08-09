# DESWEB3D — ASSET MAP

## Regla

Este documento describe únicamente destinos de integración web. La fuente maestra de producción permanece en Drive.

## Modelos

| Asset | Estado | Ruta web prevista |
|---|---|---|
| Vivienda exterior definitiva | Pendiente de aprobación | `static/models/exterior/house-exterior.glb` |
| Plataforma/terreno separada | Pendiente | `static/models/terrain/platform.glb` |

## Texturas

| Grupo | Estado | Ruta |
|---|---|---|
| Arquitectura | Pendiente | `static/textures/architecture/` |
| Terreno | Pendiente | `static/textures/terrain/` |
| Vegetación | Pendiente | `static/textures/vegetation/` |

## Iluminación

| Asset | Estado | Ruta |
|---|---|---|
| HDRI día | Pendiente | `static/environment/daylight.hdr` |
| HDRI noche | Fuera de alcance actual | `static/environment/night.hdr` |

## Preproducción vigente

P0 V0.2 se produce y revisa exclusivamente en Drive. Ningún PNG de planos/alzados es un asset de runtime del visor.

## Blockout

El blockout actual vive como geometría JSX en `src/components/ExteriorModel.jsx`. Debe eliminarse o convertirse en fallback explícito cuando se integre el GLB exterior aprobado.
