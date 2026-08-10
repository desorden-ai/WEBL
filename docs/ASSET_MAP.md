# DESWEB3D — ASSET MAP

## Regla

Este documento describe únicamente destinos de integración web. La fuente maestra de producción permanece en Drive.

## Modelos

| Asset | Estado | Ruta web prevista |
|---|---|---|
| Vivienda exterior definitiva | Pendiente de aprobación | `static/models/exterior/house-exterior.glb` |
| Plataforma/terreno separada | Opcional / pendiente | `static/models/terrain/platform.glb` |

## Texturas

| Grupo | Estado | Ruta |
|---|---|---|
| Arquitectura | Pendiente | `static/textures/architecture/` |
| Terreno | Pendiente | `static/textures/terrain/` |
| Vegetación | Fuera de V0.1 | `static/textures/vegetation/` |

## Iluminación

| Asset | Estado | Ruta |
|---|---|---|
| HDRI día | Pendiente | `static/environment/daylight.hdr` |
| HDRI noche | Fuera de alcance actual | `static/environment/night.hdr` |

## Preproducción vigente

- P0 V0.3: aprobada como base geométrica provisional.
- P1 V0.1: aprobada provisionalmente para construir el blockout y seguir desarrollo técnico.
- Fachadas Sur y Este: `PROPUESTA`.
- Vuelo Norte 1,00 m: `DEDUCIDO`, no definitivo.
- Ningún Google Doc técnico con nombre histórico `.png` se considera un PNG real ni un asset de runtime.

## Blockout

El blockout actual vive en `src/components/ExteriorBlockout.jsx` y se carga a través de `src/components/ExteriorModel.jsx`.

Funciones del blockout:

- validar escala;
- validar encuadre y cámara;
- validar gestos móviles;
- validar loader y estados de error;
- mantener el visor funcional mientras el GLB definitivo no exista.

Debe mantenerse como fallback explícito hasta que el GLB aprobado esté integrado y validado.

## Contrato del GLB exterior

Ruta fuente web:

`static/models/exterior/house-exterior.glb`

URL runtime:

`/models/exterior/house-exterior.glb`

Condiciones antes de activarlo:

1. geometría aprobada;
2. escala en metros coherente con 10,80 × 9,60 × ≈6,90 m;
3. pivote/origen documentado;
4. materiales y texturas sin rutas rotas;
5. orientación compatible con el sistema del proyecto;
6. carga probada en móvil;
7. fallback recuperable ante error.

La activación se controla con `PROJECT.runtime.useApprovedExteriorModel`.
