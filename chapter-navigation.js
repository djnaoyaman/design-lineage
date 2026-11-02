/* Catalogue order, not chronology. Native links/history; no drag animation or scroll override. */
(() => {
  'use strict';
  const nav = document.querySelector('.chapter-navigation');
  const main = document.querySelector('main');
  if (!nav || !main) return;
  const ignored = 'a,button,input,textarea,select,label,summary,details,figure,img,picture,video,audio,iframe,canvas,svg,dialog,[role="dialog"],[role="slider"],[role="tablist"],[role="button"],[role="link"],[contenteditable]:not([contenteditable="false"]),[data-no-chapter-swipe],.gallery,.carousel,[aria-roledescription="carousel"]';
  const selected = () => Boolean(window.getSelection()?.toString());
  const blocked = target => !(target instanceof Element) || Boolean(target.closest(ignored)) || Boolean(document.querySelector('dialog[open],[role="dialog"][aria-modal="true"]'));
  const zoomed = () => Boolean(window.visualViewport && Math.abs(window.visualViewport.scale - 1) > 0.01);
  const scrollingRegion = target => {
    for (let e = target; e && e !== main; e = e.parentElement) {
      if (e.scrollWidth > e.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(e).overflowX)) return true;
    }
    return false;
  };
  const targetURL = direction => nav.querySelector(`a[rel="${direction}"]`)?.href;
  let gesture = null;
  let navigating = false;
  const reset = () => { gesture = null; };
  const navigate = direction => {
    const href = targetURL(direction);
    if (!href || navigating) return;
    navigating = true;
    window.location.assign(href);
  };
  // Passive listeners never cancel browser back gestures, vertical scroll or zoom.
  main.addEventListener('touchstart', event => {
    reset();
    if (event.defaultPrevented || zoomed() || event.touches.length !== 1 || selected() || blocked(event.target) || scrollingRegion(event.target)) return;
    const t = event.touches[0];
    const edge = 48;
    if (t.clientX <= edge || t.clientX >= window.innerWidth - edge || t.clientY < 48 || t.clientY > window.innerHeight - 48) return;
    gesture = {id:t.identifier, x:t.clientX, y:t.clientY, scroll:window.scrollY, scrollX:window.scrollX || 0, viewportX:window.visualViewport?.offsetLeft || 0, viewportY:window.visualViewport?.offsetTop || 0, time:performance.now()};
  }, {passive:true});
  main.addEventListener('touchmove', event => {
    if (!gesture) return;
    const t = Array.from(event.touches).find(t => t.identifier === gesture.id);
    if (event.touches.length !== 1 || !t || Math.abs(t.clientY - gesture.y) > 18 || Math.abs(window.scrollY - gesture.scroll) > 8 || selected()) reset();
  }, {passive:true});
  main.addEventListener('touchend', event => {
    const g = gesture;
    reset();
    if (!g || event.defaultPrevented || zoomed() || event.touches.length || selected() || blocked(event.target) || blocked(document.elementFromPoint(event.changedTouches[0]?.clientX || 0,event.changedTouches[0]?.clientY || 0))) return;
    const t = Array.from(event.changedTouches).find(t => t.identifier === g.id);
    if (!t) return;
    if (Math.abs((window.scrollX || 0) - g.scrollX) > 2 || Math.abs((window.visualViewport?.offsetLeft || 0) - g.viewportX) > 2 || Math.abs((window.visualViewport?.offsetTop || 0) - g.viewportY) > 2) return;
    const dx = t.clientX - g.x, dy = t.clientY - g.y;
    if (performance.now() - g.time > 650 || Math.abs(window.scrollY - g.scroll) > 8 || Math.abs(dx) < 90 || Math.abs(dy) > 18 || Math.abs(dx) < Math.abs(dy)*4) return;
    navigate(dx < 0 ? 'next' : 'prev');
  }, {passive:true});
  main.addEventListener('touchcancel', reset, {passive:true});
  document.addEventListener('selectionchange', () => { if (selected()) reset(); });
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  window.visualViewport?.addEventListener?.('resize', reset);
  window.addEventListener('pageshow', () => { reset(); navigating = false; });
  document.addEventListener('keydown', event => {
    if (zoomed() || document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || selected() || blocked(event.target)) return;
    // Focused controls and links retain their native keyboard behavior.
    if (document.activeElement !== document.body && document.activeElement !== document.documentElement) return;
    const direction = event.key === 'ArrowLeft' ? 'prev' : event.key === 'ArrowRight' ? 'next' : null;
    if (direction && targetURL(direction)) { event.preventDefault(); navigate(direction); }
  });
})();
