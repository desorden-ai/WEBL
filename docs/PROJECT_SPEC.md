# DESWEB3D — PROJECT SPEC

## Objetivo V0.1

Construir un visor inmobiliario 3D exterior, mobile-first, de una vivienda moderna de dos plantas.

## Alcance actual

Incluido:

- pantalla blanca de entrada;
- CTA `CARGAR PROYECTO`;
- escena Three.js/R3F;
- plataforma exterior 16 × 16 m;
- blockout volumétrico provisional sincronizado con P1;
- órbita 360°;
- zoom táctil;
- pan desactivado;
- límites de cámara;
- iluminación de estudio provisional;
- loader de preparación/transferencias;
- recuperación visible ante error de escena o GLB;
- Cloudflare Static Assets desde `dist/`.

Fuera de alcance hasta aprobación posterior:

- interiores;
- selector día/noche;
- animación de construcción;
- selector de plantas;
- UI comercial;
- diagnóstico de hardware;
- HDRI final;
- materiales PBR definitivos;
- vegetación final;
- GLB definitivo.

## Geometría provisional vigente

La geometría actual sigue siendo un **blockout**, pero ya está alineada con la base P0/P1 aprobada de forma provisional en Drive.

Base de trabajo:

- plataforma: 16,00 × 16,00 × 0,20 m;
- huella máxima: 10,80 × 9,60 m;
- planta baja: 0,00 → +3,10 m;
- planta alta: +3,10 → +6,20 m;
- pretil/coronación: +6,20 → +6,90 m;
- volumen PB provisional: 10,80 × 8,60 m, desplazado 0,50 m hacia Sur;
- volumen PA provisional: 10,80 × 9,60 m, centrado;
- el vuelo Norte resultante de 1,00 m es una **DEDUCCIÓN DE TRABAJO**, no geometría contractual.

Las fachadas Norte y Oeste son las más observables en la referencia maestra. Sur y Este siguen siendo propuestas. Los huecos del blockout son provisionales hasta validar el modelo definitivo.

## Sistema de ejes

La documentación arquitectónica y Three.js no usan el mismo eje vertical, por lo que el contrato queda fijado expresamente.

### Arquitectura / Drive

- `X`: Oeste → Este
- `Y`: Sur → Norte
- `Z`: altura

### Three.js / GLB runtime

- `X`: Oeste → Este
- `Y`: altura
- `Z`: Sur → Norte

Todo GLB aprobado debe entrar ya en **Y-up**, con:

- `+X = Este`;
- `+Y = arriba`;
- `+Z = Norte`;
- `1 unidad = 1 metro`;
- origen horizontal en el centro de la huella;
- origen vertical en cota arquitectónica `0,00 m`.

No se corregirá un asset mal exportado mediante rotaciones o escalados arbitrarios en runtime. El contrato completo vive en `docs/GLB_CONTRACT.md`.

## Interacción

- 1 dedo / botón izquierdo: orbitar;
- 2 dedos: dolly/zoom;
- pan: desactivado;
- cámara limitada para evitar pasar bajo la plataforma;
- composición centrada sobre la vivienda.

## Ciclo de carga

1. El usuario pulsa `CARGAR PROYECTO`.
2. La escena se monta detrás de un overlay blanco.
3. Si hay assets en transferencia, `useProgress()` muestra progreso real.
4. El visor solo se revela cuando `Suspense` ha resuelto la escena y R3F ha emitido su primer frame.
5. Si la escena o el futuro GLB fallan, `ViewerErrorBoundary` sustituye el loader por un estado recuperable y permite volver a la entrada.

## Integración futura del GLB

- destino runtime: `static/models/exterior/house-exterior.glb`;
- URL de carga: `/models/exterior/house-exterior.glb`;
- el GLB permanece desactivado mediante `PROJECT.runtime.useApprovedExteriorModel` hasta aprobación expresa;
- `ExteriorModel.jsx` conmuta entre blockout y GLB sin rehacer el visor;
- `ExteriorGLB.jsx` valida bounds, altura y alineación de suelo antes de mostrar el asset como válido;
- un GLB fuera de contrato debe provocar un estado recuperable, no quedar visible con una simple advertencia;
- nunca activar un GLB no validado solo para eliminar el blockout.

## Estrategia de benchmark A/B

### Producto A — activo

- rama: `SOL`;
- stack: React + R3F + Three.js;
- función: implementación principal y referencia funcional.

### Producto B — planificado

El Producto B debe utilizar un motor/tecnología suficientemente independiente para que el benchmark sea significativo. El candidato preferente actual es **Babylon.js**, en una futura rama `SOL-BABYLON`.

B **no se inicia** hasta que A alcance el hito funcional mínimo: viewer móvil, contrato GLB, loader/error recovery, cámara/gestos, build validado y primera medición de rendimiento.

### Sandboxes existentes

- `SOL-WEBGPU`: rama existente, **PAUSADA**. Se conserva como sandbox para investigar Three.js `WebGPURenderer`; no cuenta como Producto B porque comparte el ecosistema Three.js con A.
- `SOL-PLAYCANVAS`: rama existente, **PAUSADA**. Se conserva como candidato experimental C opcional si una tercera comparación aporta valor.

El mismo GLB, dimensiones, cámara funcional equivalente y criterios de calidad deberán usarse en cualquier benchmark. `GEMINI_THINK_AUDITOR` actuará como auditor independiente; `ORCH_CHATGPT` decide la arquitectura final.

## Reglas de integración

1. Drive `DESWEB3D` es la fuente de verdad de producción.
2. `SOL` es la rama A de desarrollo principal.
3. `main` no se modifica desde esta fase.
4. Las ramas alternativas permanecen aisladas y no se desarrollan sin `ORDEN CHATGPT` expresa.
5. Assets experimentales no entran en runtime como si fueran aprobados.
6. Un GLB solo se integra después de revisión aprobada.
7. Las deducciones geométricas deben seguir marcadas como provisionales hasta que exista evidencia suficiente.
8. Gemini puede auditar, investigar y proponer patches dentro del rol asignado, pero `ORCH_CHATGPT` mantiene la aprobación e integración final.
9. Ninguna variante puede rebajar calidad o funcionalidad para favorecer artificialmente su benchmark.
