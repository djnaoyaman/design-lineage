const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),c=require('../chronology.js'),entries=JSON.parse(fs.readFileSync('entries.json'));
const base='http://127.0.0.1:8793/',results=[];fs.mkdirSync('qa-artifacts',{recursive:true});
(async()=>{const browser=await chromium.launch();try{
for(const width of [320,390,768,1280]){
const p=await browser.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));
await p.goto(base+'index.html#catalog');await p.waitForFunction(()=>document.querySelectorAll('#items article').length===90);
const slugs=()=>p.locator('#items article').evaluateAll(es=>es.map(e=>e.dataset.chronologySlug));
const expected=c.sort(entries).map(e=>e.slug);assert.deepEqual(await slugs(),expected);
assert.equal(await p.locator('details.home-feature-banner[open]').count(),0,'Feature default remains closed');
assert.equal(await p.locator('#view-list').getAttribute('aria-pressed'),'true');await p.locator('#view-grid').click();await p.locator('#items article').first().evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await p.screenshot({path:`qa-artifacts/chronology-grid-${width}.png`});
await p.locator('#view-list').click();assert.deepEqual(await slugs(),expected);await p.locator('#items article').first().evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await p.screenshot({path:`qa-artifacts/chronology-list-${width}.png`});
for(const slug of ['jugendstil','russian-constructivism','dada','hurufiyya']){const card=p.locator('#items article[data-chronology-slug="'+slug+'"]');await card.scrollIntoViewIfNeeded();const geometry=await card.evaluate(e=>({card:e.getBoundingClientRect().width,scroll:e.scrollWidth,width:e.clientWidth,source:e.querySelector('.chronology-source').getBoundingClientRect().width}));assert(geometry.scroll<=geometry.width+1,'Supplemental source fits '+slug);assert(geometry.source<=geometry.card+1);await p.screenshot({path:`qa-artifacts/chronology-source-${slug}-${width}.png`});}
await p.locator('#query').fill('デザイン');const filtered=await slugs();assert(filtered.length>1);assert.deepEqual(filtered,c.sort(filtered,x=>x));await p.locator('#reset').click();assert.deepEqual(await slugs(),expected);
for(const id of ['category','region','field','period']){const value=await p.locator('#'+id+' option').nth(1).getAttribute('value');await p.locator('#'+id).selectOption(value);const got=await slugs();assert.deepEqual(got,c.sort(got,x=>x));await p.locator('#reset').click();assert.deepEqual(await slugs(),expected);}
await p.locator('#items .chronology-pending').scrollIntoViewIfNeeded();await p.screenshot({path:`qa-artifacts/chronology-pending-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await p.locator('#view-grid').click();await p.goto(base+'timeline.html');await p.waitForFunction(()=>document.querySelectorAll('.timeline-card').length>90);
for(const band of await p.locator('.timeline-band').all()){const got=await band.locator('.timeline-card').evaluateAll(es=>es.map(e=>e.dataset.chronologySlug));assert.deepEqual(got,c.sort(got,x=>x));}
await p.locator('#band-pre1900').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await p.screenshot({path:`qa-artifacts/chronology-timeline-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await p.locator('#timeline-query').fill('デザイン');await p.locator('#timeline-reset').click();assert.deepEqual(errors,[]);results.push({width,known:68,pending:22,filters:true,gridList:true,timeline:true,errors});await p.close();
}
// Plate views keep the same chronology when filtered or opened from an existing bookmark.
const check=await browser.newPage({viewport:{width:390,height:844}});
await check.goto(base+'index.html#selected-works');
function year(text) {
  if (/^(原)?制作年未/.test(text)) return Infinity;
  if (text==='18世紀初頭') return 1700;
  return Number(text.match(/\d{4}/)?.[0] ?? Infinity);
}
function checkOrder(labels) {
  const dates=labels.map(year);
  assert.deepEqual(dates,[...dates].sort((a,b)=>a-b));
}
const featured=check.locator('.showcase-card time');
assert.equal(await featured.count(),74);
checkOrder(await featured.allTextContents());
await check.goto(base+'works.html');
const articles=await check.locator('.works-article[href^="entries/"]').evaluateAll(links=>links.map(a=>a.getAttribute('href').split('/')[1].split('.')[0]));
assert.deepEqual(articles,c.sort(entries).map(e=>e.slug));
await check.goto(base+'entries/pre-raphaelites.html#actual-works');
const plates=check.locator('.plate:visible');
async function checkPlates(count) {
  await check.waitForFunction(expected=>document.querySelectorAll('.plate:not([hidden])').length===expected,count);
  assert.equal(await plates.count(),count);
  checkOrder((await plates.locator('.plate-meta').allTextContents()).map(label=>label.split(' · ').at(-1)));
}
await checkPlates(57);
await check.locator('nav a[href="#plate-millais"]').click();
await checkPlates(8);
await check.goto(base+'entries/pre-raphaelites.html#plate-waterhouse');
await checkPlates(9);
await check.locator('.plate-group-info:target a[href="#actual-works"]').click();
await checkPlates(57);
await check.goBack();
await checkPlates(9);
await check.close();
const p=await browser.newPage();await p.route('**/entries.json',r=>r.fulfill({status:503,body:'unavailable'}));await p.goto(base+'index.html#catalog');await p.waitForFunction(()=>document.querySelector('#count').textContent.includes('年代の情報を読み込めません'));assert.equal(await p.locator('#items article').count(),0,'Never fall back to unsorted list on missing chronology source');await p.close();
fs.writeFileSync('qa-artifacts/chronology-results.json',JSON.stringify({results,failures:[]},null,2));
}finally{await browser.close();}})().catch(e=>{fs.writeFileSync('qa-artifacts/chronology-failure.json',JSON.stringify({error:String(e),results},null,2));console.error(e);process.exitCode=1;});
