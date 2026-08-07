'use strict';

(function optimizeInitialExperience() {
  const staticContainer = document.getElementById('lcp-stardust');
  const staticImage = document.getElementById('lcp-portrait');
  const staticCanvas = document.getElementById('lcp-stardust-canvas');

  if (!staticContainer || !staticImage || !staticCanvas) return;
  if (typeof domElements === 'undefined') return;

  const record = domElements.find((item) => item.data?.id === 's0_img');
  const stardust = record?.stardust;

  const markImageReady = () => {
    staticImage.style.visibility = 'visible';
    staticContainer.style.opacity = '1';
    staticContainer.style.display = 'inline-block';
    checkLoadingState();
    if (sceneStarted) wakeUpLoop(true);
  };

  staticImage.addEventListener('load', markImageReady, { once: true });
  staticImage.addEventListener('error', () => {
    staticImage.style.visibility = 'hidden';
    staticContainer.style.opacity = '1';
    staticContainer.style.display = 'inline-block';
    checkLoadingState();
    if (sceneStarted) wakeUpLoop(true);
  }, { once: true });

  if (staticImage.complete && staticImage.naturalWidth > 0) {
    markImageReady();
  }

  if (record && stardust) {
    const dynamicContainer = record.element;
    const portraitSource = staticImage.currentSrc || staticImage.src;

    record.element = staticContainer;
    stardust.container = staticContainer;
    stardust.realImg = staticImage;
    stardust.canvas = staticCanvas;
    stardust.ctx = staticCanvas.getContext('2d', { alpha: true });
    stardust.loaded = false;
    stardust.fallbackMode = false;
    stardust.readyToProcess = false;
    stardust.processingRequested = false;
    stardust.processing = false;
    stardust.particles.length = 0;

    stardust.pixelImg.crossOrigin = 'anonymous';
    stardust.pixelImg.onload = () => {
      stardust.readyToProcess = true;
      if (stardust.processingRequested) stardust.scheduleProcessing();
    };
    stardust.pixelImg.onerror = () => {
      stardust.fallbackMode = true;
      stardust.loaded = true;
      if (sceneStarted) wakeUpLoop(true);
    };
    stardust.pixelImg.src = portraitSource;

    if (dynamicContainer && dynamicContainer !== staticContainer) {
      dynamicContainer.remove();
    }
  }

  launchExperience = function launchExperienceWithoutConsentBlock() {
    if (launchStarted) return;
    launchStarted = true;

    window.setTimeout(() => {
      loaderContainer.style.opacity = '0';
      window.setTimeout(() => {
        loaderContainer.style.display = 'none';
        sceneStarted = true;
        wakeUpLoop(true);
      }, 300);
    }, 100);
  };

  checkFinalLaunch = function checkFinalLaunchWithoutConsentBlock() {
    if (!animFinished) return;

    if (cookiesAccepted) cookieWrapper.classList.remove('visible');
    else cookieWrapper.classList.add('visible');

    launchExperience();
  };

  btnAccept.addEventListener('click', () => {
    cookieWrapper.classList.remove('visible');
  });

  if (animFinished) checkFinalLaunch();
})();