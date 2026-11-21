const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => (
  {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]
));
const selectA = $('#select-a');
const selectB = $('#select-b');
const visual = $('#visual-comparison');
const toggle = $('.edition-compare-toggle');
const studies = new Map();
const prompts = [...document.querySelectorAll('.reading-questions a')].map(link => {
  const query = new URL(link.href).searchParams;
  return {link, title:link.querySelector('strong').textContent, pair:[query.get('a'), query.get('b')]};
});
const annotations = {
  bauhaus: '赤い見出しを上から追うと、学校や工房の案内をどの順に読めばよいかが見えてきます。',
  rinpa: '橋の折れ曲がりを目でたどってみてください。橋の両側にある花の群れへと視線が移ります。',
  rococo: 'ふたの上の野菜から、波打つ器の縁へ。飾りがどこまで続くかを目でたどってみてください。',
  'art-deco': '丸い脚と広がる飲み口の間に、四角い枠が重なっています。飾りは細い軸の中央に集まります。',
  'vienna-secession': '中央に広く取った黄色の周りに、人物と文字があります。黄色の面の端をたどってみてください。',
  'hideki-nakajima': '白と薄い灰色の面の中に、小さな黄色が一つあります。最初に目が止まる場所はどこでしょう。'
};

function suggestedPartner(entry) {
  const prompt = prompts.find(item => item.pair.includes(entry.slug));
  if (prompt) return prompt.pair.find(slug => slug !== entry.slug);
  return entry.related_articles?.find(item => studies.has(item.slug) && item.slug !== entry.slug)?.slug || '';
}

function sourceLink(entry, anchor = '') {
  return 'entries/' + encodeURIComponent(entry.slug) + '.html' + (anchor ? '#' + encodeURIComponent(anchor) : '');
}

function visualPanel(entry, prompt) {
  if (!entry) return '<figure><div class="compare-text-example"><strong>何と見比べますか？</strong><span>上の「比較する項目 B」から選べます。</span></div></figure>';
  const works = entry.adopted_images || [];
  // Keep the artwork used by Selected Works when the same building appears in two articles.
  const preferred = entry.slug === 'critical-regionalism' && works.find(work => work.id === 'photo-bagsvaerd');
  const image = preferred || works.find(work => work.local_file) || entry.reference_images?.find(work => work.local_file);
  const title = '<p class="compare-entry-title">' + esc(entry.title_ja) + '</p>';
  if (!image) {
    const example = entry.representatives?.[0];
    return `<figure><div class="compare-text-example"><small>本文に登場する作品・制作例</small><strong>${esc(example?.title_ja || example?.title || entry.name)}</strong></div><figcaption>${title}<p>${esc(entry.recognition.form)}</p><a href="${sourceLink(entry)}">本文と出典を読む</a></figcaption></figure>`;
  }

  const variant = image.display_derivatives?.variants?.find(item => item.width >= 480) || image;
  const anchor = image.presentation?.anchor ||
    (['hideki-nakajima','arts-and-crafts'].includes(entry.slug) ? 'representative-works' : image.id);
  const hint = (prompt && annotations[entry.slug]) || image.visual_notes?.[0]?.text || image.alt;
  const isReference = !works.includes(image);
  const mark = ['bauhaus','rinpa'].includes(entry.slug) ? ' edition-compare-' + entry.slug : '';
  const rights = image.license_url ? ` · <a href="${esc(image.license_url)}">${esc(image.license || '利用条件')}</a>` : '';
  return `<figure>
    <div class="compare-art-stage"><div class="edition-compare-image${mark}"><img src="${esc(variant.local_file)}" width="${Number(variant.width)}" height="${Number(variant.height)}" alt="${esc(image.alt || image.title)}" decoding="async"></div></div>
    <figcaption>${title}<a href="${sourceLink(entry, anchor)}">${isReference ? '参照図版 · ' : ''}${esc(image.title)}</a>
      <p class="compare-reading-hint">${esc(hint)}</p>
      <details class="compare-image-credit"><summary>出典・クレジット</summary><p>${esc(image.credit || image.author)}${rights}</p><a href="${sourceLink(entry, anchor)}">記事の図版解説へ</a></details>
    </figcaption></figure>`;
}

