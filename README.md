# DESWEB3D — WEBL / SOL

Rama de desarrollo del visor inmobiliario 3D exterior de DESWEB3D.

## Estado actual

V0.1 de infraestructura web:

- React + Vite.
- Three.js + React Three Fiber + Drei.
- Fondo blanco.
- Entrada mínima con `CARGAR PROYECTO`.
- Escena exterior 3D navegable.
- Órbita 360° con un dedo / ratón.
- Pinza para zoom.
- Pan desactivado.
- Límites verticales y de distancia de cámara.
- Blockout dimensional temporal de vivienda y plataforma.

El blockout **no es geometría arquitectónica aprobada**. Será sustituido por el GLB definitivo cuando la preproducción geométrica en Drive pase revisión.

## Fuente de verdad

- Documentación y entregables de producción: Google Drive → `DESWEB3D`.
- Código de desarrollo: `desorden-ai/WEBL`, rama `SOL`.
- `main` no se modifica desde este flujo.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Cloudflare

Wrangler sirve `dist/` como Static Assets.

```bash
npm run deploy
```

## Assets web aprobados

Vite usa `static/` como directorio público limpio. El antiguo `public/` queda fuera del build y se considera legacy.

- `static/models/`
- `static/textures/`
- `static/environment/`

No integrar borradores de Gemini o assets no aprobados directamente en la web.
