/* Optional, one-per-tab-session introduction. Gesture handling lives elsewhere. */
(() => {
  'use strict';
  if (!document.querySelector('.chapter-navigation') || typeof IntersectionObserver === 'undefined') return;
  if (!(navigator.maxTouchPoints > 0 || window.matchMedia('(any-pointer: coarse)').matches)) return;
  const key = 'design-lineage:chapter-swipe-hint:v1';
  try { if (sessionStorage.getItem(key) === 'seen') return; } catch { return; }
  const targets = [...document.querySelectorAll('.reading-entrance, .article-story > section > p, #representative-works > h2')];
  if (!targets.length) return;
  let shown = false, pending, expiry, hint;
  const visibleTargets = new Set();
  const zoomed = () => Math.abs((window.visualViewport?.scale || 1) - 1) > 0.01;
  const selected = () => Boolean(window.getSelection()?.toString());
  const hide = () => {
    clearTimeout(expiry);
    if (shown) observer.disconnect();
    hint?.remove(); hint = null;
    document.removeEventListener('pointerdown', hide);
    document.removeEventListener('keydown', hide);
    document.removeEventListener('selectionchange', onSelection);
  };
  const onSelection = () => { if (selected()) hide(); };
  const show = target => {
    pending = null;
    const rect = target.getBoundingClientRect();
    if (shown || zoomed() || document.visibilityState !== 'visible' || rect.bottom <= 80 || rect.top >= innerHeight - 96 || selected() || document.querySelector('dialog[open],[role="dialog"][aria-modal="true"]')) return;
    if (document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')) return;
    shown = true;
    // If storage is unavailable, skip the transient hint rather than repeat it on every page.
    try { if (sessionStorage.getItem(key) === 'seen') { observer.disconnect(); return; } sessionStorage.setItem(key, 'seen'); } catch { observer.disconnect(); return; }
    hint = document.createElement('div');
    hint.className = 'chapter-swipe-hint';
    hint.setAttribute('role', 'status');
    hint.setAttribute('aria-live', 'polite');
    hint.setAttribute('aria-atomic', 'true');
    // Original line drawing: no historical artwork or external image dependency.
    hint.innerHTML = '<svg class="swipe-hint-icon" viewBox="0 0 96 44" aria-hidden="true" focusable="false"><g class="swipe-hint-arrows" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19h15M12 14l-5 5 5 5M74 19h15M84 14l5 5-5 5"/></g><g class="swipe-hint-hand" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M41 29V10a3 3 0 0 1 6 0v12-3a3 3 0 0 1 6 0v4-2a3 3 0 0 1 6 0v4-1a3 3 0 0 1 6 0v7c0 6-4 10-10 10h-5c-4 0-7-2-9-5l-6-8a3 3 0 0 1 4-4l2 3"/></g></svg><span>左右にスワイプで<br>前後の項目へ</span>';
    document.body.append(hint);
    document.addEventListener('pointerdown', hide, {passive:true});
    document.addEventListener('keydown', hide);
    document.addEventListener('selectionchange', onSelection);
    expiry = setTimeout(hide, 3600);
  };
  const schedule = () => {
    if (shown || pending) return;
    pending = setTimeout(() => {
      pending = null;
      const target = [...visibleTargets].find(e => { const r=e.getBoundingClientRect(); return r.bottom>80 && r.top<innerHeight-96; });
      if (target) show(target);
    }, 180);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) visibleTargets.add(e.target); else visibleTargets.delete(e.target); });
    if (shown) { if (hint && !visibleTargets.size) hide(); return; }
    if (visibleTargets.size) schedule();
  }, {rootMargin:'-80px 0px -96px 0px', threshold:0.15});
  targets.forEach(target => observer.observe(target));
  window.visualViewport?.addEventListener('resize', () => { if (zoomed()) { clearTimeout(pending); pending=null; hide(); } else schedule(); });
  window.addEventListener('pageshow', schedule);
  window.addEventListener('pagehide', () => { clearTimeout(pending); pending = null; hide(); });
})();
