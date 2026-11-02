const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup({prev=true,next=true}={}) {
 const handlers={main:{},document:{},window:{}};let selection='',time=100,assigned=[];
 class Element {constructor(blocked=false){this.blocked=blocked;this.scrollWidth=this.clientWidth=100;this.parentElement=null;} closest(){return this.blocked;} }
 const body=new Element(),target=new Element(),main=new Element(),control=new Element(true);
 const nav={querySelector:s=>s.includes('prev')?(prev?{href:'prev.html'}:null):(next?{href:'next.html'}:null)};
 const document={body,documentElement:new Element(),activeElement:body,querySelector:s=>s==='.chapter-navigation'?nav:s==='main'?main:null,elementFromPoint:()=>target,addEventListener:(k,f)=>handlers.document[k]=f};
 main.addEventListener=(k,f,o)=>{assert.equal(o.passive,true);handlers.main[k]=f;};
 const window={innerWidth:390,innerHeight:800,scrollY:0,visualViewport:{scale:1},getSelection:()=>({toString:()=>selection}),location:{assign:x=>assigned.push(x)},addEventListener:(k,f)=>handlers.window[k]=f};
 vm.runInNewContext(fs.readFileSync('chapter-navigation.js','utf8'),{document,window,Element,performance:{now:()=>time},getComputedStyle:()=>({overflowX:'visible'})});
 const touch=(x,y=300)=>({identifier:1,clientX:x,clientY:y});
 function swipe(x=250,end=120,options={}){const t=options.target||target;handlers.main.touchstart({target:t,touches:[touch(x)],...options.start});if(options.move)handlers.main.touchmove({touches:[touch(...options.move)]});if(options.afterStart)options.afterStart();handlers.main.touchend({target:t,touches:[],changedTouches:[touch(end,options.endY||300)]});}
 function key(key='ArrowRight',extras={}){let prevented=false;handlers.document.keydown({target:body,key,preventDefault:()=>prevented=true,...extras});return prevented;}
 return{swipe,key,assigned,handlers,document,window,control,target,setSelection:s=>selection=s,setTime:n=>time=n};
}
let count=0;function test(name,fn){fn();count++;console.log('PASS',name);}
test('left swipe next',()=>{let t=setup();t.swipe();assert.deepEqual(t.assigned,['next.html']);});
test('right swipe previous',()=>{let t=setup();t.swipe(120,250);assert.deepEqual(t.assigned,['prev.html']);});
for(const [name,args]of [['left browser edge',[30,220]],['right browser edge',[370,100]],['short motion',[250,210]],['vertical drift',[250,120,{endY:340}]],['diagonal cancelled',[250,120,{move:[200,330]}]],['scroll cancelled',[250,120,{afterStart:()=>{}}]]]){if(name==='scroll cancelled')continue;test(name,()=>{let t=setup();t.swipe(...args);assert.equal(t.assigned.length,0);});}
for(const type of ['control','selection','zoom','scroll','slow','cancelled','multitouch'])test(type,()=>{let t=setup();let o={};if(type==='control')o.target=t.control;if(type==='selection')t.setSelection('text');if(type==='zoom')t.window.visualViewport.scale=2;if(type==='scroll')o.afterStart=()=>t.window.scrollY=30;if(type==='slow')o.afterStart=()=>t.setTime(900);if(type==='cancelled')o.start={defaultPrevented:true};if(type==='multitouch')o.start={touches:[{},{}]};t.swipe(250,120,o);assert.equal(t.assigned.length,0);});
test('nonwrapping first and last',()=>{let t=setup({prev:false});t.swipe(120,250);assert.equal(t.assigned.length,0);t=setup({next:false});t.swipe();assert.equal(t.assigned.length,0);});
test('keyboard normal and history reset',()=>{let t=setup();assert(t.key());t.key();assert.equal(t.assigned.length,1);t.handlers.window.pageshow();t.key('ArrowLeft');assert.deepEqual(t.assigned,['next.html','prev.html']);});
for(const extras of [{altKey:true},{ctrlKey:true},{metaKey:true},{shiftKey:true},{repeat:true},{defaultPrevented:true}])test('keyboard modifier/repeat',()=>{let t=setup();assert.equal(t.key('ArrowRight',extras),false);assert.equal(t.assigned.length,0);});
test('focused control and selection',()=>{let t=setup();t.document.activeElement=t.control;t.key();assert.equal(t.assigned.length,0);t.document.activeElement=t.document.body;t.setSelection('selected');t.key();assert.equal(t.assigned.length,0);});
test('touch cancel',()=>{let t=setup();t.swipe(250,120,{afterStart:()=>t.handlers.main.touchcancel()});assert.equal(t.assigned.length,0);});
test('zoomed keyboard cannot navigate',()=>{let t=setup();t.window.visualViewport.scale=2;t.key();assert.equal(t.assigned.length,0);});
test('overflowed keyboard cannot navigate',()=>{let t=setup();t.document.documentElement.scrollWidth=200;t.key();assert.equal(t.assigned.length,0);});
for(const coordinate of ['offsetLeft','offsetTop'])test('viewport pan '+coordinate,()=>{let t=setup();t.swipe(250,120,{afterStart:()=>t.window.visualViewport[coordinate]=12});assert.equal(t.assigned.length,0);});
test('horizontal document pan',()=>{let t=setup();t.swipe(250,120,{afterStart:()=>t.window.scrollX=12});assert.equal(t.assigned.length,0);});
test('viewport resize cancels',()=>{let t=setup();t.swipe(250,120,{afterStart:()=>t.handlers.window.resize()});assert.equal(t.assigned.length,0);});
console.log(`${count} unit cases passed (mock DOM; not browser/device QA)`);
