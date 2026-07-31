export const scenesConfig = [
  // --- SECCIÓN 1: INTRO ---
  {
    id: "intro",
    sectionLabel: "INICIO",
    position: { x: 0, y: 0, z: 0 },
    html: `
      <div class="subtitle">( AUDITORÍA TÉCNICA )</div>
      <div class="title-main">DAVID<br>MILLA</div>
      <div class="line-divider"></div>
      <div class="list-item list-item--center">HVAC Systems</div>
      <div class="list-item list-item--center">UAV Drones</div>
    `
  },
  {
    id: "pitch",
    sectionLabel: "ELEVATOR PITCH",
    position: { x: 0, y: 0, z: -100 },
    html: `
      <div class="description description--center">
        Optimización de rendimiento e instalaciones termodinámicas.<br>
        A través del análisis, diagnóstico preventivo, tecnología aérea y sentido común.
      </div>
    `
  },

  // --- SECCIÓN 2: NUBE DE TECNOLOGÍAS ---
  {
    id: "bg-hvac",
    sectionLabel: "STACK TÉCNICO",
    position: { x: 0, y: 0, z: -250 },
    html: `<div class="title-outline-huge">CLIMA</div>`
  },
  { id: "t1", sectionLabel: "STACK TÉCNICO", position: { x: -3, y: 2, z: -200 }, html: `<div class="tech-brand">DAIKIN</div>` },
  { id: "t2", sectionLabel: "STACK TÉCNICO", position: { x: 4, y: -1, z: -220 }, html: `<div class="tech-brand tech-brand--white">MITSUBISHI</div>` },
  { id: "t3", sectionLabel: "STACK TÉCNICO", position: { x: -4, y: -2, z: -240 }, html: `<div class="tech-brand">PANASONIC</div>` },
  { id: "t4", sectionLabel: "STACK TÉCNICO", position: { x: 2, y: 3, z: -260 }, html: `<div class="tech-brand">AIRZONE</div>` },
  { id: "t5", sectionLabel: "STACK TÉCNICO", position: { x: -1, y: -4, z: -280 }, html: `<div class="tech-brand tech-brand--white">DJI ENTERPRISE</div>` },
  { id: "t6", sectionLabel: "STACK TÉCNICO", position: { x: 5, y: 2, z: -300 }, html: `<div class="tech-brand">AUTOCAD</div>` },

  // --- SECCIÓN 3: EXPERIENCIA ---
  {
    id: "experience",
    sectionLabel: "TRAYECTORIA",
    position: { x: 0, y: 0, z: -450 },
    html: `
      <div class="experience-card">
        <h3>Experience .</h3>
        <div class="list-item experience-item">
          <strong>Servicio Técnico Oficial</strong><br>
          <span>2015 — Presente</span>
        </div>
        <div class="list-item experience-item">
          <strong>Operador de Vuelo AESA</strong><br>
          <span>2019 — Presente</span>
        </div>
        <div class="list-item experience-item">
          <strong>Auditoría Energética</strong><br>
          <span>2021 — 2024</span>
        </div>
      </div>
    `
  },

  // --- SECCIÓN 4: MÉTRICAS ---
  {
    id: "num1",
    sectionLabel: "MÉTRICAS",
    position: { x: -3, y: 1, z: -600 },
    html: `<div class="number-huge">+10<br><span>AÑOS EXPERIENCIA</span></div>`
  },
  {
    id: "num2",
    sectionLabel: "MÉTRICAS",
    position: { x: 3, y: -2, z: -650 },
    html: `<div class="number-huge">500<br><span class="muted">EQUIPOS AUDITADOS</span></div>`
  },
  {
    id: "num3",
    sectionLabel: "MÉTRICAS",
    position: { x: -1, y: 3, z: -700 },
    html: `<div class="number-huge">3<br><span class="muted">NORMATIVAS VIGENTES</span></div>`
  },

  // --- SECCIÓN 5: FINAL ---
  {
    id: "cases",
    sectionLabel: "CASOS DE ESTUDIO",
    position: { x: 0, y: 0, z: -850 },
    html: `
      <div class="cases-card">
        <div class="subtitle subtitle--center">CLICK TO EXPAND</div>
        <h2>Casos de Estudio</h2>
        <div class="cases-list">
          <div class="list-item">1. Diagnóstico de placas (CC)</div>
          <div class="list-item">2. Topografía perimetral UAV</div>
          <div class="list-item">3. Integración domótica HVAC</div>
        </div>
      </div>
    `
  }
];
