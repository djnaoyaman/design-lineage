(function () {
  'use strict';
  const chronology = typeof module !== 'undefined' && module.exports ? require('./chronology.js') : globalThis.LineageChronology;
  const BANDS = [
    { id: 'pre1900', title: '–1899', label: '1900年より前', note: '本文で確認した、この区分に関わる項目。' },
    { id: '1900-1949', title: '1900–49', label: '20世紀前半', note: '成立・主な展開を大区分で辿る入口。' },
    { id: '1950-1999', title: '1950–99', label: '20世紀後半', note: '個々の始期・終期は本文の表記を確認。' },
    { id: '2000plus', title: '2000–', label: '2000年以降', note: '空欄は、この時代にデザインがないことを意味しません。' },
    { id: 'unreviewed', title: '年代精査中', label: '大区分を未確定', note: '名前や見た目から年代を推測せず、ここに分けて表示します。' }
  ];
  const VALID = new Set(BANDS.map(b => b.id));
  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const text = (value, fallback) => typeof value === 'string' && value.trim() ? value : fallback;
  const safeSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : null;

  function normalizeEntries(data) {
    if (!Array.isArray(data)) throw new Error('Invalid entries format');
    return data.filter(e => e && typeof e === 'object' && typeof e.name === 'string').map(e => {
      const raw = Array.isArray(e.period_bands) ? e.period_bands : [];
      const bands = [...new Set(raw.filter(b => typeof b === 'string' && VALID.has(b)))];
      // Unknown/missing tags are surfaced, never inferred from names or prose years.
      if (!bands.length || raw.some(b => !VALID.has(b))) {
        if (!bands.includes('unreviewed')) bands.push('unreviewed');
      }
      return {
        name: e.name,
        title_ja: text(e.title_ja, '和名を確認中'),
        type: text(e.type, '種別を確認中'),
        period: text(e.period, '年代の本文表記を確認中'),
        region: text(e.region, '地域を確認中'),
        status: text(e.status, '本文試作・個別確認中'),
        slug: safeSlug(e.slug),
        bands
      };
    });
  }

  function groupEntries(entries, query) {
    const q = String(query || '').trim().toLocaleLowerCase();
    const visible = entries.filter(e => [e.name, e.title_ja, e.type, e.region].join(' ').toLocaleLowerCase().includes(q));
    return { visible, groups: BANDS.map(b => ({ ...b, entries: chronology.sort(visible.filter(e => e.bands.includes(b.id))) })) };
  }

  function entryLinks(entry, all) {
    if (!entry.slug) return '<span class="timeline-link-unavailable">詳細リンクを確認中</span>';
    const other = all.find(e => e.slug && e.slug !== entry.slug);
    const q = new URLSearchParams({ a: entry.slug });
    if (other) q.set('b', other.slug);
    return `<a href="entries/${entry.slug}.html">本文・出典を読む ↗</a><a href="compare.html?${escapeHTML(q.toString())}">項目を比較 ↗</a>`;
  }

  function card(entry, all) {
    const evidence=chronology.records[entry.slug];
    const supplement=evidence?.additional_source?`<p class="chronology-source">並び順の補足：${escapeHTML(evidence.sort_label)} <a href="${escapeHTML(evidence.additional_source)}" target="_blank" rel="noreferrer">年代の出典 ↗</a></p>`:'';
    const cross = entry.bands.length > 1 ? `<p class="timeline-cross-band">複数区分に表示：${entry.bands.map(id => escapeHTML(BANDS.find(b => b.id === id).label)).join(' / ')}</p>` : '';
    return `<article class="timeline-card" data-chronology-slug="${escapeHTML(entry.slug||'')}"><p class="timeline-card-kind">${escapeHTML(entry.type)}</p><h3>${escapeHTML(entry.title_ja)}</h3><p class="timeline-card-ja">${escapeHTML(entry.name)}</p><dl><div><dt>年代</dt><dd>${escapeHTML(entry.period)}</dd></div><div><dt>地域</dt><dd>${escapeHTML(entry.region)}</dd></div></dl>${supplement}${cross}<p class="timeline-card-status">${escapeHTML(entry.status)}</p><div class="timeline-card-links">${entryLinks(entry, all)}</div></article>`;
  }

  function renderTimeline(entries, query) {
    const result = groupEntries(entries, query);
    const filtered = String(query || '').trim().length > 0;
    const html = result.groups.map((band, i) => {
      const empty = filtered ? 'この検索条件に合う本文試作はありません。条件を変更すると他の項目も表示できます。' : band.id === 'unreviewed' ? '現在の本文試作には、この別枠へ分類する項目はありません。未確定の期間タグがある場合は、推測せずここに表示します。' : 'この区分に確認済みの期間タグを持つ本文試作は、まだありません。図鑑全体の未収録を意味し、歴史的な空白ではありません。';
      return `<section id="band-${band.id}" class="timeline-band${band.id === 'unreviewed' ? ' timeline-band-pending' : ''}" aria-labelledby="title-${band.id}"><div class="timeline-band-head"><span class="timeline-band-index">0${i + 1} / ${escapeHTML(band.label)}</span><h2 id="title-${band.id}">${escapeHTML(band.title)}</h2><p>${escapeHTML(band.note)}</p><span class="timeline-band-count">${band.entries.length} ${band.entries.length === 1 ? 'ENTRY' : 'ENTRIES'}</span></div><div class="timeline-cards">${band.entries.length ? band.entries.map(e => card(e, entries)).join('') : `<p class="timeline-empty">${escapeHTML(empty)}</p>`}</div></section>`;
    }).join('');
    const appearances = result.groups.reduce((sum, b) => sum + b.entries.length, 0);
    return { html, uniqueCount: result.visible.length, appearances, status: `${result.visible.length} / ${entries.length} 件の本文試作を表示。区分ごとの延べ表示は ${appearances} 件です（複数区分にまたがる同じ記事を含みます）。` };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { BANDS, escapeHTML, safeSlug, normalizeEntries, groupEntries, entryLinks, renderTimeline };
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  let entries = [];
  let loading = false;
  function draw() {
    const result = renderTimeline(entries, $('timeline-query').value);
    $('timeline-bands').innerHTML = result.html;
    $('timeline-status').textContent = result.status;
  }
  async function load() {
    if (loading) return;
    loading = true;
    $('timeline-error').hidden = true;
    $('timeline-bands').setAttribute('aria-busy', 'true');
    $('timeline-status').textContent = '年代別の本文試作を読み込んでいます。';
    $('timeline-retry').disabled = true;
    try {
      const response = await fetch('entries.json');
      if (!response.ok) throw new Error('Entries unavailable');
      entries = normalizeEntries(await response.json());
      draw();
    } catch (error) {
      $('timeline-bands').innerHTML = '';
      $('timeline-error').hidden = false;
      $('timeline-status').textContent = '読み込みに失敗しました。年代を推測した代替表示は行いません。';
    } finally {
      loading = false;
      $('timeline-bands').setAttribute('aria-busy', 'false');
      $('timeline-retry').disabled = false;
    }
  }
  $('timeline-query').addEventListener('input', draw);
  $('timeline-query').addEventListener('keydown', event => {
    if (event.key === 'Escape') { $('timeline-query').value = ''; draw(); }
  });
  $('timeline-reset').addEventListener('click', () => { $('timeline-query').value = ''; draw(); $('timeline-query').focus(); });
  $('timeline-retry').addEventListener('click', load);
  load();
}());
