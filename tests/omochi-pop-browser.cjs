const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.SITE_BASE||'http://127.0.0.1:8793/';
const out=process.env.OMOCHI_QA_DIR||'qa-artifacts/omochi-pop';
fs.mkdirSync(out,{recursive:true});
(async()=>{let browser;const results=[];try{
 browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:undefined);
 for(const width of [320,390,768,1280,2560]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'omochi-pop.html',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('h1').innerText(),'OMOCHI\nPOP');
  assert.equal(await page.locator('.omochi-work').count(),7);
  for(const im of await page.locator('main img').all()){await im.scrollIntoViewIfNeeded();await im.evaluate(i=>i.decode());}
  assert(await page.locator('main img').evaluateAll(xs=>xs.every(x=>x.naturalWidth>0&&x.complete)));
  for(const detail of await page.locator('main details').all())await detail.evaluate(e=>e.open=true);
  for(const zoom of [1,2]){
   await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
   const geometry=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));
   assert(geometry.width<=geometry.viewport+1,`No overflow at ${width}px / ${zoom}x: ${JSON.stringify(geometry)}`);
  }
  await page.evaluate(()=>document.documentElement.style.zoom='1');
  await page.screenshot({path:`${out}/article-${width}.png`,fullPage:true});
  await page.locator('.omochi-nav a[href="#works"]').click();
  assert.equal(new URL(page.url()).hash,'#works');
  const detail=page.locator('.omochi-work details').first();
  await detail.evaluate(e=>e.open=false);await detail.locator('summary').focus();await page.keyboard.press('Enter');assert(await detail.evaluate(e=>e.open));await page.keyboard.press('Enter');assert(!(await detail.evaluate(e=>e.open)));
  await page.goto(base+'index.html');
  await page.waitForFunction(()=>document.querySelectorAll('#items .entry').length===89);
  assert.equal(await page.locator('#omochi-pop-feature').count(),1);
  assert.equal(await page.locator('details.home-feature-banner').count(),2,'Existing feature behavior retained');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#omochi-pop-feature').screenshot({path:`${out}/home-card-${width}.png`});
  await page.locator('#omochi-pop-feature>a').click();assert(page.url().endsWith('/omochi-pop.html'));
  await page.goBack();assert(await page.locator('#omochi-pop-feature>a').isVisible());
  await page.goForward();assert(await page.locator('#omochi-title').isVisible());
  await page.goto(base+'compiler.html');assert.equal(await page.locator('a[href="omochi-pop.html"]').count(),1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);results.push({width,status:'passed'});await page.close();
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),p=await nojs.newPage();
 await p.goto(base+'compiler.html');await p.locator('a[href="omochi-pop.html"]').click();assert(await p.locator('#omochi-title').isVisible());assert.equal(await p.locator('.omochi-work').count(),7);assert(await p.locator('.omochi-cta').isVisible());await nojs.close();
 fs.writeFileSync(`${out}/results.json`,JSON.stringify({results,noJavaScript:'passed'},null,2));console.log('PASS OMOCHI POP: 5 widths, 2x layout zoom, image decoding, details keyboard, homepage links, back/forward, no-JS compiler route');
}finally{await browser?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
