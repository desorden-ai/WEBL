# WEBL — Experiencia de Scroll 3D

Experiencia web estática con recorrido tipográfico tridimensional, campo de estrellas Canvas y movimiento controlado por scroll.

## Estructura

- `public/index.html`: estructura principal y HUD.
- `public/styles.css`: diseño, profundidad CSS, responsive y accesibilidad.
- `public/app.js`: escena 3D, suavizado de scroll y animación Canvas.
- `public/_headers`: cabeceras de seguridad y caché para Cloudflare.
- `wrangler.jsonc`: configuración de Cloudflare Workers Static Assets.

## Vista previa local

```bash
python3 -m http.server 8080 --directory public
```

Abrir `http://localhost:8080`.

## Validación rápida

```bash
node --check public/app.js
```

## Cloudflare Workers

El repositorio conserva la configuración existente de despliegue mediante Static Assets.

```bash
npm install
npm run dev
npm run deploy
```

No requiere proceso de compilación para generar los archivos públicos.
