(() => {
  const section = document.querySelector('.showcase[data-mode]');
  if (!section) return;

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const gallery = section.querySelector('.showcase-grid');
  const stage = section.querySelector('.scroll-gallery-stage');
  const layers = [...stage.querySelectorAll('img')];
  const caption = stage.querySelector('.scroll-gallery-caption');
  const cards = [...gallery.querySelectorAll('.showcase-card')].map(row => ({
    row,
    title: row.querySelector('strong').textContent,
    label: row.querySelector('.showcase-work-text span').textContent,
    source: row.querySelector('img').src,
  }));
  let active = -1;
  let front = 0;
  let generation = 0;
  let scheduled = 0;

  function choose(index) {
    if (index === active) return;
    cards[active]?.row.classList.remove('scroll-current');
    active = index;
    cards[index].row.classList.add('scroll-current');
    const card = cards[index];
    const request = ++generation;
    for (const adjacent of [cards[index - 1], cards[index + 1]]) {
      if (!adjacent) continue;
      const preload = new Image();
      preload.src = adjacent.source;
    }
    const image = new Image();
    image.src = card.source;
    image.decode().then(() => {
      if (request !== generation) return;
      const old = layers[front];
      front = 1 - front;
      const next = layers[front];
      for (const layer of layers) layer.getAnimations().forEach(animation => animation.cancel());
      next.src = image.src;
      old.removeAttribute('data-front');
      next.setAttribute('data-front', '');
      caption.querySelector('strong').textContent = card.title;
      caption.querySelector('span').textContent = card.label;
      if (!motion.matches) return;
      if (old.hasAttribute('src')) old.animate([{opacity:1}, {opacity:0}], {duration:280, easing:'ease'});
      next.animate([{opacity:0, transform:'translateY(10px) scale(.98)'}, {opacity:1, transform:'none'}],
        {duration:430, easing:'cubic-bezier(.22,1,.36,1)'});
    }).catch(() => {});
  }

  function readScroll() {
    scheduled = 0;
    if (section.dataset.mode !== 'text') {
      section.removeAttribute('data-stage-visible');
      return;
    }
    const line = window.innerHeight * .42;
    const bounds = gallery.getBoundingClientRect();
    const starts = cards[0].row.getBoundingClientRect().top;
    const ends = cards.at(-1).row.getBoundingClientRect().bottom;
    const visible = starts < line && ends > line - 32 && bounds.bottom > line;
    section.toggleAttribute('data-stage-visible', visible);
    if (!visible) return;

    let nearest = 0;
    let distance = Infinity;
    for (const [index, card] of cards.entries()) {
      const rect = card.row.getBoundingClientRect();
      const delta = Math.abs(rect.top + rect.height / 2 - line);
      if (delta >= distance) continue;
      nearest = index;
      distance = delta;
    }
    choose(nearest);
  }

  function schedule() {
    if (!scheduled) scheduled = requestAnimationFrame(readScroll);
  }

  section.setAttribute('data-scroll-ready', '');
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  section.querySelector('.showcase-switch').addEventListener('click', schedule);
  section.addEventListener('focusin', schedule);
  schedule();

  const menu = document.querySelector('.lineage-mobile-menu');
  menu?.addEventListener('click', event => {
    if (event.target.closest('a')) menu.open = false;
  });
})();
