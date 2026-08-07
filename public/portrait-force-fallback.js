(() => {
  try {
    const portrait = domElements.find(item => item.data && item.data.id === 's0_img');
    if (!portrait || !portrait.stardust) return;
    portrait.stardust.loadFallback();
  } catch (error) {
    console.error('Portrait fallback bootstrap failed', error);
  }
})();