const rows = [
  ['まず、ここから', e => e.reading_intro?.lead?.join(' ').replaceAll('このページの','本文で紹介する') || e.summary],
  ['学校・運動・技法など', e => e.type],
  ['年代と場所', e => e.period + ' / ' + e.region],
  ['大切にした考え方', e => e.summary],
  ['色と素材', e => e.recognition.color],
  ['文字と情報', e => e.recognition.type],
  ['形と構造', e => e.recognition.form],
  ['並べ方と空間', e => e.recognition.composition],
  ['似ているところ、違うところ', e => e.comparison]
];
function table(pair) {
  const columns = pair.map(e => `<article class="compare-column"><h2>${esc(e.title_ja)}</h2><p class="note">${esc(e.name)}</p><a href="${sourceLink(e)}">詳しい本文・出典 ↗</a></article>`).join('');
  function cells(label, body) {
    return pair.map(e => `<div class="compare-cell"><p class="compare-cell-name">${esc(e.title_ja)}</p><h3>${label}</h3>${body(e)}</div>`).join('');
  }
  const details = rows.map(([label, read]) => cells(label, e => '<p>' + esc(read(e)) + '</p>')).join('');
  const examples = cells('作品から、もっと知る。', e => '<ol class="compare-work-list">' + e.representatives.map(work =>
    `<li><p class="compare-work-lead">${esc(work.reading_intro?.heading || work.title_ja || work.title)}</p><p class="compare-work-original">${work.title_original ? '原題' : '作品名（出典表記）'}　${esc(work.title_original || work.title)}</p><p class="compare-work-credit">作った人　${esc(work.creator)}</p></li>`
  ).join('') + '</ol>');
  const coverage = cells('画像の掲載状況', e => `<p>実作品画像 ${e.image_count_acquired || 0}点、参照・関連画像 ${e.reference_image_count || 0}点、生成学習図 ${e.generated_style_image_count || 0}点。</p>`);
  return columns + details + examples + coverage;
}

function draw() {
  const a = studies.get(selectA.value);
  const b = studies.get(selectB.value);
  const prompt = prompts.find(item => a.slug !== b?.slug && item.pair.includes(a.slug) && item.pair.includes(b?.slug));
  for (const item of prompts) {
    if (item === prompt) item.link.setAttribute('aria-current', 'true');
    else item.link.removeAttribute('aria-current');
  }
  $('#visual-comparison-title').textContent = prompt?.title || (b ? '二つの項目を見比べる' : a.title_ja + 'と見比べる');
  visual.querySelector('.edition-feature-head p').textContent = b ? a.title_ja + ' × ' + b.title_ja : '比較するもう一つの項目を選んでください。';
  visual.querySelector('.edition-pair').innerHTML = visualPanel(a, prompt) + visualPanel(b, prompt);
  toggle.hidden = !(prompt && prompt.pair.includes('bauhaus'));
  toggle.setAttribute('aria-pressed', 'false');
  visual.removeAttribute('data-marked');
  $('#compare-status').textContent = a === b ? '同じ項目を選択しています。違う項目を選ぶと比較できます。' : '';
  $('#compare-result').innerHTML = b ? table([a, b]) : '';
  const url = new URL(location.href);
  url.searchParams.set('a', a.slug);
  if (b) url.searchParams.set('b', b.slug);
  else url.searchParams.set('b', '');
  history.replaceState(null, '', url);
}

toggle.addEventListener('click', () => toggle.setAttribute('aria-pressed', String(visual.toggleAttribute('data-marked'))));
// Leave the static example readable without JavaScript. On deep links, wait for the requested pair.
visual.style.visibility = 'hidden';
visual.setAttribute('aria-busy', 'true');
selectA.disabled = selectB.disabled = true;
$('#compare-status').textContent = '比較する項目を読み込んでいます。';
fetch('entries.json').then(response => {
  if (!response.ok) throw new Error('entries');
  return response.json();
}).then(data => {
  selectB.add(new Option('項目を選ぶ', ''));
  for (const entry of data) {
    studies.set(entry.slug, entry);
    for (const select of [selectA, selectB]) select.add(new Option(entry.title_ja, entry.slug));
  }
  const query = new URLSearchParams(location.search);
  selectA.value = studies.has(query.get('a')) ? query.get('a') : 'bauhaus';
  selectB.value = query.get('b') === '' ? '' : (studies.has(query.get('b')) ? query.get('b') : suggestedPartner(studies.get(selectA.value)));
  draw();
  selectA.disabled = selectB.disabled = false;
  visual.style.removeProperty('visibility');
  visual.removeAttribute('aria-busy');
  for (const select of [selectA, selectB]) select.addEventListener('change', draw);
}).catch(() => {
  visual.hidden = true;
  visual.removeAttribute('aria-busy');
  $('#compare-status').textContent = '比較データを読み込めませんでした。再読み込みしてください。';
});
