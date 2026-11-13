import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const code = read('LarzukSocketRecipe/mod.js');
const headers = ['description','enabled','version','numinputs','input 1','input 2','input 3',
  'output','mod 1','mod 1 min','mod 1 max','*eol','ilvl','lvl','plvl','ladder','min diff','op'];
const existing = [{description:'Unrelated existing recipe', enabled:'1', output:'unrelated', custom:'preserve'}];
function run(table) {
  const calls = [];
  vm.runInNewContext(code, {D2RMM: {
    readTsv(path, options) { assert.equal(options.removeCarriageReturns, true); assert.equal(path, 'global\\\\excel\\\\cubemain.txt'); return structuredClone(table); },
    writeTsv(path, result) { calls.push({path, table: JSON.parse(JSON.stringify(result))}); },
  }});
  return calls;
}
let checks=0;
function test(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
const writes = run({headers, rows:existing});
const out = writes[0].table;
const added = out.rows.slice(existing.length);
test('only cube file written once; existing headers/rows preserved',()=>{
  assert.equal(writes.length,1); assert.equal(writes[0].path,'global\\\\excel\\\\cubemain.txt');
  assert.deepEqual(out.headers,headers); assert.deepEqual(out.rows.slice(0,existing.length),existing);
});
test('16 distinct weapon/armor and quality combinations',()=>{
  assert.equal(added.length,16); assert.equal(new Set(added.map(r=>r['input 1'])).size,16);
  for(const type of ['weap','armo']) for(const q of ['low','nor','hiq','mag','rar','set','uni','crf'])
    assert(added.some(r=>r['input 1']===`${type},${q},nos`));
});
test('exact materials, socketability output guard, original item preservation',()=>{
  for(const row of added) {
    assert.equal(row['input 2'],'r23,qty=1'); assert.equal(row['input 3'],'gem4,qty=1');
    assert.equal(row.numinputs,'3'); assert.equal(row.output,'useitem,sock=6');
    assert.equal(row.enabled,'1'); assert.equal(row['mod 1'],'sock');
    for(const key of ['lvl','plvl','ilvl','ladder','min diff','op']) assert.equal(row[key],'');
  }
});
test('quality-specific ranges',()=>{
  for(const row of added) {
    const q=row['input 1'].split(',')[1];
    assert.equal(row['mod 1 min'], ['low','nor','hiq'].includes(q)?'6':'1');
    assert.equal(row['mod 1 max'], ['low','nor','hiq'].includes(q)?'6':q==='mag'?'2':'1');
  }
});
test('missing required columns fail without writing',()=>{
  for(const col of ['output','input 3','mod 1'])
    assert.throws(()=>run({headers:headers.filter(x=>x!==col),rows:existing}), /columns/);
});
test('malformed table rejected',()=>{
  for(const table of [null,{}, {headers,rows:null}]) assert.throws(()=>run(table), /TSV table/);
});
test('duplicate install rejected',()=>assert.throws(()=>run(out),/already present/));
test('D2RMM host interpolation retains CASC path separators',()=>{
  // D2RMM evaluates a generated script; check the additional interpolation layer.
  const generated = vm.runInNewContext('`' + code.replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`');
  const paths=[];
  vm.runInNewContext(generated,{D2RMM:{
    readTsv(path){paths.push(path);return {headers,rows:[]};},
    writeTsv(path){paths.push(path);}
  }});
  assert.deepEqual(paths, [String.raw`global\excel\cubemain.txt`,String.raw`global\excel\cubemain.txt`]);
});
test('optional end marker absent is supported',()=>{
  const result=run({headers:headers.filter(x=>x!=='*eol'),rows:existing})[0].table;
  assert.equal(result.rows.length,17);
  for(const r of result.rows.slice(1)) assert(!Object.hasOwn(r,'*eol'));
});
test('metadata valid and no bundled assets',()=>{
  const m=JSON.parse(read('LarzukSocketRecipe/mod.json'));
  assert.equal(m.version,'1.0.0'); assert.equal(m.name,'Larzuk Socket Recipe');
  assert.equal(m.author,'빵길빵길'); assert.equal(Object.hasOwn(m,'config'),false);
});
const files=['LarzukSocketRecipe/mod.js','LarzukSocketRecipe/mod.json','tools/verify-larzuk.mjs','tools/build-larzuk.py'];
const inputs=Object.fromEntries(files.map(p=>[p,createHash('sha256').update(read(p)).digest('hex')]));
fs.writeFileSync(new URL('LarzukSocketRecipe/docs/LOCAL_VALIDATION.json',root),JSON.stringify({status:'PASS',checks,scope:'Mocked D2RMM table operations only; no game engine execution.',inputs},null,2)+'\n');
console.log(`${checks} checks passed; real-game tests pending.`);
