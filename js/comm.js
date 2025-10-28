function updateBannerHeightVar() {
  const banner = document.querySelector('.top-banner-wrap');
  if (!banner) return;
  document.documentElement.style.setProperty('--banner-h', `${banner.offsetHeight}px`);
}

function updateFooterHeightVar() {
  const footer = document.querySelector('#footer');
  if (!footer) return;
  document.documentElement.style.setProperty('--footer-h', `${footer.offsetHeight}px`);
}

function updateBannerFooterHeightVar() {
  const banner = document.querySelector('.top-banner-wrap');
  const footer = document.querySelector('#footer');
  if (!banner || !footer) return;

  const total = banner.offsetHeight + footer.offsetHeight;
  document.documentElement.style.setProperty('--banner-footer-h', `${total}px`);
}

function updateAllHeights() {
  updateBannerHeightVar();
  updateFooterHeightVar();
  updateBannerFooterHeightVar();
}

window.addEventListener('load', updateAllHeights);
window.addEventListener('resize', updateAllHeights);