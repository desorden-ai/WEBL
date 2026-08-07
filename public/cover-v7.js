StardustImage.prototype.processImage = function processImageExpanded(img) {
  try {
    const cols = 75;
    const aspect = img.height / img.width;
    const rows = Math.floor(cols * aspect);
    const pixelSize = 4;
    const imgDrawWidth = cols * pixelSize;
    const imgDrawHeight = rows * pixelSize;

    this.particles.length = 0;
    this.canvas.width = imgDrawWidth * 3;
    this.canvas.height = imgDrawHeight * 3;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cols;
    tempCanvas.height = rows;
    const tempContext = tempCanvas.getContext('2d');
    tempContext.drawImage(img, 0, 0, cols, rows);

    const imageData = tempContext.getImageData(0, 0, cols, rows).data;
    const offsetX = imgDrawWidth;
    const offsetY = imgDrawHeight;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const red = imageData[index];
        const green = imageData[index + 1];
        const blue = imageData[index + 2];
        const alpha = imageData[index + 3];
        const brightness = (red + green + blue) / 3;

        if (alpha > 50 && brightness > 15) {
          this.particles.push({
            baseX: (x * pixelSize) + offsetX,
            baseY: (y * pixelSize) + offsetY,
            color: `rgba(${red},${green},${blue},1)`,
            randX: (Math.random() - 0.5) * window.innerWidth * 3,
            randY: (Math.random() - 0.5) * window.innerHeight * 3
          });
        }
      }
    }

    this.loaded = true;
    checkLoadingState();
  } catch (error) {
    this.fallbackMode = true;
    this.loaded = true;
    checkLoadingState();
  }
};

StardustImage.prototype.update = function updateExpanded(trueZ) {
  if (!this.loaded) return;

  let dispersion = 0;
  if (trueZ > -400) {
    dispersion = (trueZ + 400) / 1300;
  }

  dispersion = Math.max(0, Math.min(1, dispersion));
  const easedDispersion = Math.pow(dispersion, 1.2);

  if (this.fallbackMode) {
    this.realImg.style.opacity = 1 - easedDispersion;
    return;
  }

  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  if (easedDispersion === 0) {
    this.realImg.style.opacity = 1;
    this.canvas.style.opacity = 0;
  } else if (easedDispersion < 0.1) {
    const fade = easedDispersion / 0.1;
    this.realImg.style.opacity = 1 - fade;
    this.canvas.style.opacity = fade;
  } else {
    this.realImg.style.opacity = 0;
    this.canvas.style.opacity = 1 - (easedDispersion * 0.8);
  }

  if (easedDispersion >= 0.99) return;

  for (const particle of this.particles) {
    const x = particle.baseX + (particle.randX * easedDispersion);
    const y = particle.baseY + (particle.randY * easedDispersion);
    this.ctx.fillStyle = particle.color;
    this.ctx.fillRect(x, y, 3, 3);
  }
};

updateScene = function updateSceneThroughCamera() {
  currentScroll += (targetScroll - currentScroll) * lerpFactor;

  const scrollProgress = currentScroll / maxVirtualScroll;
  const cameraZ = scrollProgress * requiredCameraTravel;
  const t = Math.min(1, Math.max(0, cameraZ / requiredCameraTravel));
  const adjustedT = Math.pow(t, 1.2);

  globalPanX = Math.sin(adjustedT * Math.PI * 1.5) * 12;
  globalPanY = Math.sin(t * Math.PI * 2.5) * 4;

  sceneEl.style.perspectiveOrigin = `${50 + globalPanX}% ${50 + globalPanY}%`;
  worldEl.style.transform = `rotateX(${Math.sin(t * Math.PI * 2.5) * 1.5}deg) rotateY(${-Math.cos(adjustedT * Math.PI * 1.5) * 2}deg)`;
  navThumb.style.top = `${scrollProgress * 80}%`;

  let activePage = 1;
  if (scrollProgress < 0.05) activePage = 1;
  else if (scrollProgress < 0.18) activePage = 2;
  else if (scrollProgress < 0.35) activePage = 3;
  else if (scrollProgress < 0.5) activePage = 4;
  else if (scrollProgress < 0.65) activePage = 5;
  else if (scrollProgress < 0.82) activePage = 6;
  else activePage = 7;

  const formattedPage = String(activePage).padStart(2, '0');
  if (currentPageEl.innerText !== formattedPage) {
    currentPageEl.innerText = formattedPage;
    sectionNameEl.style.opacity = 0;
    setTimeout(() => {
      sectionNameEl.innerText = sectionNames[activePage - 1];
      sectionNameEl.style.opacity = 1;
    }, 150);
  }

  domElements.forEach((item) => {
    const trueZ = item.data.z + cameraZ;
    const zAbsoluta = trueZ;
    const renderX = item.data.x;

    if (item.data.type === 'stardust') {
      item.element.style.display = 'inline-block';
      item.stardust.update(trueZ);
      item.element.style.transform = `translate(-50%,-50%) translate3d(${renderX * cx}px,${item.data.y * cy}px,${zAbsoluta}px)`;
      item.element.style.opacity = 1;
      item.element.style.filter = 'none';
      return;
    }

    const distance = Math.abs(trueZ + 600);
    const coreVisibleRange = 1200;
    const fadeTransition = 3500;
    let opacity = distance > coreVisibleRange
      ? 1 - ((distance - coreVisibleRange) / fadeTransition)
      : 1;

    opacity = Math.max(0, Math.min(1, opacity));
    const blurAmount = (1 - opacity) * 10;

    if (opacity > 0.01) {
      item.element.style.transform = `translate(-50%,-50%) translate3d(${renderX * cx}px,${item.data.y * cy}px,${zAbsoluta}px)`;
      item.element.style.opacity = opacity;
      item.element.style.filter = blurAmount > 0.01 ? `blur(${blurAmount}px)` : 'none';
      item.element.style.display = 'block';
    } else {
      item.element.style.display = 'none';
    }
  });

  requestAnimationFrame(updateScene);
};
