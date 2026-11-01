const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const entries=JSON.parse(fs.readFileSync('entries.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('catalog.json','utf8'));
assert.equal(new Set(entries.map(e=>e.slug)).size,entries.length);
assert.equal(catalog.length,88);
for(const e of entries){assert(catalog.some(c=>c.name===e.name),e.name);assert(fs.existsSync(`entries/${e.slug}.html`));for(const im of [...(e.adopted_images||[]),...(e.reference_images||[])])if(im.local_file)assert(fs.existsSync(im.local_file),im.local_file);}
fs.mkdirSync('qa-artifacts',{recursive:true});
let browser;
(async()=>{browser=await chromium.launch({headless:true});const results=[],failures=[];
for(const width of [320,390,1280]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const slug of entries.map(e=>e.slug)){
  console.log(`Checking ${slug} at ${width}px`);
  await page.goto(`http://127.0.0.1:8793/entries/${slug}.html`,{waitUntil:'load'});
  await page.locator('footer').scrollIntoViewIfNeeded();
  const r=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,cards:[...document.querySelectorAll('.representative>div')].map(e=>({body:e.getBoundingClientRect().width,card:e.parentElement.getBoundingClientRect().width})),footer:getComputedStyle(document.querySelector('footer .footer-brand img')).filter,header:getComputedStyle(document.querySelector('header .brand img')).filter}));
  if(r.overflow||r.cards.some(x=>x.body<x.card*.6)||r.footer!=='invert(1)'||r.header!=='none')failures.push({slug,width,...r});
  if(['hideki-nakajima','vienna-secession','art-nouveau'].includes(slug)||entries.find(e=>e.slug===slug).adopted_images?.length){
   for(const im of await page.locator('.collected-art img').all()){await im.scrollIntoViewIfNeeded();await im.evaluate(i=>i.decode());}
   // naturalWidth on a srcset image is density-corrected; decode currentSrc without srcset to measure actual source pixels.
   const images=await page.locator('.collected-art img').evaluateAll(async xs=>Promise.all(xs.map(async i=>{const raw=new Image();raw.src=i.currentSrc;await raw.decode();return {ok:i.complete&&i.naturalWidth>0,src:i.getAttribute('src'),currentSrc:i.currentSrc,width:i.getBoundingClientRect().width,natural:raw.naturalWidth,densityCorrectedNatural:i.naturalWidth};})));
   fs.writeFileSync(`qa-artifacts/${slug}-images-${width}.json`,JSON.stringify(images,null,2));
   assert(images.every(i=>i.ok),`${slug} images`);
   if(["punk-diy", "new-bauhaus-chicago", "vkhutemas", "black-mountain-college", "psychedelic-art", "streamline-moderne", "polish-poster-school", "surrealism", "jugendstil", "scandinavian-modern", "brutalism", "critical-regionalism", "mid-century-modern", "radical-design", "memphis", "new-wave-typography", "supergraphics"].includes(slug)){assert.equal(images.length,entries.find(e=>e.slug===slug).adopted_images.length);assert(images.every(i=>i.width<=i.natural),'New article no image upsampling');}
   if(slug==='hideki-nakajima'){assert.equal(images.length,9);assert(images.every(i=>i.width<=i.natural), 'No image upsampling');}
   if(slug==='art-nouveau'){
    // Keep title word units intact at normal scale and 200% CSS layout zoom.
    for(const zoom of [1,2]){
     await page.evaluate(z=>{document.documentElement.style.zoom=String(z);window.scrollTo({top:0,behavior:'instant'});},zoom);
     const title=await page.locator('.study-title h1').evaluate(h=>({text:h.textContent,box:{left:h.getBoundingClientRect().left,right:h.getBoundingClientRect().right},words:[...h.querySelectorAll('.title-word')].map(w=>{const r=document.createRange();r.selectNodeContents(w);return {text:w.textContent,lines:r.getClientRects().length,left:w.getBoundingClientRect().left,right:w.getBoundingClientRect().right};})}));
     assert.equal(title.text,'アール・ヌーヴォー');assert.equal(title.words.length,2);assert(title.words.every(w=>w.lines===1&&w.left>=0&&w.right<=width+1),'Intact Art Nouveau title words at '+zoom+'x');
     fs.writeFileSync(`qa-artifacts/art-nouveau-title-${width}-${zoom}x.json`,JSON.stringify(title,null,2));
     await page.screenshot({path:`qa-artifacts/art-nouveau-title-${width}-${zoom}x.png`});
    }
    await page.evaluate(()=>document.documentElement.style.zoom='');

    await page.locator('.article-image-index summary').click();assert.equal(await page.locator('.article-image-index a').count(),entries.find(e=>e.slug===slug).adopted_images.length);await page.locator('.article-image-index a').first().click();await page.locator('.article-image-index summary').click();
    const expected=entries.find(e=>e.slug===slug).adopted_images.length;assert.equal(images.length,expected);assert(images.every(i=>i.width<=i.natural),'Art Nouveau no image upsampling');
    for(const [i,figure] of (await page.locator('.collected-art').all()).entries()){await figure.locator('img').scrollIntoViewIfNeeded();await page.screenshot({path:`qa-artifacts/art-nouveau-work-${i+1}-${width}.png`});}
    await page.locator('.article-index a[href="#deeper-story"]').click();assert(await page.locator('#deeper-story').isVisible());await page.waitForFunction(()=>{const y=document.querySelector('#deeper-story').getBoundingClientRect().top;return y>=-2&&y<100},null,{timeout:5000});const anchorTop=await page.locator('#deeper-story').evaluate(e=>e.getBoundingClientRect().top);assert(anchorTop>=-2&&anchorTop<100,'Anchor lands below page edge');await page.screenshot({path:`qa-artifacts/art-nouveau-story-${width}.png`});
    await page.locator('#article-glossary summary').click();assert(await page.locator('#article-glossary').getAttribute('open')!==null);await page.locator('#article-glossary summary').click();
    await page.locator('main details').evaluateAll(ds=>ds.forEach(d=>d.open=true));
    await page.locator('#article-glossary').scrollIntoViewIfNeeded();assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'Expanded Art Nouveau has no overflow');
    const credits=await page.locator('.collected-art .credit').evaluateAll(xs=>xs.map(x=>({left:x.getBoundingClientRect().left,right:x.getBoundingClientRect().right})));assert(credits.every(x=>x.left>=0&&x.right<=width+1),'Credits fit viewport');
    await page.screenshot({path:`qa-artifacts/art-nouveau-expanded-glossary-${width}.png`});
    await page.locator('main details').evaluateAll(ds=>ds.forEach(d=>d.open=false));
    await page.locator('.regional-notes article').first().scrollIntoViewIfNeeded();await page.screenshot({path:`qa-artifacts/art-nouveau-regions-${width}.png`});
    await page.locator('#article-timeline h2').scrollIntoViewIfNeeded();await page.screenshot({path:`qa-artifacts/art-nouveau-timeline-${width}.png`});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   }
   if(slug==='vienna-secession')await page.locator('#representative-works').scrollIntoViewIfNeeded();
   await page.screenshot({path:`qa-artifacts/${slug}-${width}.png`});
  }
  if(["punk-diy", "new-bauhaus-chicago", "vkhutemas", "black-mountain-college", "psychedelic-art", "streamline-moderne", "polish-poster-school", "surrealism", "jugendstil", "scandinavian-modern", "brutalism", "critical-regionalism", "mid-century-modern", "radical-design", "memphis", "new-wave-typography", "supergraphics"].includes(slug)){await page.locator('main details').evaluateAll(ds=>ds.forEach(d=>d.open=true));assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),`${slug} expanded overflow`);}
  results.push({slug,width,...r});
 }
 await page.goto('http://127.0.0.1:8793/',{waitUntil:'networkidle'});await page.locator('#query').fill('中島');assert.equal(await page.locator('#items .entry').count(),1);await page.locator('#reset').click();assert.equal(await page.locator('#items .entry').count(),88);await page.locator('footer').scrollIntoViewIfNeeded();await page.screenshot({path:`qa-artifacts/footer-${width}.png`});
 await page.goto('http://127.0.0.1:8793/compare.html?a=hideki-nakajima&b=vienna-secession',{waitUntil:'networkidle'});assert((await page.locator('#compare-result').innerText()).includes('中島'));assert(!(await page.locator('#compare-result').innerText()).includes('undefined'));
 await page.locator('#select-b').selectOption('hideki-nakajima');assert((await page.locator('#compare-status').innerText()).includes('同じ項目'));
 await page.goto('http://127.0.0.1:8793/compare.html?a=art-nouveau&b=art-deco',{waitUntil:'networkidle'});const comparison=await page.locator('#compare-result').innerText();assert(comparison.includes('ジスモンダ'));assert(comparison.includes('Gismonda'));assert(!comparison.includes('undefined'));
 if(errors.length)failures.push({width,errors});await page.close();
}
await browser.close();fs.writeFileSync('qa-artifacts/results.json',JSON.stringify({entries:entries.length,catalog:catalog.length,cases:results.length,failures,results},null,2));assert.equal(failures.length,0,JSON.stringify(failures));console.log(`PASS: ${results.length} article viewport cases + catalog/compare flows`);
})().catch(e=>{fs.writeFileSync('qa-artifacts/failure.json',JSON.stringify({message:String(e),stack:e.stack},null,2));console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close()});
