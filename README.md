# DESORDEN — Scroll Flight Site

Experiencia web 3D móvil basada en WebGL nativo y contenido HTML proyectado. No utiliza Three.js, Lenis, GSAP ni un proceso de compilación: los archivos dentro de `public/` se sirven directamente.

## Estructura

- `public/index.html`: contenido semántico y escenas.
- `public/styles.css`: identidad, maquetación y responsive.
- `public/app.js`: WebGL, proyección DOM, scroll suavizado y loader seguro.
- `wrangler.jsonc`: despliegue mediante Cloudflare Workers Static Assets.

## Vista previa sencilla

Abre una terminal en la raíz y ejecuta:

```bash
python -m http.server 8080 --directory public
```

Después abre `http://localhost:8080`.

## Cloudflare Workers

```bash
npm install
npm run dev
npm run deploy
```

También puedes subir el repositorio a GitHub y conectarlo desde **Cloudflare > Workers & Pages > Create > Import a repository**. El proyecto ya incluye `wrangler.jsonc`, por lo que no necesita comando de build ni directorio de salida.

## Edición rápida

Modifica los textos de cada `<section data-scene>` en `public/index.html`. Las posiciones tridimensionales se controlan con:

- `data-z`: profundidad y orden del recorrido.
- `data-x`: desplazamiento horizontal.
- `data-y`: desplazamiento vertical.

No sitúes dos escenas con menos de 40 unidades de separación en `data-z`.
