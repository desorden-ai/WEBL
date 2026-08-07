'use strict';

(function applyRaceConditionFix() {
  const portraitRecord = typeof domElements !== 'undefined'
    ? domElements.find((item) => item.data?.id === 's0_img')
    : null;

  const stardust = portraitRecord?.stardust;
  if (!stardust) return;

  const unlockLoaderFromVisualImage = () => {
    try { checkLoadingState(); } catch {}
    document.body.classList.add('portrait-ready');
    try { wakeUpLoop(true); } catch {}
  };

  // La imagen visual desbloquea el loader. El procesamiento de partículas no participa en esa barrera.
  if (stardust.realImg.complete && stardust.realImg.naturalWidth > 0) {
    unlockLoaderFromVisualImage();
  } else {
    stardust.realImg.addEventListener('load', unlockLoaderFromVisualImage, { once: true });
    stardust.realImg.addEventListener('error', () => {
      try { checkLoadingState(); } catch {}
    }, { once: true });
  }

  let particlesScheduled = false;
  const scheduleParticles = () => {
    if (particlesScheduled || stardust.loaded || stardust.fallbackMode) return;
    particlesScheduled = true;

    window.setTimeout(() => {
      // Conservamos el procesado fragmentado/idle del motor para no volver a crear TBT.
      if (typeof stardust.requestProcessing === 'function') {
        stardust.requestProcessing();
      } else if (typeof stardust.prepareParticles === 'function') {
        stardust.prepareParticles();
      }
    }, 400);
  };

  if (stardust.pixelImg.complete && stardust.pixelImg.naturalWidth > 0) {
    stardust.readyToProcess = true;
    scheduleParticles();
  } else {
    stardust.pixelImg.addEventListener('load', () => {
      stardust.readyToProcess = true;
      scheduleParticles();
    }, { once: true });
  }

  // Mientras las partículas aún no están preparadas, la imagen sigue funcionando con un fade normal.
  const originalUpdate = stardust.update.bind(stardust);
  stardust.update = function updateWithGracefulFallback(trueZ) {
    let dispersion = trueZ > -400 ? (trueZ + 400) / 2800 : 0;
    dispersion = Math.max(0, Math.min(1, dispersion));
    const eased = Math.pow(dispersion, 1.2);

    if (!this.loaded || this.fallbackMode) {
      this.realImg.style.opacity = String(1 - eased);
      this.canvas.style.opacity = '0';
      return;
    }

    originalUpdate(trueZ);
  };
})();
