# DESWEB3D

Visor web 3D mobile-first para modelos inmobiliarios.

## Funciones

- React, Vite, Three.js, React Three Fiber y Drei.
- Entrada manual para evitar cargar WebGL antes de la interacción del usuario.
- Órbita 360° con ratón o un dedo.
- Zoom con rueda o gesto de pinza.
- Loader de recursos y recuperación ante errores.
- Blockout integrado para que el visor funcione sin un modelo externo.
- Carga opcional de un GLB validado por dimensiones, orientación y cota de suelo.
- Build estático preparado para Cloudflare Workers.

## Uso local

```bash
npm ci
npm run dev
```

## Validación

```bash
npm run check
```

## Modelo GLB

Colocar el modelo aprobado en:

```text
static/models/exterior/house-exterior.glb
```

Después, cambiar `useApprovedExteriorModel` a `true` en `src/config/project.js`.

Contrato requerido:

- glTF 2.0 / GLB;
- `1 unidad = 1 metro`;
- eje vertical `+Y`;
- norte `+Z` y este `+X`;
- origen en el centro de la huella y a cota de suelo;
- dimensiones dentro de las tolerancias definidas en `src/config/project.js`.

## Publicación

```bash
npm run deploy
```
