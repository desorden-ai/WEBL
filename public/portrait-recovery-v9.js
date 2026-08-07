'use strict';

const PORTRAIT_URL = '/1000091876.jpg?v=20260807-portrait-v9';
const FALLBACK_PARTS = [0, 1, 2, 3, 4];
let fallbackLoading = false;
let fallbackApplied = false;

function getStardustRecord() {
  try {
    return domElements.find((item) => item.data?.id === 's0_img')?.stardust || null;
  } catch {
    return null;
  }
}

function markPortraitReady() {
  document.body.classList.add('portrait-ready');
  try { checkLoadingState(); } catch {}
  try { wakeUpLoop(true); } catch {}
}

async function loadBase64Fallback() {
  if (fallbackLoading || fallbackApplied) return;
  fallbackLoading = true;

  try {
    const parts = await Promise.all(
      FALLBACK_PARTS.map(async (index) => {
        const response = await fetch(`/portrait-${index}.b64?v=20260807-portrait-v9`, {
          cache: 'reload'
        });
        if (!response.ok) throw new Error(`Fallback ${index} unavailable`);
        return response.text();
      })
    );

    fallbackApplied = true;
    applyPortraitSource(`data:image/jpeg;base64,${parts.join('')}`, true);
  } catch {
    document.body.classList.add('portrait-failed');
  } finally {
    fallbackLoading = false;
  }
}

function applyPortraitSource(source, isFallback = false) {
  const stardust = getStardustRecord();
  const realImage = stardust?.realImg || document.querySelector('.stardust-real-img');
  const container = realImage?.closest('.stardust-container');

  if (!realImage) return;

  realImage.alt = '';
  realImage.setAttribute('aria-hidden', 'true');
  if (container) {
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', 'David Milla, creativo y director de DESORDEN');
  }

  realImage.onload = markPortraitReady;
  realImage.onerror = isFallback ? () => {
    document.body.classList.add('portrait-failed');
  } : loadBase64Fallback;
  realImage.src = source;

  if (!stardust?.pixelImg) return;

  stardust.loaded = false;
  stardust.fallbackMode = false;
  stardust.readyToProcess = false;
  stardust.processing = false;
  stardust.particles.length = 0;

  stardust.pixelImg.onload = () => {
    stardust.readyToProcess = true;
    if (stardust.processingRequested) stardust.scheduleProcessing();
  };
  stardust.pixelImg.onerror = isFallback ? () => {
    stardust.fallbackMode = true;
    stardust.loaded = true;
    markPortraitReady();
  } : loadBase64Fallback;
  stardust.pixelImg.src = source;
}

async function clearLegacyAssetCaches() {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('webl-3d-'))
          .map((name) => caches.delete(name))
      );
    }
  } catch {}

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {}
}

clearLegacyAssetCaches();
applyPortraitSource(PORTRAIT_URL);
