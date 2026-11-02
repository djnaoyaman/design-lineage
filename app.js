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
const $=s=>document.querySelector(s);let catalog=[];let articleIndex={};let artworkData=[];const selectedWorks=new Set();const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fieldsOf=r=>String(r.field||'').split('・').map(x=>x.trim()).filter(Boolean);
function render(){const q=$('#query').value.toLocaleLowerCase();let rows=catalog.filter(r=>[r.name,r.title_ja||'',articleIndex[r.name]?.title_ja||'',...(r.aliases||[])].join(' ').toLocaleLowerCase().includes(q)&&['category','region'].every(k=>!$('#'+k).value||r[k]===$('#'+k).value)&&(!$('#field').value||fieldsOf(r).includes($('#field').value))&&(!$('#period').value||(articleIndex[r.name]?.period_bands||['unreviewed']).includes($('#period').value)));const published=catalog.filter(r=>articleIndex[r.name]).length;$('#count').textContent=`${rows.length} / ${catalog.length} 項目 — 本文${published}件公開・画像収録は継続中`;$('#items').innerHTML=rows.length?rows.map(r=>`<article class="entry ${r.name==='Bauhaus'?'active':''}"><div class="meta">${esc(r.category)} / ${esc(r.region)}</div><h3>${esc(r.title_ja||articleIndex[r.name]?.title_ja||r.name)}</h3>${r.title_ja!==r.name?`<p class="original-name">${esc(r.name)}</p>`:''}${r.name_note?`<p class="name-note">${esc(r.name_note)}</p>`:''}<div class="status">${esc(r.field)} · ${esc(articleIndex[r.name]?.period||r.date)}<br>${esc(articleIndex[r.name]?.status||r.status)}</div>${articleIndex[r.name]?`<a href="entries/${esc(articleIndex[r.name].slug)}.html">本文・作品例を読む ↗</a>`:(r.name==='Bauhaus'?'<a href="#bauhaus">詳細を読む ↗</a>':'')}</article>`).join(''):'<p>該当する項目はありません。条件を変更してください。</p>';}
fetch('catalog.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{catalog=data;['category','region','field'].forEach(k=>{[...new Set(k==='field'?data.flatMap(fieldsOf):data.map(r=>r[k]))].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;$('#'+k).append(o)})});render()}).catch(()=>$('#count').textContent='一覧を読み込めませんでした。ページを再読み込みしてください。');
['query','category','region','field','period'].forEach(k=>$('#'+k).addEventListener('input',render));$('#reset').addEventListener('click',()=>{['query','category','region','field','period'].forEach(k=>$('#'+k).value='');render()});
fetch('image-rights.json').then(r=>r.json()).then(data=>{artworkData=data.images;$('#gallery').innerHTML=data.images.map((im,i)=>`<figure><div class="image-wrap"><a href="${esc(im.source_page)}" target="_blank" rel="noreferrer"><img src="${esc(im.display_image_url||im.image_url)}" alt="Paul Klee, ${esc(im.title)}, ${esc(im.year)}。美術館配信の作品画像" loading="lazy" referrerpolicy="no-referrer"></a></div><figcaption><span>0${i+1} / PAUL KLEE</span><h3>${esc(im.title)}</h3><span>${esc(im.year)} / ${esc(im.institution)}</span><p>${esc(im.viewing_point)}</p><label class="select-work"><input type="checkbox" data-work="${i}">この作品を比較に追加</label><p class="credit">${esc(im.credit)}</p><p class="credit">${im.status==='local_reference_image_not_representative'?'参照画像をローカル保存済み。歴史代表画像セットには算入しません。':'外部画像参照・ローカル保存未完了。配信先の状態により表示されないことがあります。'}</p><details><summary>出典と画像利用条件</summary><p><a href="${esc(im.source_page)}">所蔵機関の作品ページ ↗</a><br><a href="${esc(im.license_url)}">${esc(im.license)}</a> / <a href="${esc(im.rights_policy_url)}">機関のOpen Access方針</a><br>確認日：${esc(im.checked_at)}</p><p>原作品：美術館の個別許諾表示とPD方針を確認。複製：指定画像はCC0。米国機関の評価であり、世界各国の権利消滅を保証するものではありません。</p></details></figcaption></figure>`).join('');bindImageFallbacks('#gallery img')}).catch(()=>$('#gallery').textContent='画像権利台帳を読み込めませんでした。');

for(const view of ['grid','list'])$('#view-'+view).addEventListener('click',()=>{$('#items').classList.toggle('list',view==='list');for(const v of ['grid','list'])$('#view-'+v).setAttribute('aria-pressed',String(v===view))});
$('#gallery').addEventListener('change',e=>{if(!e.target.matches('[data-work]'))return;const id=Number(e.target.dataset.work);if(e.target.checked)selectedWorks.add(id);else selectedWorks.delete(id);document.querySelectorAll('[data-work]').forEach(c=>c.disabled=selectedWorks.size===2&&!c.checked);$('#compare-count').textContent=`${selectedWorks.size} / 2`;$('#compare-open').disabled=selectedWorks.size!==2;});
$('#compare-open').addEventListener('click',()=>{if(selectedWorks.size!==2)return;$('#comparison-content').innerHTML=[...selectedWorks].map(id=>{const im=artworkData[id];return `<article><div class="image-wrap"><a href="${esc(im.source_page)}" target="_blank" rel="noreferrer"><img src="${esc(im.display_image_url||im.image_url)}" alt="${esc(im.title)}" referrerpolicy="no-referrer"></a></div><h3>${esc(im.title)}</h3><p>${esc(im.author)} / ${esc(im.year)}</p><p>${esc(im.viewing_point)}</p><a href="${esc(im.source_page)}" target="_blank" rel="noreferrer">所蔵元・作品情報 ↗</a></article>`}).join('');bindImageFallbacks('#comparison-content img');$('#comparison').showModal();});
$('#compare-close').addEventListener('click',()=>$('#comparison').close());
$('#comparison').addEventListener('click',e=>{if(e.target===$('#comparison')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});

fetch('entries.json').then(r=>r.json()).then(rows=>{articleIndex=Object.fromEntries(rows.map(x=>[x.name,x]));render()}).catch(()=>{});
