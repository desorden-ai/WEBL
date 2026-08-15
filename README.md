# 🏔️ Mansión Refugio 3D — Experiencia Arquitectónica Interactiva

Visualizador arquitectónico 3D de alta fidelidad para una mansión refugio de montaña contemporánea. Desarrollado con **React 19**, **Three.js**, **Vite** y **Tailwind CSS**, optimizado para despliegue directo en **GitHub** y **Cloudflare Pages**.

---

## 🌟 Características Principales

- **🎮 Motor 3D en Tiempo Real**: Renderizado procedural con Three.js, sombras suaves, texturas arquitectónicas y materiales físicamente realistas (PBR).
- **🎥 Transiciones Cinematográficas de Cámara**: Curvas Bézier 3D suaves con aceleración cúbica (`easeInOutCubic`) sin destellos ni saltos de ángulo.
- **🛋️ Múltiples Escenas Arquitectónicas**:
  - *Vista General / Fachada Exterior*
  - *Interior / Salón & Fogar*
  - *Frontal Salón (Cocina)* — Encuadre despejado y panorámico desde la barra de cocina
  - *Perspectiva Lateral & Terraza*
  - *Plano Contrapicado / Cubierta Volada*
- **🔄 Modo 360° / Look-Around Interactivo**: Exploración libre con ratón, controles táctiles y sensor giroscópico/acelerómetro en dispositivos móviles.
- **☀️ Simulación Solar y Lumínica**: Modos Día, Atardecer (Hora Dorada) y Noche con iluminación ambiental dinámica, fogata encendida y luces arquitectónicas cálidas.
- **🎨 Filtros Visuales**: Colorimetría arquitectónica (Natural, Blanco y Negro Cinematográfico, Sepia Editorial, Vívido).
- **📱 100% Responsivo y Táctil**: Soporte gestual optimizado para smartphones, tablets y pantallas de ultra-alta resolución.
- **⚡ Ultrarrápido y sin backend pesado**: SPA estática compilada con Vite lista para CDN global en el *Edge* de Cloudflare.

---

## 🛠️ Tecnologías

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Renderizado 3D**: [Three.js](https://threejs.org/) (`@types/three`)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconos & Animaciones**: [Lucide React](https://lucide.dev/) + [Motion](https://motion.dev/)
- **Empaquetador**: [Vite](https://vitejs.dev/)
- **Alojamiento & Edge**: [Cloudflare Pages](https://pages.cloudflare.com/)

---

## 🚀 Instalación y Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/mansion-refugio-3d.git
cd mansion-refugio-3d
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador `http://localhost:3000` (o el puerto indicado por Vite).

### 4. Compilar para producción
```bash
npm run build
```
Generará los archivos optimizados en la carpeta `dist/`.

---

## ☁️ Despliegue en Cloudflare Pages

### Opción A: Conexión Automática con Repositorio GitHub (Recomendado)

1. Sube tu proyecto a un repositorio en **GitHub**.
2. Entra en el panel de [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Compute (Workers & Pages)** > **Create** > **Pages** > **Connect to Git**.
3. Selecciona tu repositorio `mansion-refugio-3d`.
4. En los ajustes de compilación (**Build settings**):
   - **Framework preset**: `Vite` (o `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js Version** (Opcional en Variables de Entorno): `NODE_VERSION = 20`
5. Haz clic en **Save and Deploy**. ¡Tu aplicación estará publicada mundialmente en segundos con HTTPS automático y CDN global!

---

### Opción B: Despliegue mediante Wrangler CLI

1. Instala e inicia sesión en Wrangler:
```bash
npx wrangler login
```

2. Compila el proyecto:
```bash
npm run build
```

3. Despliega en Cloudflare Pages:
```bash
npx wrangler pages deploy dist --project-name=mansion-refugio-3d
```

---

### Opción C: Integración Continua con GitHub Actions

El repositorio incluye un flujo de trabajo preconfigurado en `.github/workflows/deploy-cloudflare.yml`. Para activarlo:
1. En tu repositorio GitHub, ve a **Settings** > **Secrets and variables** > **Actions**.
2. Añade:
   - `CLOUDFLARE_API_TOKEN`: Token de API con permisos para Cloudflare Pages.
   - `CLOUDFLARE_ACCOUNT_ID`: ID de tu cuenta de Cloudflare.
3. Cada `push` a la rama `main` compilará y desplegará automáticamente.

---

## 📁 Estructura del Proyecto

```text
├── .github/
│   └── workflows/
│       └── deploy-cloudflare.yml   # Workflow de CI/CD para Cloudflare
├── public/
│   ├── _headers                    # Cabeceras de caché y seguridad Cloudflare
│   ├── _redirects                  # Reglas de enrutamiento SPA
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Viewport3D.tsx          # Escenario 3D interactivo Three.js
│   │   └── ControlsOverlay.tsx     # Interfaz minimalista de control
│   ├── data/
│   │   ├── config.ts               # Coordenadas de cámaras y presets
│   │   └── cinematicPOIs.ts        # Puntos de interés y metadatos
│   ├── utils/
│   │   └── cameraTransition.ts     # Trayectorias curvas Bézier 3D
│   ├── types.ts                    # Definiciones TypeScript
│   ├── App.tsx                     # Componente principal
│   └── main.tsx                    # Punto de entrada
├── wrangler.jsonc                  # Configuración Cloudflare Wrangler
├── wrangler.toml                   # Configuración alternativa Wrangler
├── vite.config.ts                  # Configuración de Vite
├── package.json
└── tsconfig.json
```

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más detalles.
