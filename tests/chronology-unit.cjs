const assert=require('node:assert/strict'),fs=require('node:fs'),c=require('../chronology.js');
const entries=JSON.parse(fs.readFileSync('entries.json')),catalog=JSON.parse(fs.readFileSync('catalog.json')),timeline=require('../timeline.js');
assert.equal(Object.keys(c.records).length,entries.length);
for(const e of entries){const r=c.records[e.slug];assert(r);assert.equal(r.source_period,e.period);assert.equal(r.catalog_rank,catalog.findIndex(x=>x.name===e.name));assert(r.sort_year===null||Number.isInteger(r.sort_year));assert(r.basis);}
const sorted=c.sort(entries),slugs=sorted.map(x=>x.slug);
assert.deepEqual(catalog.map(x=>x.name),sorted.map(x=>x.name),'Static chapter and work indexes follow the same chronology as the catalogue');
assert.deepEqual(slugs.slice(0,6),['rinpa','ukiyoe','rococo','neoclassicism','ito-jakuchu','pre-raphaelites']);
assert.equal(c.key('santiniketan'),1901);assert.equal(c.key('hideki-nakajima'),1990);assert.equal(c.key('ito-jakuchu'),1750);assert.equal(c.key('sosaku-hanga'),1904);
for(const slug of ['typography-typesetting','pixel-art','kinetic-typography','grid-systems'])assert.equal(c.key(slug),null);
assert.equal(sorted.filter(x=>c.key(x.slug)===null).length,22);
assert.equal(sorted.filter(x=>c.key(x.slug)!==null).length,68);
assert.deepEqual(c.sort([...entries].reverse()).map(x=>x.slug),slugs,'Tie order stable independently of input array');
for(const group of timeline.groupEntries(timeline.normalizeEntries(entries),'').groups)assert.deepEqual(group.entries.map(x=>x.slug),c.sort(group.entries).map(x=>x.slug));
console.log('PASS chronology: all 90 metadata sources; 68 dated / 22 pending; stable ties; shared timeline ordering; no example-year origin inference');
