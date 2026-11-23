const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{let browser;const results=[];fs.mkdirSync('qa-artifacts',{recursive:true});try{browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:undefined);
for(const width of [320,390,768,1280]){const p=await browser.newPage({viewport:{width,height:900}});await p.goto('http://127.0.0.1:8793/index.html');await p.evaluate(()=>document.fonts.ready);
await p.locator('.hero-bottom .round-link[href="#catalog"]').click();
await p.waitForFunction(()=>location.hash==='#catalog'&&document.querySelectorAll('#items .entry > a[href^="entries/"]').length===90);
assert.equal(await p.locator('details.home-feature-banner').count(),2);assert.equal(await p.locator('details.home-feature-banner[open]').count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));results.push({width,catalogLink:true});
const summary=p.locator('#bauhaus-feature>summary');await summary.evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await p.screenshot({path:`qa-artifacts/home-banners-${width}.png`});await summary.focus();await p.keyboard.press('Enter');assert(await p.locator('#bauhaus-feature').getAttribute('open')!==null);assert(await p.locator('#visual-guide-title').isVisible());await p.screenshot({path:`qa-artifacts/home-feature-open-${width}.png`});await p.keyboard.press('Space');assert.equal(await p.locator('#bauhaus-feature').getAttribute('open'),null);assert(await summary.evaluate(e=>e===document.activeElement),'Keyboard toggle retains focus');
const ax=await summary.ariaSnapshot();assert(ax.includes('バウハウス')&&ax.includes('開く'),'Native summary has meaningful accessible name');results.at(-1).summaryAccessibility=ax;
for(let n=0;n<10;n++)await summary.click();assert.equal(await p.locator('#bauhaus-feature').getAttribute('open'),null,'Even repeated clicks close consistently');
await summary.click();await p.goto('http://127.0.0.1:8793/entries/bauhaus.html');await p.goBack();assert(await summary.isVisible(),'Back navigation restores usable banner');await summary.click();await summary.click();assert(await summary.isVisible(),'Restored banner remains operable');

await p.goto('http://127.0.0.1:8793/index.html#bauhaus');await p.waitForFunction(()=>document.querySelector('#bauhaus-feature').open);await p.locator('#gallery [data-work]').first().check();await p.locator('#gallery [data-work]').nth(1).check();await p.locator('#compare-open').click();assert(await p.locator('#comparison').isVisible());await p.keyboard.press('Escape');assert(!(await p.locator('#comparison').isVisible()));
await p.goto('http://127.0.0.1:8793/index.html#catalog');assert(await p.locator('#bauhaus-feature').getAttribute('open')!==null,'Same-document navigation preserves chosen open state');await p.reload();assert.equal(await p.locator('details.home-feature-banner[open]').count(),0);await p.locator('#rinpa-feature>summary').click();assert(await p.locator('#rinpa-image-title').isVisible());await p.locator('#rinpa-feature img').evaluate(i=>i.decode());await p.locator('#rinpa-feature img').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Expanded Rinpa fits');await p.screenshot({path:`qa-artifacts/home-rinpa-open-${width}.png`});await p.close();}
const edition = await browser.newPage({viewport:{width:390,height:844}});
await edition.goto('http://127.0.0.1:8793/index.html#catalog');
await edition.locator('#items .entry').first().waitFor();
assert.equal(await edition.locator('#view-list').getAttribute('aria-pressed'),'true');
assert.equal(await edition.locator('#items img[src]').count(),0);
await edition.locator('#view-grid').click();
await edition.locator('#query').fill('琳派');
const rinpa = edition.locator('#items [data-chronology-slug="rinpa"]');
await rinpa.locator('[data-catalog-preview]').evaluate(image => image.decode());
await edition.locator('#view-list').click();
assert.equal(await edition.locator('#query').inputValue(),'琳派');
assert.equal(await edition.locator('#view-list').getAttribute('aria-pressed'),'true');
assert.equal(await rinpa.locator('figure').isVisible(),false);
await edition.locator('#view-grid').click();
await rinpa.locator('figure a').click();
await edition.locator('.edition-article-art img').evaluate(image => image.decode());
await edition.goto('http://127.0.0.1:8793/compare.html?a=bauhaus&b=rinpa#visual-comparison');
const highlight = edition.getByRole('button',{name:'着目箇所を表示'});
await highlight.click();
assert.equal(await highlight.getAttribute('aria-pressed'),'true');
assert.equal(await edition.locator('#visual-comparison[data-marked]').count(),1);
assert(await edition.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
await edition.locator('.reading-questions a').nth(1).click();
await edition.waitForFunction(() => document.querySelector('#visual-comparison-title').textContent.includes('器のどこ'));
assert.equal(await edition.locator('.edition-pair img').count(),2);
await edition.locator('.edition-pair img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
assert.match(await edition.locator('.edition-pair figure').first().innerText(),/ロココ/);
assert.equal(await highlight.isVisible(),false);
await edition.locator('#select-b').selectOption('swiss-style');
assert.equal(await edition.locator('.edition-pair img').count(),2);
await edition.locator('.edition-pair figure').nth(1).locator('img').evaluate(image => image.decode());

// Exercise the text fallback independently of which articles have since gained plates.
await edition.route('**/entries.json', async route => {
  const response = await route.fetch();
  const entries = await response.json();
  const swiss = entries.find(entry => entry.slug === 'swiss-style');
  swiss.adopted_images = [];
  swiss.reference_images = [];
  await route.fulfill({response, json: entries});
});
await edition.goto('http://127.0.0.1:8793/compare.html?a=rococo&b=swiss-style');
await edition.locator('.edition-pair .compare-text-example').waitFor();
assert.equal(await edition.locator('.edition-pair img').count(),1);
assert.match(await edition.locator('.edition-pair figure').nth(1).innerText(),/本文に登場する作品/);
await edition.unroute('**/entries.json');
await edition.goto('http://127.0.0.1:8793/entries/rococo.html');
await edition.locator('.chapter-reading-link').click();
await edition.waitForFunction(() => document.querySelector('#select-b')?.value === 'art-deco');
assert.equal(await edition.locator('#select-a').inputValue(),'rococo');
await edition.close();

for (const width of [390, 1280]) {
  const page = await browser.newPage({viewport:{width,height:900}});
  await page.goto('http://127.0.0.1:8793/index.html#selected-works');
  await page.locator('.showcase[data-mode="text"][data-scroll-ready]').waitFor();
  assert.equal(await page.locator('.showcase-work').count(),16);
  const stage = page.locator('.scroll-gallery-stage');
  const rows = page.locator('.showcase-card');
  const titles = [];
  const positions = [];
  for (const index of [3,8]) {
    const row = rows.nth(index);
    const title = await row.locator('strong').textContent();
    await row.evaluate(element => {
      const rect = element.getBoundingClientRect();
      window.scrollBy({top:rect.top+rect.height/2-innerHeight*.42,behavior:'instant'});
    });
    await page.waitForFunction(expected => {
      const showcase = document.querySelector('.showcase');
      return showcase.hasAttribute('data-stage-visible') && showcase.querySelector('.scroll-gallery-caption strong').textContent===expected;
    },title);
    titles.push(title);
    positions.push((await stage.boundingBox()).y);
  }
  assert.notEqual(titles[0],titles[1]);
  assert(Math.abs(positions[0]-positions[1])<2,'Artwork stays at the same screen position');
  await page.getByRole('button',{name:'図版',exact:true}).click();
  assert.equal(await stage.isVisible(),false);
  await page.close();
}
const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),p=await c.newPage();await p.goto('http://127.0.0.1:8793/index.html');await p.locator('#bauhaus-feature>summary').click();assert(await p.locator('#visual-guide-title').isVisible());await c.close();
const r=await browser.newPage({reducedMotion:'reduce'});await r.goto('http://127.0.0.1:8793/index.html');assert.equal(await r.locator('.feature-banner-action>[aria-hidden]').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await r.close();
fs.writeFileSync('qa-artifacts/home-feature-results.json',JSON.stringify({results,failures:[]},null,2));
}catch(e){fs.writeFileSync('qa-artifacts/home-feature-failure.json',JSON.stringify({error:String(e),results},null,2));throw e;}finally{await browser?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
