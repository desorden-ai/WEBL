# 🏔️ Mansión Refugio 3D — Experiencia Arquitectónica Interactiva

Visualizador arquitectónico 3D de alta fidelidad para una mansión refugio de montaña contemporánea. Desarrollado con **React 19**, **Three.js**, **Vite** y **Tailwind CSS**, optimizado para despliegue directo en **GitHub** y **Cloudflare Pages**.

---

## 🌟 Características Principales

- **🎮 Motor 3D en Tiempo Real**: Renderizado procedural con Three.js, sombras suaves, texturas arquitectónicas y materiales físicamente realistas (PBR).
- **🌲 Bosque 3D instanciado**: coníferas volumétricas con troncos texturizados, coronas 3D por niveles, seis perfiles morfológicos y distribución determinista; no utiliza billboards para el bosque cercano, medio o lejano.
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

## 🌲 Renderizado forestal 3D ligero

El bosque exterior combina volumen real y coste de GPU controlado:

- la distribución se reconstruye siempre desde una **seed determinista**;
- los árboles de primer plano usan **troncos 3D y coronas volumétricas por niveles**, con sombras donde aportan profundidad;
- el bosque medio y lejano mantiene geometría **3D instanciada**, reduciendo segmentos y sombras en lugar de sustituir árboles por planos;
- se utilizan **seis perfiles de conífera** derivados de las referencias visuales para variar altura de copa, apertura, taper y densidad;
- la corteza reutiliza la textura procedural existente y el follaje usa una microtextura de agujas generada en runtime;
- existen zonas de seguridad alrededor de las cámaras exteriores para impedir que un árbol atraviese o tape la cámara;
- la arquitectura de la mansión, interiores, interacción y sistema atmosférico permanecen independientes de esta optimización.

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
git clone https://github.com/desorden-ai/WEBL.git
cd WEBL
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
3. Selecciona tu repositorio `WEBL`.
4. En los ajustes de compilación (**Build settings**):
   - **Framework preset**: `Vite` (o `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Haz clic en **Save and Deploy**.

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

El repositorio incluye un flujo de trabajo preconfigurado en `.github/workflows/deploy-cloudflare.yml`. Cada `push` a `main` ejecuta TypeScript, build, publicación de preview estática y despliegue de Cloudflare Pages cuando están configurados los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.

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
├── vite.config.ts                  # Configuración de Vite
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más detalles.
