// Public catalogue choices only. No search query, copied text, or visitor input.
(() => {
  'use strict';
  if (window.__lineageEventsBound) return;
  window.__lineageEventsBound = true;
  const id = 'G-3HF3LB4BMR';
  const names = new Set(['select_content','select_filter','compare_content','share']);
  const fields = new Set(['content_type','item_id','content_id','comparison_content_id','item_count','filter_name','filter_value','method']);
  window.trackLineageEvent = (name, params = {}) => {
    if (location.hostname !== 'djnaoyaman.github.io' || !names.has(name) || window['ga-disable-' + id] || typeof window.gtag !== 'function') return;
    try {
      const path = /^\/design-lineage\/(?:[a-z0-9-]+\.html|entries\/[a-z0-9-]+\.html)?$/.test(location.pathname) ? location.pathname : '/design-lineage/';
      const safe = {send_to:id, transport_type:'beacon', page_location:'https://djnaoyaman.github.io' + path, page_referrer:''};
      for (const [key, value] of Object.entries(params)) {
        if (fields.has(key) && ((typeof value === 'string' && value.length <= 100) || (typeof value === 'number' && Number.isFinite(value)))) safe[key] = value;
      }
      window.gtag('event', name, safe);
    } catch { /* Analytics must never interrupt navigation or comparison. */ }
  };
  document.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download')) return;
    try {
      const url = new URL(link.href, location.href);
      const content = url.pathname.match(/^\/design-lineage\/entries\/([a-z0-9-]+)\.html$/);
      if (url.origin === location.origin && content && url.pathname !== location.pathname) {
        window.trackLineageEvent('select_content', {content_type:'design_entry', item_id:content[1]});
      }
    } catch { /* Ignore links without a valid destination. */ }
  });
document.querySelectorAll('[data-copy-page]').forEach(button=>{button.addEventListener('click',async()=>{const status=button.parentElement.querySelector('.share-status');const url=new URL(button.dataset.copyPage);if(location.pathname.endsWith('/compare.html')){const query=new URLSearchParams(location.search);for(const key of ['a','b']){const value=query.get(key);if((key==='b'&&value==='')||(value&&/^[a-z0-9-]+$/.test(value)))url.searchParams.set(key,value);}}try{if(!navigator.clipboard)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(url.href);status.textContent='リンクをコピーしました。';window.trackLineageEvent('share',{method:'copy_link',content_type:'design_page'});}catch(error){status.textContent='このURLをコピーしてください：'+url.href;}});});

})();

