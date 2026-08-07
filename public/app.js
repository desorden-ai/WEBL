(() => {
  "use strict";

  const sceneData = [
    { id: "qnt", html: '<div class="logo-bold">Quantive<span style="color:#d32f2f">.</span></div>', x: -15, y: -15, z: -1000 },
    { id: "cpf", html: '<div class="logo-medium">CUPFFEE</div><div style="font-size:0.7em;color:#888">Furever</div>', x: 20, y: -5, z: -1600 },
    { id: "eko", html: '<div class="logo-bold" style="letter-spacing:5px">EKOHT</div>', x: -20, y: 10, z: -2200 },
    { id: "ctp", html: '<div class="logo-medium">CleverTap</div>', x: 25, y: 15, z: -2800 },
    { id: "cyr", html: '<div class="logo-light" style="font-family:serif;font-style:italic">Cyrc!</div>', x: -10, y: -5, z: -4000 },
    { id: "ama", html: '<div class="logo-bold" style="text-transform:lowercase">amadeus</div>', x: 5, y: 10, z: -4500 },
    { id: "wkb", html: '<div class="logo-medium">WorkBoard</div>', x: 15, y: -10, z: -5200 },
    { id: "orb", html: '<div class="logo-light">Orbit</div>', x: -5, y: 20, z: -5800 },
    { id: "mass", html: '<div class="logo-bold">mass[Finance]</div>', x: 20, y: -25, z: -6500 },
    {
      id: "circle",
      html: `
        <div class="circular-text">
          <svg viewBox="0 0 200 200" role="img" aria-label="Texto circular decorativo">
            <path id="curve" d="M 100,100 m -80,0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"></path>
            <text><textPath href="#curve" startOffset="0">DUNGA + DUNGA + DUNGA + DUNGA + </textPath></text>
          </svg>
        </div>`,
      x: 0,
      y: 0,
      z: -8500
    },
    { id: "exp", html: '<span class="subtitle">Experiencia</span>', x: 0, y: -15, z: -9500 },
    { id: "short", html: '<div class="title-huge">Seré breve</div>', x: 0, y: 0, z: -10500 },
    {
      id: "job1",
      html: '<div class="job-entry"><span class="job-title">Co-fundador, Jefe de Producto &amp; Diseño</span><span class="job-company">@ mass[Finance]</span></div>',
      x: 0,
      y: -10,
      z: -12000
    },
    {
      id: "job2",
      html: '<div class="job-entry"><span class="job-title">CleverTap — Sr. Manager, Diseño de Producto</span></div>',
      x: 0,
      y: 0,
      z: -13000
    },
    {
      id: "job3",
      html: '<div class="job-entry"><span class="job-title">Quantive — Lead de Sistema de Diseño</span></div>',
      x: 0,
      y: 10,
      z: -14000
    },
    {
      id: "job4",
      html: '<div class="job-entry"><span class="job-title">Freelance — Diseño Web, Branding</span></div>',
      x: 0,
      y: 20,
      z: -15000
    }
  ];

  const worldEl = document.getElementById("world");
  const canvas = document.getElementById("stars-canvas");
  const sectionNameEl = document.getElementById("hud-section-name");
  const scrollHintEl = document.querySelector(".scroll-hint");

  if (!worldEl || !canvas || !sectionNameEl) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const domElements = sceneData.map((item) => {
    const el = document.createElement("div");
    el.className = "hologram";
    el.dataset.id = item.id;
    el.innerHTML = item.html;
    worldEl.appendChild(el);
    return { element: el, data: item };
  });

  let currentScroll = window.scrollY;
  let targetScroll = window.scrollY;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let stars = [];
  let lastScrollForStars = currentScroll;
  let currentSection = "LA DÉCADA";

  const lerpFactor = 0.08;
  const scrollSpeedMultiplier = 2.5;
  const sectionChangeScrollPoint = 4000;
  const numStars = matchMedia("(max-width: 768px)").matches ? 380 : 600;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function createStar() {
    return {
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * 2000 + 1,
      radius: Math.random() * 1.5 + 0.1
    };
  }

  function initStars() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    stars = Array.from({ length: numStars }, createStar);
  }

  function updateScene() {
    currentScroll += (targetScroll - currentScroll) * (reducedMotion ? 0.2 : lerpFactor);

    const cameraZ = currentScroll * scrollSpeedMultiplier;
    const cx = window.innerWidth / 100;
    const cy = window.innerHeight / 100;

    domElements.forEach(({ element, data }) => {
      const absoluteZ = data.z + cameraZ;
      let opacity = 1;
      let blur = 0;

      if (absoluteZ > 300) {
        opacity = 0;
      } else if (absoluteZ > -200) {
        opacity = (300 - absoluteZ) / 500;
        blur = (absoluteZ + 200) / 50;
      } else if (absoluteZ < -4000) {
        opacity = Math.max(0, 1 - ((-4000 - absoluteZ) / 3000));
        blur = (-4000 - absoluteZ) / 500;
      }

      opacity = Math.max(0, Math.min(1, opacity));
      blur = Math.max(0, Math.min(15, blur));

      if (opacity > 0.01) {
        const pxX = data.x * cx;
        const pxY = data.y * cy;
        element.style.transform = `translate(-50%, -50%) translate3d(${pxX}px, ${pxY}px, ${absoluteZ}px)`;
        element.style.opacity = opacity.toFixed(3);
        element.style.filter = blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : "none";
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    });

    const nextSection = targetScroll > sectionChangeScrollPoint ? "HISTORIA CORTA" : "LA DÉCADA";
    if (nextSection !== currentSection) {
      currentSection = nextSection;
      sectionNameEl.textContent = currentSection;
    }

    if (scrollHintEl) {
      scrollHintEl.style.opacity = targetScroll > 180 ? "0" : "1";
    }

    requestAnimationFrame(updateScene);
  }

  function renderStars() {
    ctx.clearRect(0, 0, width, height);

    const scrollDelta = currentScroll - lastScrollForStars;
    lastScrollForStars = currentScroll;
    const speed = Math.max(-18, Math.min(24, 0.45 + scrollDelta * 0.5));
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = "#ffffff";

    for (const star of stars) {
      star.z -= speed;

      if (star.z <= 1) {
        Object.assign(star, createStar(), { z: 2000 });
      } else if (star.z > 2000) {
        star.z = 1;
      }

      const projection = 400 / star.z;
      const px = star.x * projection + centerX;
      const py = star.y * projection + centerY;
      const size = Math.max(0.1, star.radius * projection * 0.5);
      const opacity = Math.min(1, Math.max(0, (2000 - star.z) / 1500));

      if (px < 0 || px > width || py < 0 || py > height) continue;

      ctx.globalAlpha = opacity;
      ctx.shadowBlur = size > 1.5 ? 5 : 0;
      ctx.shadowColor = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    requestAnimationFrame(renderStars);
  }

  function handleScroll() {
    targetScroll = window.scrollY;
  }

  let resizeFrame = 0;
  function handleResize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(initStars);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleResize, { passive: true });

  initStars();
  renderStars();
  updateScene();
})();
