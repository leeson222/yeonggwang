function updateBannerHeightVar() {
  const banner = document.querySelector('.top-banner-wrap');
  if (!banner) return;
  document.documentElement.style.setProperty('--banner-h', `${banner.offsetHeight}px`);
}

window.addEventListener('load', updateBannerHeightVar);
window.addEventListener('resize', updateBannerHeightVar);