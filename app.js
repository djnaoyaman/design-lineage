// Bind before checking complete so both cached failures and later errors are handled.
const fallbackBoundImages = new WeakSet();
function bindImageFallbacks(selector) {
  document.querySelectorAll(selector).forEach(img => {
    if (fallbackBoundImages.has(img)) return;
    fallbackBoundImages.add(img);
    let failureShown = false;
    const showFailure = () => {
      if (failureShown) return;
      failureShown = true;
      img.hidden = true;
      const message = document.createElement('p');
      message.className = 'image-failure';
      message.textContent = '作品画像を読み込めませんでした。画像の取得は未完了です。所蔵機関の作品ページで確認する ↗';
      // Keep the original source link as the accessible fallback destination.
      img.parentElement.append(message);
    };
    img.addEventListener('error', showFailure);
    if (img.complete && img.naturalWidth === 0) showFailure();
  });
}
const $=s=>document.querySelector(s);let catalog=[];let articleIndex={};let articleIndexReady=false;let artworkData=[];const selectedWorks=new Set();const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fieldsOf=r=>String(r.field||'').split('・').map(x=>x.trim()).filter(Boolean);
function catalogArtwork(entry) {
  const artwork = entry?.adopted_images?.find(image => image.local_file?.startsWith('assets/') && image.width > 0 && image.height > 0);
  if (!artwork) return '<p class="edition-empty">実作品画像は準備中</p>';

  const variants = artwork.display_derivatives?.variants ?? [];
  const preview = variants.find(image => image.local_file && image.width >= 480) ?? artwork;
  return `<figure class="edition-catalog-art">
    <a href="entries/${esc(entry.slug)}.html" aria-label="${esc(entry.title_ja || entry.name)}の本文・作品例を読む"><img data-catalog-preview data-src="${esc(preview.local_file)}" width="${preview.width}" height="${preview.height}" alt="" loading="lazy" decoding="async"></a>
    <figcaption>${esc(artwork.title)}<small>${esc([artwork.author, artwork.year].filter(Boolean).join(' / '))}</small></figcaption>
  </figure>`;
}

