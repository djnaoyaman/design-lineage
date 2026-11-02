// Run in the normal supported Playwright CI environment, not a device-policy bypass.
const { chromium }=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [320,390,1280]){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:true});
  await page.goto('http://127.0.0.1:8793/entries/art-deco.html');
  const nav=page.locator('.chapter-navigation');await nav.scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
  assert.equal(await nav.locator('a[rel=prev]').getAttribute('href'),'esdi-rio.html');
  assert.equal(await nav.locator('a[rel=next]').getAttribute('href'),'streamline-moderne.html');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  fs.mkdirSync('qa-artifacts',{recursive:true});await page.screenshot({path:`qa-artifacts/chapter-navigation-${width}.png`});
  await nav.locator('a[rel=next]').click();await page.waitForURL('**/streamline-moderne.html');
  await page.goBack();await page.waitForURL('**/art-deco.html');
  await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('ArrowLeft');await page.waitForURL('**/esdi-rio.html');
  await page.goBack();await page.waitForURL('**/art-deco.html');
  await page.locator('.chapter-navigation a[rel=next]').focus();await page.keyboard.press('ArrowLeft');assert(page.url().endsWith('/art-deco.html'));
  // BFCache or full reload must both release the repeated-navigation latch.
  await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('ArrowRight');await page.waitForURL('**/streamline-moderne.html');
  await page.goto('http://127.0.0.1:8793/entries/art-deco.html');
  const cdp=await page.context().newCDPSession(page);
  async function stable(){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await page.waitForTimeout(350);}
  async function gesture(locator,direction='left',dy=0,edge=false){
   await locator.scrollIntoViewIfNeeded();await stable();
   const box=await locator.boundingBox();
   const left=Math.max(box.x+8,55),right=Math.min(box.x+box.width-8,width-55);
   const center=(left+right)/2,span=Math.min(120,right-left);
   assert(span>=90,'gesture region wide enough');
   const y=(Math.max(box.y+8,80)+Math.min(box.y+box.height-8,820))/2;
   const startX=edge?20:center+(direction==='right'?-span/2:span/2);
   const endX=edge?180:direction==='vertical'?startX:center+(direction==='right'?span/2:-span/2);
   if(!edge)assert(await locator.evaluate((e,p)=>e.contains(document.elementFromPoint(p.x,p.y)),{x:startX,y}),'start hits intended element');
   if(!edge&&!dy)assert(await locator.evaluate((e,p)=>e.contains(document.elementFromPoint(p.x,p.y)),{x:endX,y}),'end hits intended element');
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:startX,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:endX,y:y+dy}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);
  }
  const heading=()=>page.locator('.chapter-navigation h2');
  await gesture(heading());await page.waitForURL('**/streamline-moderne.html');
  await page.goBack();await page.waitForURL('**/art-deco.html');
  await page.goForward();await page.waitForURL('**/streamline-moderne.html');
  await gesture(page.locator('.chapter-navigation h2'),'right');await page.waitForURL('**/art-deco.html');
  for(const [name,dy,edge]of [['edge',0,true],['diagonal',65,false],['vertical',120,false]]){
   await gesture(heading(),name==='vertical'?'vertical':'left',dy,edge);assert(page.url().endsWith('/art-deco.html'),name);
  }
  await gesture(page.locator('.collected-art img').first());assert(page.url().endsWith('/art-deco.html'),'image swipe');
  await heading().evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await stable();
  await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
  const zoom=await page.evaluate(()=>{const v=visualViewport;return{scale:v.scale,left:v.offsetLeft,top:v.offsetTop,width:v.width,height:v.height};});
  // Visible CSS coordinates after pinch, not the pre-zoom layout viewport.
  const zoomHit=await page.evaluate(()=>{
   const x=Math.min(visualViewport.width-20,130);
   for(let y=80;y<visualViewport.height-30;y+=15){const e=document.elementFromPoint(x,y);if(e?.closest('main')&&!e.closest('a,button,input,details,figure,img,svg,dialog'))return{x,y,tag:e.tagName,inMain:true};}
   return null;
  });
  assert(zoomHit,'zoom pan starts on visible noninteractive main content');
  const zx=zoomHit.x,zy=zoomHit.y;
  fs.writeFileSync(`qa-artifacts/chapter-navigation-pinch-${width}.json`,JSON.stringify({zoom,start:{x:zx,y:zy},end:{x:20,y:zy},zoomHit},null,2));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:zx,y:zy}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:20,y:zy}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);
  assert(page.url().endsWith('/art-deco.html'),'zoomed pan');
  await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
  await page.evaluate(()=>document.documentElement.style.zoom='2');await heading().scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% overflow');
  await page.screenshot({path:`qa-artifacts/chapter-navigation-zoom-${width}.png`});
  await page.close();
 }
 console.log('Browser navigation/layout/history PASS; not physical iOS validation');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
