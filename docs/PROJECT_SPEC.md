# DESWEB3D — PROJECT SPEC

## Objetivo V0.1

Construir un visor inmobiliario 3D exterior, mobile-first, de una vivienda moderna de dos plantas.

## Alcance actual

Incluido:

- pantalla blanca de entrada;
- CTA `CARGAR PROYECTO`;
- escena Three.js/R3F;
- plataforma exterior provisional 16 × 16 m;
- blockout provisional de vivienda;
- órbita 360°;
- zoom táctil;
- pan desactivado;
- límites de cámara;
- iluminación de estudio provisional;
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

## Geometría provisional

La geometría actual es únicamente un blockout para validar interacción y encuadre.

Base de trabajo:

- plataforma: 16,00 × 16,00 m;
- huella máxima: 10,80 × 9,60 m;
- 2 plantas;
- nivel superior de referencia: +3,10 m;
- altura total objetivo: ≈ 6,90 m.

Las posiciones de huecos del blockout no son contractuales. La geometría definitiva se integra únicamente después de aprobación de la preproducción de Drive.

## Interacción

- 1 dedo / botón izquierdo: orbitar;
- 2 dedos: zoom;
- pan: desactivado;
- cámara limitada para evitar pasar bajo la plataforma;
- composición centrada sobre la vivienda.

## Reglas de integración

1. Drive `DESWEB3D` es la fuente de verdad de producción.
2. Los assets de prueba no entran en `static/`.
3. Un GLB solo se integra después de revisión aprobada.
4. `main` no se modifica desde esta fase.
5. Todo el desarrollo se realiza en `SOL`.