function activateCatalogImages() {
  if ($('#items').classList.contains('list')) return;
  document.querySelectorAll('#items img[data-src]').forEach(image => {
    image.addEventListener('error', () => {
      const fallback = document.createElement('p');
      fallback.className = 'edition-empty';
      fallback.textContent = '図版・出典は本文で確認できます';
      image.closest('figure').replaceWith(fallback);
    }, {once:true});
    image.src = image.dataset.src;
    delete image.dataset.src;
  });
}
function render(){if(!articleIndexReady||!catalog.length)return;const q=$('#query').value.toLocaleLowerCase();let rows=catalog.filter(r=>[r.name,r.title_ja||'',articleIndex[r.name]?.title_ja||'',...(r.aliases||[])].join(' ').toLocaleLowerCase().includes(q)&&['category','region'].every(k=>!$('#'+k).value||r[k]===$('#'+k).value)&&(!$('#field').value||fieldsOf(r).includes($('#field').value))&&(!$('#period').value||(articleIndex[r.name]?.period_bands||['unreviewed']).includes($('#period').value)));rows=LineageChronology.sort(rows,r=>articleIndex[r.name]?.slug);const published=catalog.filter(r=>articleIndex[r.name]).length;$('#count').textContent=`${rows.length} / ${catalog.length} 項目 — 本文${published}件公開・画像収録は継続中`;$('#items').innerHTML=rows.length?rows.map((r,i)=>`${LineageChronology.key(articleIndex[r.name]?.slug)===null&&(i===0||LineageChronology.key(articleIndex[rows[i-1].name]?.slug)!==null)?'<div class="chronology-pending"><h3>技法・横断テーマなど</h3><p>共通の始まりを定めない主題、または年代の基準が未確定の項目です。掲載作品が作られた年を、その技法や表現が生まれた年とは扱わず、年代順の項目とは別にまとめています。</p></div>':''}<article data-chronology-slug="${esc(articleIndex[r.name]?.slug||'')}" class="entry ${r.name==='Bauhaus'?'active':''}">${catalogArtwork(articleIndex[r.name])}<div class="meta">${esc(r.category)} / ${esc(r.region)}</div><h3>${esc(r.title_ja||articleIndex[r.name]?.title_ja||r.name)}</h3>${r.title_ja!==r.name?`<p class="original-name">${esc(r.name)}</p>`:''}${r.name_note?`<p class="name-note">${esc(r.name_note)}</p>`:''}<div class="status">${esc(r.field)} · ${esc(articleIndex[r.name]?.period||r.date)}<br>${esc(articleIndex[r.name]?.status||r.status)}</div>${LineageChronology.records[articleIndex[r.name]?.slug]?.additional_source?`<p class="chronology-source">並び順の補足：${esc(LineageChronology.records[articleIndex[r.name].slug].sort_label)} <a href="${esc(LineageChronology.records[articleIndex[r.name].slug].additional_source)}" target="_blank" rel="noreferrer">年代の出典 ↗</a></p>`:''}${articleIndex[r.name]?`<a href="entries/${esc(articleIndex[r.name].slug)}.html">本文・作品例を読む ↗</a>`:(r.name==='Bauhaus'?'<a href="#bauhaus">詳細を読む ↗</a>':'')}</article>`).join(''):'<p>該当する項目はありません。条件を変更してください。</p>';activateCatalogImages();}
fetch('catalog.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{catalog=data;['category','region','field'].forEach(k=>{[...new Set(k==='field'?data.flatMap(fieldsOf):data.map(r=>r[k]))].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;$('#'+k).append(o)})});render()}).catch(()=>$('#count').textContent='一覧を読み込めませんでした。ページを再読み込みしてください。');
['query','category','region','field','period'].forEach(k=>$('#'+k).addEventListener('input',render));$('#reset').addEventListener('click',()=>{['query','category','region','field','period'].forEach(k=>$('#'+k).value='');render()});
fetch('image-rights.json').then(r=>r.json()).then(data=>{artworkData=data.images;$('#gallery').innerHTML=data.images.map((im,i)=>`<figure><div class="image-wrap"><a href="${esc(im.source_page)}" target="_blank" rel="noreferrer"><img src="${esc(im.display_image_url||im.image_url)}" alt="Paul Klee, ${esc(im.title)}, ${esc(im.year)}。美術館配信の作品画像" loading="lazy" referrerpolicy="no-referrer"></a></div><figcaption><span>0${i+1} / PAUL KLEE</span><h3>${esc(im.title)}</h3><span>${esc(im.year)} / ${esc(im.institution)}</span><p>${esc(im.viewing_point)}</p><label class="select-work"><input type="checkbox" data-work="${i}">この作品を比較に追加</label><p class="credit">${esc(im.credit)}</p><p class="credit">${im.status==='local_reference_image_not_representative'?'参照画像をローカル保存済み。歴史代表画像セットには算入しません。':'外部画像参照・ローカル保存未完了。配信先の状態により表示されないことがあります。'}</p><details><summary>出典と画像利用条件</summary><p><a href="${esc(im.source_page)}">所蔵機関の作品ページ ↗</a><br><a href="${esc(im.license_url)}">${esc(im.license)}</a> / <a href="${esc(im.rights_policy_url)}">機関のOpen Access方針</a><br>確認日：${esc(im.checked_at)}</p><p>原作品：美術館の個別許諾表示とPD方針を確認。複製：指定画像はCC0。米国機関の評価であり、世界各国の権利消滅を保証するものではありません。</p></details></figcaption></figure>`).join('');bindImageFallbacks('#gallery img')}).catch(()=>$('#gallery').textContent='画像権利台帳を読み込めませんでした。');

for (const view of ['grid', 'list']) {
  $('#view-' + view).addEventListener('click', () => {
    const anchor = document.elementFromPoint(innerWidth / 2, Math.min(innerHeight - 1, 100))?.closest('#items .entry');
    const top = anchor?.getBoundingClientRect().top;
    $('#items').classList.toggle('list', view === 'list');
    for (const mode of ['grid', 'list']) {
      $('#view-' + mode).setAttribute('aria-pressed', String(mode === view));
    }
    activateCatalogImages();
    if (anchor) window.scrollBy({top: anchor.getBoundingClientRect().top - top, behavior: 'instant'});
  });
}
$('#gallery').addEventListener('change',e=>{if(!e.target.matches('[data-work]'))return;const id=Number(e.target.dataset.work);if(e.target.checked)selectedWorks.add(id);else selectedWorks.delete(id);document.querySelectorAll('[data-work]').forEach(c=>c.disabled=selectedWorks.size===2&&!c.checked);$('#compare-count').textContent=`${selectedWorks.size} / 2`;$('#compare-open').disabled=selectedWorks.size!==2;});
$('#compare-open').addEventListener('click',()=>{if(selectedWorks.size!==2)return;$('#comparison-content').innerHTML=[...selectedWorks].map(id=>{const im=artworkData[id];return `<article><div class="image-wrap"><a href="${esc(im.source_page)}" target="_blank" rel="noreferrer"><img src="${esc(im.display_image_url||im.image_url)}" alt="${esc(im.title)}" referrerpolicy="no-referrer"></a></div><h3>${esc(im.title)}</h3><p>${esc(im.author)} / ${esc(im.year)}</p><p>${esc(im.viewing_point)}</p><a href="${esc(im.source_page)}" target="_blank" rel="noreferrer">所蔵元・作品情報 ↗</a></article>`}).join('');bindImageFallbacks('#comparison-content img');$('#comparison').showModal();});
$('#compare-close').addEventListener('click',()=>$('#comparison').close());
$('#comparison').addEventListener('click',e=>{if(e.target===$('#comparison')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});

fetch('entries.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(rows=>{articleIndex=Object.fromEntries(rows.map(x=>[x.name,x]));articleIndexReady=true;render()}).catch(()=>{$('#count').textContent='年代の情報を読み込めませんでした。ページを再読み込みしてください。';});
