(() => {
  const showcase = document.querySelector('.showcase');
  const viewer = document.querySelector('.showcase-viewer');
  if (!showcase || !viewer || typeof viewer.showModal !== 'function') return;

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const grid = showcase.querySelector('.showcase-grid');
  const works = [...grid.querySelectorAll('.showcase-work')];
  const controls = showcase.querySelector('.showcase-switch');
  const peek = showcase.querySelector('.showcase-peek');
  const peekImage = peek.querySelector('img');
  const viewerImage = viewer.querySelector('.showcase-viewer-stage img');
  const closeButton = viewer.querySelector('[data-viewer-close]');
  let current = 0;
  let opener;
  let selection = 0;

  controls.hidden = false;
  function showMode(mode) {
    showcase.dataset.mode = mode;
    peek.hidden = true;
    for (const button of controls.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.showcaseMode === mode));
    }
  }

  controls.addEventListener('click', event => {
    const mode = event.target.closest('[data-showcase-mode]')?.dataset.showcaseMode;
    if (!mode || mode === showcase.dataset.mode) return;
    showMode(mode);
    if (motion.matches) grid.animate(
      [{opacity:.2, translate:'0 9px'}, {opacity:1, translate:'0 0'}],
      {duration:360, easing:'cubic-bezier(.22,1,.36,1)'}
    );
  });
  showMode(matchMedia('(max-width: 760px)').matches ? 'text' : 'image');

  if ('IntersectionObserver' in window && motion.matches) {
    const observer = new IntersectionObserver(changes => {
      for (const change of changes) {
        if (!change.isIntersecting) continue;
        change.target.classList.add('showcase-arriving');
        observer.unobserve(change.target);
      }
    }, {threshold:.14});
    for (const work of works) observer.observe(work.closest('li'));
  }

  grid.addEventListener('pointermove', event => {
    if (showcase.dataset.mode !== 'text' || event.pointerType !== 'mouse') return;
    const work = event.target.closest('.showcase-work');
    if (!work) { peek.hidden = true; return; }
    const url = work.querySelector('img').src;
    if (peekImage.src !== url) peekImage.src = url;
    peek.hidden = false;
    const box = peek.getBoundingClientRect();
    const x = Math.max(12, Math.min(event.clientX + 32, innerWidth - box.width - 16));
    const y = Math.max(12, Math.min(event.clientY + 20, innerHeight - box.height - 16));
    peek.style.transform = `translate(${x}px, ${y}px)`;
  });
  grid.addEventListener('pointerleave', () => { peek.hidden = true; });

  function selectWork(index, from) {
    current = (index + works.length) % works.length;
    const work = works[current];
    const thumbnail = work.querySelector('img');
    const caption = work.querySelector('.showcase-work-text');
    const stamp = ++selection;
    viewerImage.alt = thumbnail.alt;
    viewerImage.src = thumbnail.src;
    viewer.querySelector('h2').textContent = caption.querySelector('strong').textContent;
    viewer.querySelector('[data-viewer-caption]').textContent =
      [caption.querySelector('span').textContent, caption.querySelector('time').textContent].join(' / ');
    viewer.querySelector('[data-viewer-credit]').textContent = work.dataset.credit || '';
    viewer.querySelector('[data-viewer-source]').href = work.href;
    viewer.querySelector('[data-viewer-position]').textContent = `${current + 1} / ${works.length}`;

    viewerImage.decode().then(() => {
      if (stamp !== selection || !viewer.open) return;
      let travel = Promise.resolve();
      if (motion.matches) {
        const to = viewerImage.getBoundingClientRect();
        const frames = from?.width && to.width && to.height
          ? [{transformOrigin:'top left', transform:`translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width},${from.height / to.height})`}, {transformOrigin:'top left', transform:'none'}]
          : [{opacity:.25, translate:'0 12px'}, {opacity:1, translate:'0 0'}];
        travel = viewerImage.animate(frames, {duration:540, easing:'cubic-bezier(.22,1,.36,1)'}).finished;
      }
      const large = new Image();
      large.src = work.dataset.large;
      Promise.all([travel, large.decode()]).then(() => {
        if (stamp === selection && viewer.open) viewerImage.src = large.src;
      }).catch(() => {});
    }).catch(() => {});
  }

  grid.addEventListener('click', event => {
    const work = event.target.closest('.showcase-work');
    if (!work || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = work;
    const from = work.querySelector('img').getBoundingClientRect();
    peek.hidden = true;
    viewer.showModal();
    selectWork(works.indexOf(work), from);
  });

  closeButton.addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => opener?.focus({preventScroll:true}));
  viewer.addEventListener('click', event => {
    const step = event.target.closest('[data-viewer-step]');
    if (step) selectWork(current + Number(step.dataset.viewerStep));
  });
  viewer.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    selectWork(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });
})();
