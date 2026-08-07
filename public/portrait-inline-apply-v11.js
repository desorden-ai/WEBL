'use strict';

(function bindEmbeddedPortrait() {
  if (!window.DESORDEN_PORTRAIT_SRC) return;
  if (typeof domElements === 'undefined') return;

  const record = domElements.find((item) => item.data?.id === 's0_img');
  const stardust = record?.stardust;
  if (!stardust) return;

  const markReady = () => {
    document.body.classList.add('portrait-ready');
    try { checkLoadingState(); } catch {}
    try { wakeUpLoop(true); } catch {}
  };

  stardust.realImg.alt = '';
  stardust.realImg.setAttribute('aria-hidden', 'true');
  stardust.realImg.onload = markReady;
  stardust.realImg.onerror = markReady;
  stardust.realImg.src = window.DESORDEN_PORTRAIT_SRC;

  stardust.loaded = false;
  stardust.fallbackMode = false;
  stardust.readyToProcess = false;
  stardust.processingRequested = false;
  stardust.processing = false;
  stardust.particles.length = 0;

  stardust.pixelImg.onload = () => {
    stardust.readyToProcess = true;
    window.setTimeout(() => {
      try { stardust.requestProcessing(); } catch {}
    }, 400);
  };
  stardust.pixelImg.onerror = () => {
    stardust.fallbackMode = true;
    stardust.loaded = true;
    markReady();
  };
  stardust.pixelImg.src = window.DESORDEN_PORTRAIT_SRC;

  if (stardust.realImg.complete && stardust.realImg.naturalWidth > 0) {
    markReady();
  }
})();
