if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('edition-in-view');
      reveal.unobserve(entry.target);
    }
  }, {threshold: .18});
  document.querySelectorAll('.editor-original-feature').forEach(element => reveal.observe(element));
}

window.addEventListener('pageswap', event => {
  if (!event.viewTransition || !event.activation) return;
  const slug = new URL(event.activation.entry.url).pathname.match(/\/entries\/(bauhaus|rinpa)\.html$/)?.[1];
  if (!slug) return;
  const thumbnail = document.querySelector(`[data-chronology-slug="${slug}"] [data-catalog-preview]`);
  if (!thumbnail?.complete || !thumbnail.naturalWidth || !thumbnail.getClientRects().length) return;
  const {top, bottom} = thumbnail.getBoundingClientRect();
  if (bottom <= 0 || top >= innerHeight) return;
  thumbnail.style.viewTransitionName = `edition-${slug}`;
  const reset = () => {
    thumbnail.style.removeProperty('view-transition-name');
  };
  event.viewTransition.finished.then(reset, reset);
});
