const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function setup(o={}){
 let stored=o.seen?'seen':null,selection='',modal=false,clock=0,observer,append=0;const timers=new Map(),events={};let timerID=0;
 const image={};const target={getBoundingClientRect:()=>({top:120,bottom:300})};const nodes=[];
 const document={visibilityState:'visible',activeElement:{matches:()=>false},querySelector:s=>s==='.chapter-navigation'?{}:modal?{}:null,querySelectorAll:s=>s==='.collected-art img'?[image]:[target],createElement:()=>({attrs:{},setAttribute(k,v){this.attrs[k]=v;},remove(){this.removed=true;}}),body:{append:e=>{nodes.push(e);append++;}},addEventListener:(k,f)=>events[k]=f,removeEventListener:k=>delete events[k]};
 const viewport={scale:o.zoomed?2:1,addEventListener:(k,f)=>events['viewport-'+k]=f};
 const window={visualViewport:viewport,matchMedia:()=>({matches:false}),getSelection:()=>({toString:()=>selection}),addEventListener:(k,f)=>events[k]=f};
 const context={document,window,navigator:{maxTouchPoints:o.noTouch?0:1},innerHeight:800,sessionStorage:{getItem:()=>{if(o.noStorage)throw Error();return stored;},setItem:(k,v)=>{if(o.noWrite)throw Error();stored=v;}},IntersectionObserver:class {constructor(cb){this.cb=cb;observer=this;}observe(){}disconnect(){this.disconnected=true;}},setTimeout:(f,ms)=>{timers.set(++timerID,{f,at:clock+ms});return timerID;},clearTimeout:id=>timers.delete(id)};
 if(o.noObserver)delete context.IntersectionObserver;
 vm.runInNewContext(fs.readFileSync('chapter-swipe-hint.js','utf8'),context);
 function advance(ms){clock+=ms;for(const[id,t]of[...timers])if(t.at<=clock){timers.delete(id);t.f();}}
 return{viewport,imageEnter:()=>observer?.cb([{target:image,isIntersecting:true}]),enter:()=>observer?.cb([{target,isIntersecting:true}]),leave:()=>observer?.cb([{target,isIntersecting:false}]),advance,nodes,events,get count(){return append},get stored(){return stored},get observer(){return observer},setStored:v=>stored=v,select:()=>selection='selected',modal:()=>modal=true};
}
let cases=0;function test(n,f){f();cases++;console.log('PASS',n);}
for(const option of ['noTouch','seen','noStorage','noObserver'])test(option,()=>{const t=setup({[option]:true});assert(!t.observer);assert.equal(t.count,0);});
test('observer first visible and timer',()=>{const t=setup();t.enter();t.advance(179);assert.equal(t.count,0);t.advance(1);assert.equal(t.count,1);assert.equal(t.stored,'seen');assert.equal(t.nodes[0].attrs.role,'status');assert(t.nodes[0].innerHTML.includes('<svg'));t.advance(3599);assert(!t.nodes[0].removed);t.advance(1);assert(t.nodes[0].removed);t.enter();t.advance(1000);assert.equal(t.count,1);});
test('leaving eligible text hides',()=>{const t=setup();t.enter();t.advance(180);t.leave();assert(t.nodes[0].removed);});
test('pointer interaction dismisses',()=>{const t=setup();t.enter();t.advance(180);t.events.pointerdown();assert(t.nodes[0].removed);});
test('selection blocks initial hint',()=>{const t=setup();t.select();t.enter();t.advance(180);assert.equal(t.count,0);});
test('modal blocks hint',()=>{const t=setup();t.modal();t.enter();t.advance(180);assert.equal(t.count,0);});
test('storage writes unavailable skip, never nag',()=>{const t=setup({noWrite:true});t.enter();t.advance(180);assert.equal(t.count,0);assert(t.observer.disconnected);});
test('another page already showed it before history restore',()=>{const t=setup();t.enter();t.events.pagehide();t.setStored('seen');t.events.pageshow();t.advance(180);assert.equal(t.count,0);assert(t.observer.disconnected);});
test('pagehide cancels pending and pageshow can resume',()=>{const t=setup();t.enter();t.events.pagehide();t.advance(200);assert.equal(t.count,0);t.events.pageshow();t.advance(180);assert.equal(t.count,1);});
test('zoom before hint preserves unused session',()=>{const t=setup({zoomed:true});t.enter();t.advance(180);assert.equal(t.count,0);assert.equal(t.stored,null);t.viewport.scale=1;t.events['viewport-resize']();t.advance(180);assert.equal(t.count,1);});
test('zoom after hint dismisses',()=>{const t=setup();t.enter();t.advance(180);t.viewport.scale=2;t.events['viewport-resize']();assert(t.nodes[0].removed);});
test('visible image prevents hint or dismisses existing hint',()=>{const t=setup();t.imageEnter();t.enter();t.advance(180);assert.equal(t.count,0);const v=setup();v.enter();v.advance(180);v.imageEnter();assert(v.nodes[0].removed);});
console.log(`${cases} hint lifecycle cases passed (mock DOM)`);
