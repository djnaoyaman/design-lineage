// Local CI origin only. Synthetic browser inputs; no external service or credentials.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base='http://127.0.0.1:8793',key='design-lineage:chapter-swipe-hint:v1';
(async()=>{let browser;const results=[];fs.mkdirSync('qa-artifacts',{recursive:true});try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:true});const page=await context.newPage();
  await page.goto(base+'/entries/art-deco.html');await page.evaluate(()=>document.fonts.ready);
  await page.locator('.reading-entrance').scrollIntoViewIfNeeded();const hint=page.locator('.chapter-swipe-hint');await hint.waitFor({state:'visible'});await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.chapter-swipe-hint')).opacity)>=.95);
  const state=await hint.evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,inner:innerWidth,pointer:getComputedStyle(e).pointerEvents,text:e.textContent,hit:Boolean(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.chapter-swipe-hint'))};});
  assert(state.left>=0&&state.right<=width&&state.bottom<=900);assert.equal(state.pointer,'none');assert(!state.hit);assert(state.text.includes('前後の項目へ'));
  await page.screenshot({path:`qa-artifacts/swipe-hint-${width}.png`});
  await hint.waitFor({state:'detached',timeout:4500});assert.equal(await page.evaluate(k=>sessionStorage.getItem(k),key),'seen');
  await page.reload();await page.locator('.reading-entrance').scrollIntoViewIfNeeded();await page.waitForTimeout(400);assert.equal(await hint.count(),0);
  await page.locator('.chapter-navigation a[rel=next]').click();await page.waitForURL('**/streamline-moderne.html');await page.locator('.reading-entrance').scrollIntoViewIfNeeded();await page.waitForTimeout(400);assert.equal(await hint.count(),0);
  await page.goBack();await page.waitForURL('**/art-deco.html');await page.waitForTimeout(400);assert.equal(await hint.count(),0);results.push({width,...state,sessionAndHistory:true});await context.close();
 }
 const reduced=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,reducedMotion:'reduce'}),p=await reduced.newPage();await p.goto(base+'/entries/art-deco.html');await p.locator('.reading-entrance').scrollIntoViewIfNeeded();await p.locator('.chapter-swipe-hint').waitFor({state:'visible'});assert.equal(await p.locator('.swipe-hint-hand').evaluate(e=>getComputedStyle(e).animationName),'none');await p.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.chapter-swipe-hint')).opacity)>=.95);await p.screenshot({path:'qa-artifacts/swipe-hint-reduced-motion.png'});await p.keyboard.press('Escape');assert.equal(await p.locator('.chapter-swipe-hint').count(),0);await reduced.close();
 const blocked=await browser.newContext({hasTouch:true});await blocked.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Storage unavailable');}}));const b=await blocked.newPage();await b.goto(base+'/entries/art-deco.html');await b.locator('.reading-entrance').scrollIntoViewIfNeeded();await b.waitForTimeout(400);assert.equal(await b.locator('.chapter-swipe-hint').count(),0);await blocked.close();
 const imageContext=await browser.newContext({viewport:{width:390,height:900},hasTouch:true});const im=await imageContext.newPage();await im.goto(base+'/entries/art-deco.html');await im.locator('.reading-entrance').scrollIntoViewIfNeeded();await im.locator('.chapter-swipe-hint').waitFor({state:'visible'});await im.locator('.collected-art img').first().evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await im.locator('.chapter-swipe-hint').waitFor({state:'detached',timeout:2000});await imageContext.close();
 const desktop=await browser.newContext({hasTouch:false}),d=await desktop.newPage();await d.goto(base+'/entries/art-deco.html');await d.locator('.reading-entrance').scrollIntoViewIfNeeded();await d.waitForTimeout(400);assert.equal(await d.locator('.chapter-swipe-hint').count(),0);await desktop.close();
 fs.writeFileSync('qa-artifacts/swipe-hint-results.json',JSON.stringify({results,failures:[]},null,2));
}catch(error){fs.writeFileSync('qa-artifacts/swipe-hint-failure.json',JSON.stringify({error:String(error),results},null,2));throw error;}finally{await browser?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
