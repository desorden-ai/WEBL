# WEBL — Scroll 3D Adaptatiu

Repositori centrat exclusivament en reproduir la web de scroll 3D definida en aquest projecte.

## Estructura activa

- `public/index.html`: web completa amb HTML, CSS i JavaScript integrats.
- `public/_headers`: capçaleres HTTP per a Cloudflare.
- `wrangler.jsonc`: desplegament de `public/` com a Static Assets.
- `package.json`: scripts de Wrangler.

No hi ha cap sistema de compilació ni dependències de frontend.

## Vista prèvia local

```bash
python3 -m http.server 8080 --directory public
```

Obrir `http://localhost:8080`.

## Desplegament

```bash
npm install
npm run deploy
```

El Worker configurat és `webl`.
