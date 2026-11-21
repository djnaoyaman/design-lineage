(() => {
  const gallery = document.querySelector('.grouped-gallery');
  if (!gallery) return;
  const sections = [...gallery.querySelectorAll('.plate-section')];
  const links = gallery.querySelectorAll('nav a');
  function selectGroup() {
    const target = document.getElementById(location.hash.slice(1));
    const group = target?.matches('.plate-group-info') ? target.id : null;
    const revealTarget = target?.matches('.plate') && target.hidden;
    for (const section of sections) {
      let visible = 0;
      for (const plate of section.querySelectorAll('.plate')) {
        plate.hidden = Boolean(group && plate.dataset.group !== group);
        if (!plate.hidden) visible++;
      }
      section.hidden = visible === 0;
    }
    for (const link of links) {
      if (link.hash.slice(1) === (group || gallery.id)) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    if (revealTarget) target.scrollIntoView();
  }
  selectGroup();
  window.addEventListener('hashchange', selectGroup);
})();
