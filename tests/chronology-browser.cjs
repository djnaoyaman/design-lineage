const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),c=require('../chronology.js'),entries=JSON.parse(fs.readFileSync('entries.json'));
const base='http://127.0.0.1:8793/',results=[];fs.mkdirSync('qa-artifacts',{recursive:true});
(async()=>{const browser=await chromium.launch();try{
for(const width of [320,390,768,1280]){
const p=await browser.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));
await p.goto(base+'index.html#catalog');await p.waitForFunction(()=>document.querySelectorAll('#items article').length===89);
const slugs=()=>p.locator('#items article').evaluateAll(es=>es.map(e=>e.dataset.chronologySlug));
const expected=c.sort(entries).map(e=>e.slug);assert.deepEqual(await slugs(),expected);
assert.equal(await p.locator('details.home-feature-banner[open]').count(),0,'Feature default remains closed');
await p.locator('#chronology-note').scrollIntoViewIfNeeded();await p.screenshot({path:`qa-artifacts/chronology-grid-${width}.png`});
await p.locator('#view-list').click();assert.deepEqual(await slugs(),expected);await p.locator('#items').scrollIntoViewIfNeeded();await p.screenshot({path:`qa-artifacts/chronology-list-${width}.png`});
for(const slug of ['jugendstil','russian-constructivism','dada','hurufiyya']){const card=p.locator('#items article[data-chronology-slug="'+slug+'"]');await card.scrollIntoViewIfNeeded();const geometry=await card.evaluate(e=>({card:e.getBoundingClientRect().width,scroll:e.scrollWidth,width:e.clientWidth,source:e.querySelector('.chronology-source').getBoundingClientRect().width}));assert(geometry.scroll<=geometry.width+1,'Supplemental source fits '+slug);assert(geometry.source<=geometry.card+1);await p.screenshot({path:`qa-artifacts/chronology-source-${slug}-${width}.png`});}
await p.locator('#query').fill('デザイン');const filtered=await slugs();assert(filtered.length>1);assert.deepEqual(filtered,c.sort(filtered,x=>x));await p.locator('#reset').click();assert.deepEqual(await slugs(),expected);
for(const id of ['category','region','field','period']){const value=await p.locator('#'+id+' option').nth(1).getAttribute('value');await p.locator('#'+id).selectOption(value);const got=await slugs();assert.deepEqual(got,c.sort(got,x=>x));await p.locator('#reset').click();assert.deepEqual(await slugs(),expected);}
await p.locator('#items .chronology-pending').scrollIntoViewIfNeeded();await p.screenshot({path:`qa-artifacts/chronology-pending-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await p.locator('#view-grid').click();await p.goto(base+'timeline.html');await p.waitForFunction(()=>document.querySelectorAll('.timeline-card').length>89);
for(const band of await p.locator('.timeline-band').all()){const got=await band.locator('.timeline-card').evaluateAll(es=>es.map(e=>e.dataset.chronologySlug));assert.deepEqual(got,c.sort(got,x=>x));}
await p.locator('#band-pre1900').scrollIntoViewIfNeeded();await p.screenshot({path:`qa-artifacts/chronology-timeline-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await p.locator('#timeline-query').fill('デザイン');await p.locator('#timeline-reset').click();assert.deepEqual(errors,[]);results.push({width,known:67,pending:22,filters:true,gridList:true,timeline:true,errors});await p.close();
}
const p=await browser.newPage();await p.route('**/entries.json',r=>r.fulfill({status:503,body:'unavailable'}));await p.goto(base+'index.html#catalog');await p.waitForFunction(()=>document.querySelector('#count').textContent.includes('年代の情報を読み込めません'));assert.equal(await p.locator('#items article').count(),0,'Never fall back to unsorted list on missing chronology source');await p.close();
fs.writeFileSync('qa-artifacts/chronology-results.json',JSON.stringify({results,failures:[]},null,2));
}finally{await browser.close();}})().catch(e=>{fs.writeFileSync('qa-artifacts/chronology-failure.json',JSON.stringify({error:String(e),results},null,2));console.error(e);process.exitCode=1;});
