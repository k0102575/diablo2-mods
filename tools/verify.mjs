import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {buildEditions} from './package-editions.mjs';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p,root),'utf8');
const editions=Object.fromEntries(buildEditions().map(e=>[e.edition,e]));
const keys=['doubleChance','singleChance','returnChance','missChance'];
const prefixes=['low','mid','high'];
const flatFields = fields=>fields.flatMap(field=>field.type==='section'?flatFields(field.children):[field]);
let activeEdition='tiered';
let metadata=editions.tiered.metadata;
let defaults=Object.fromEntries(flatFields(metadata.config).map(c=>[c.id,c.defaultValue]));
function activate(edition) {
 activeEdition=edition; metadata=editions[edition].metadata;
 defaults=Object.fromEntries(flatFields(metadata.config).map(c=>[c.id,c.defaultValue]));
}
function testConfig(overrides, raw) {
 const result={...defaults,...overrides};
 // Legacy regression cases explicitly apply the same values to all three groups.
 // raw=true is used to check stale IDs and missing group fields without this fixture convenience.
 if(activeEdition==='tiered'&&!raw) for(const key of keys) if(Object.hasOwn(overrides,key)) {
  for(const prefix of prefixes) result[prefix+key[0].toUpperCase()+key.slice(1)]=overrides[key];
 }
 return result;
}
const schema=JSON.parse(read('ProbabilisticRuneDowngrade/research/schema.json'));
function fixture() {
  const tables=structuredClone(schema);
  const make=(t,v)=>Object.assign(Object.fromEntries(t.headers.map(k=>[k,''])),v);
  const misc=tables.misc;
  misc.rows=[make(misc,{code:'isc',stackable:'0'})];
  for(let i=1;i<=33;i++) misc.rows.push(make(misc,{code:'r'+String(i).padStart(2,'0'),type:'rune',stackable:'0',namestr:'r'+String(i).padStart(2,'0'),invfile:'invr'+i,flippyfile:'flprun',alternategfx:'r'+String(i).padStart(2,'0')}));
  tables.weapons.rows=[make(tables.weapons,{code:'hdm',type:'hamm',quest:'4',invfile:'invhmr',flippyfile:'flphmr',alternategfx:'whm'})];
  tables.cubemain.rows=[make(tables.cubemain,{description:'Other mod: rune + scroll',enabled:'1',numinputs:'2','input 1':'r24','input 2':'isc',output:'r23'})];
  tables.itemstatcost.rows=Array.from({length:368},(_,i)=>make(tables.itemstatcost,{Stat:'synthetic_'+i,'*ID':String(i)}));
  return tables;
}
function run(overrides={},change=()=>{},actual=false,modelOverride=undefined,raw=false) {
  const tables=fixture(), writes=[], copies=[]; let next=50000;
  if(actual) for(const k of Object.keys(tables)) {
    const lines=fs.readFileSync('/tmp/rg-'+k+'.txt','utf8').replace(/\r/g,'').trimEnd().split('\n');
    const headers=lines.shift().split('\t');
    tables[k]={headers,rows:lines.map(l=>Object.fromEntries(l.split('\t').map((v,i)=>[headers[i],v])))};
  }
  let hd=actual ? JSON.parse(fs.readFileSync('/tmp/rg-items.json','utf8')) : Array.from({length:33},(_,i)=>({['r'+String(i+1).padStart(2,'0')]:{asset:'rune/test_'+(i+1)}})), strings=Array.from({length:33},(_,i)=>({Key:'r'+String(i+1).padStart(2,'0'),enUS:i===23?'Ist Rune':'Rune '+(i+1),koKR:i===23?'이스트룬':'룬 '+(i+1)}));
  hd.push({hdm:{asset:'hammer/test_malus'}});
  change(tables);
  const originalStatRows=JSON.stringify(tables.itemstatcost.rows);
  const originalHD=JSON.stringify(hd), originalMisc=JSON.stringify(tables.misc.rows);
  const originalWeapons=JSON.stringify(tables.weapons), originalCube=JSON.stringify(tables.cubemain.rows);
  const models = Object.fromEntries(hd.map(entry=>{
    const asset=Object.values(entry)[0].asset;
    return ['hd\\items\\misc\\'+asset+'.json', {entities:[{type:'Entity',name:asset}]}];
  }));
  models['hd\\items\\weapon\\hammer/test_malus.json']={entities:[{type:'Entity',name:'malus-ground-model'}]};
  const api={getVersion:()=>1.9,getNextStringID:()=>next++,readTsv:p=>{const k=p.split('\\').at(-1).replace('.txt','');return tables[k];},writeTsv:(p,t)=>writes.push([p,t]),readJson:p=>{if(p==='hd\\items\\items.json')return hd;if(p.startsWith('hd\\items\\misc\\')||p.startsWith('hd\\items\\weapon\\')){if(modelOverride===null)throw Error('Missing model');return modelOverride===undefined?models[p]:modelOverride;}return strings;},copyFile:(src,dst,overwrite)=>copies.push({src,dst,overwrite}),writeJson:(p,t)=>writes.push([p,t])};
  let error;
  const appliedConfig=testConfig(overrides,raw);
  try{vm.runInNewContext(editions[activeEdition].code,{config:appliedConfig,D2RMM:api,console:{log(){}}},{timeout:5000});}catch(e){error=e;}
  return {tables,writes,copies,error,hd,strings,originalStatRows,originalHD,originalMisc,models,originalWeapons,originalCube,appliedConfig};
}
const copiesAsPlain = value=>JSON.parse(JSON.stringify(value));
let checks=0;
function verify(overrides={},actual=false,change=()=>{}) {
 const result=run(overrides,change,actual); assert.equal(result.error,undefined,String(result.error));
 const {tables:t,writes,hd,strings}=result;
 const rows=t.cubemain.rows.filter(r=>r.description.startsWith('PRDG:'));
 const ranks=32;
 assert.ok(!metadata.config.some(c=>c.id==='istOnly'));
 assert.equal(metadata.name,'Probabilistic Rune Downgrade ('+(activeEdition==='tiered'?'Tiered':'Standard')+')');
 assert.equal(metadata.author,'빵길빵길');
 assert.equal(metadata.version,'0.3.0-alpha.1');
 assert.equal(rows.length,ranks*101);assert.equal(writes.length,40);
 assert.equal(JSON.stringify(hd.slice(0,-33)),result.originalHD);
 assert.equal(JSON.stringify(t.misc.rows.slice(0,-33)),result.originalMisc);
 assert.deepEqual(copiesAsPlain(result.copies),[{src:'hd\\global\\ui\\items\\misc\\rune',dst:'hd\\global\\ui\\items\\misc\\rune',overwrite:true},{src:'hd\\global\\ui\\items\\misc\\prg',dst:'hd\\global\\ui\\items\\misc\\prg',overwrite:true}]);
 assert.equal(JSON.stringify(t.weapons),result.originalWeapons);
 assert.equal(JSON.stringify(t.cubemain.rows.filter(r=>!r.description.startsWith('PRDG:'))),result.originalCube);
 const hammer=t.misc.rows.find(r=>r.code==='prh');
 assert.ok(hammer);
 for(const [k,v] of Object.entries({type:'prgh',stackable:'0',quest:'0',questdiffcheck:'0',cost:'1',useable:'0',invwidth:'1',invheight:'1',GheedMin:'1',GheedMax:'1',GheedMagicMin:'0',GheedMagicMax:'0',GheedMagicLvl:'255',PermStoreItem:'1',multibuy:'0',NightmareUpgrade:'xxx',HellUpgrade:'xxx'})) assert.equal(hammer[k],v,k);
 assert.ok(Object.keys(hammer).every(k=>t.misc.headers.includes(k)));
 assert.ok(Object.entries(hammer).filter(([k])=>/Min$|Max$/.test(k)&&!k.startsWith('Gheed')).every(([,v])=>v===''||v==='0'));
 const material=t.itemtypes.rows.find(r=>r.Code==='prgh');
 assert.equal(material.StorePage,'misc');assert.equal(material.Normal,'1');assert.equal(material.Body,'0');
 assert.equal(material.Equiv1,'misc');assert.equal(material.TreasureClass,'0');
 assert.equal(hd.find(r=>r.prh).prh.asset,'prg/dismantling_hammer');
 const hammerModel=writes.find(([p])=>p==='hd\\items\\misc\\prg/dismantling_hammer.json');
 assert.deepEqual(copiesAsPlain(hammerModel[1]),result.models['hd\\items\\weapon\\hammer/test_malus.json']);
 assert.equal(strings.find(r=>r.Key==='PRGHammer').enUS,'Rune Dismantling Hammer');
 assert.equal(strings.find(r=>r.Key==='PRGHammer').koKR,'룬 분해 망치');
 for(const [key,value] of Object.entries(strings.find(r=>r.Key==='PRGHammer'))) {
  if(key!=='Key'&&key!=='id') assert.ok(!value.includes('ÿc'), 'Hammer name must use the default color: '+key);
 }
 const rollIndex=t.itemstatcost.rows.findIndex(r=>r.Stat==='prg_roll');
 assert.equal(rollIndex,t.itemstatcost.rows.length-1);
 assert.equal(JSON.stringify(t.itemstatcost.rows.slice(0,rollIndex)),result.originalStatRows);
 assert.ok(rows.filter(r=>r.numinputs==='1').every(r=>r.param===String(rollIndex)));
 assert.ok(writes.filter(([p])=>p.endsWith('.txt')).every(([p])=>p.startsWith('global\\excel\\') && !p.includes('base')));
 assert.ok(!metadata.config.some(c=>c.id==='tablePath')); 
 for(const start of rows.filter(r=>r.numinputs==='2')) {
  const inputRank=Number(start['input 1'].slice(1));
  const prefix=activeEdition==='standard'?'':inputRank<=20?'low':inputRank<=25?'mid':'high';
  const chances=keys.map(k=>result.appliedConfig[prefix?prefix+k[0].toUpperCase()+k.slice(1):k]);
  assert.equal(start['input 2'],'prh');assert.equal(start['mod 1 min'],'1');assert.equal(start['mod 1 max'],'100');
  const pending=start.output.split(',')[0]; assert.equal(pending.length,3); assert.match(pending,/^pg[0-9a-v]$/);
  const item=t.misc.rows.find(r=>r.code===pending); assert.equal(item.compactsave,'0');assert.equal(item.type,'prgp');assert.equal(item.stackable,'0');assert.equal(item.type2,'');
  if(t.misc.headers.includes('auto prefix')) assert.equal(item['auto prefix'],'');
  else assert.ok(!Object.hasOwn(item,'auto prefix'));
  for(const field of ['normcode','ubercode','ultracode']) {
   if(t.misc.headers.includes(field)) assert.equal(item[field],'');
   else assert.ok(!Object.hasOwn(item,field));
  }
  assert.ok(Object.keys(item).every(k=>t.misc.headers.includes(k)));
  const inputRune=t.misc.rows.find(r=>r.code===start['input 1']);
  for(const field of ['invfile','flippyfile','alternategfx']) assert.equal(item[field],inputRune[field]);
  const rank=Number(start['input 1'].slice(1));
  const asset='rune/prg_pending_'+String(rank).padStart(2,'0');
  const sourceHD=hd.find(x=>x[start['input 1']])[start['input 1']];
  assert.deepEqual(copiesAsPlain(hd.find(x=>x[pending])[pending]),{...copiesAsPlain(sourceHD),asset});
  const modelWrite=writes.find(([path])=>path==='hd\\items\\misc\\'+asset+'.json');
  assert.ok(modelWrite,'HD ground model alias must be written');
  assert.deepEqual(copiesAsPlain(modelWrite[1]),result.models['hd\\items\\misc\\'+sourceHD.asset+'.json']);
  for(const suffix of ['.sprite','.lowend.sprite']) {
    const sprite=new URL('ProbabilisticRuneDowngrade/hd/global/ui/items/misc/'+asset+suffix,root);
    assert.ok(fs.existsSync(sprite),'Pending sprite must be bundled: '+sprite);
  }
  const sourceName=strings.find(x=>x.Key===inputRune.namestr);
  const pendingName=strings.find(x=>x.Key===item.namestr);
  assert.equal(pendingName.koKR,sourceName.koKR+' — 분해 대기');
  assert.equal(pendingName.enUS,sourceName.enUS+' — Pending Downgrade');
  const matches=rows.filter(r=>r['input 1']===pending);assert.equal(matches.length,100);
  const counts=[0,0,0,0], input=start['input 1'], lower='r'+String(Number(input.slice(1))-1).padStart(2,'0');
  for(let roll=1;roll<=100;roll++) {
   const m=matches.filter(r=>r.op==='18' && Number(r.value)===roll);assert.equal(m.length,1);
   const r=m[0],outcome=r.output===lower?(r['output b']?0:1):r.output===input?2:3;
   assert.equal(r.output,outcome===3?'prh':outcome===2?input:lower);
   assert.equal(r['output b'],outcome===0?lower:'');assert.equal(r['mod 1'],'');counts[outcome]++;
  }
  assert.deepEqual(counts,chances);
 }
 checks++;
}
const checksByEdition={};
for(const edition of ['tiered','standard']) {
 activate(edition);
 const before=checks;
verify();verify({istOnly:true}); // stale saved checkbox must not restrict ranks
// Exactly one zero-probability result, with all other results positive.
// verify() exhausts rolls 1..100 for every rank and checks exact output counts.
for(const chances of [[0,34,33,33],[33,0,34,33],[33,33,0,34],[34,33,33,0]]) {
 verify(Object.fromEntries(['doubleChance','singleChance','returnChance','missChance'].map((key,i)=>[key,chances[i]])));
}
// User's installation has no misc "auto prefix" column. Remove it from
// headers AND rows so the fixture matches what the TSV reader actually returns.
function withoutAutoPrefix(t) {
 t.misc.headers=t.misc.headers.filter(h=>h!=='auto prefix');
 for(const row of t.misc.rows) delete row['auto prefix'];
}
verify({doubleChance:100,singleChance:0,returnChance:0,missChance:0},false,withoutAutoPrefix);
verify({istOnly:false},false,withoutAutoPrefix);
// Related item-upgrade columns must not be required by misc schemas.
function withoutMiscColumns(t,columns) {
 t.misc.headers=t.misc.headers.filter(h=>!columns.includes(h));
 for(const row of t.misc.rows) for(const field of columns) delete row[field];
}
for(const field of ['normcode','ubercode','ultracode']) {
 verify({},false,t=>withoutMiscColumns(t,[field]));
}
const withoutOptionalMisc=t=>withoutMiscColumns(t,['auto prefix','normcode','ubercode','ultracode']);
verify({doubleChance:100,singleChance:0,returnChance:0,missChance:0},false,withoutOptionalMisc);
verify({istOnly:false},false,withoutOptionalMisc);
// Shipped-data annotation mismatch: row 212 can have *ID=213.
verify({doubleChance:100,singleChance:0,returnChance:0,missChance:0},false,t=>{
 withoutOptionalMisc(t);
 t.itemstatcost.rows[212]['*ID']='213';
});
verify({istOnly:false},false,t=>{
 for(const r of t.itemstatcost.rows) r['*ID']='';
});
verify({},false,t=>{
 while(t.itemstatcost.rows.length<510) {
  const i=t.itemstatcost.rows.length;
  t.itemstatcost.rows.push({Stat:'synthetic_'+i,'*ID':String(i)});
 }
});
for(let i=0;i<4;i++){const c={istOnly:false};['doubleChance','singleChance','returnChance','missChance'].forEach((k,j)=>c[k]=i===j?100:0);verify(c);}
for(const bad of [{doubleChance:51},{doubleChance:-1},{doubleChance:0.5},{doubleChance:'50'},{missChance:NaN}]) {
 const r=run(bad);assert.ok(r.error);assert.equal(r.writes.length,0);assert.equal(r.copies.length,0);checks++;
}
for(const stat of ['different_stat']) {
 const r=run({},t=>t.properties.rows.push(
  {code:'item-mythic',func1:'8',stat1:'item_mythic'},
  {code:'item-mythic',func1:'8',stat1:stat},
  {code:'pierce-elem',func1:'1',stat1:'passive_fire_pierce'},
 ));
 assert.match(r.error?.message ?? '',/Conflicting item-mythic definitions/);
 assert.equal(r.writes.length,0);assert.equal(r.copies.length,0);checks++;
}
// Relics adds the same Mythic property from a function and its payload.
// Keep row indices and every field except the redundant code unchanged.
for(const duplicates of [2,3]) {
 let before;
 const r=run({},t=>{
  t.properties.rows=Array.from({length:duplicates},()=>({code:'item-mythic',func1:'8',stat1:'item_mythic'}));
  t.properties.rows.push({code:'pierce-elem',func1:'1',stat1:'passive_fire_pierce',func2:'3',stat2:'passive_ltng_pierce',func3:'3',stat3:'passive_cold_pierce'});
  before=structuredClone(t.properties.rows);
 });
 assert.equal(r.error,undefined,String(r.error));
 const rows=r.tables.properties.rows;
 assert.equal(rows.length,before.length+1);
 assert.deepEqual(rows[0],before[0]);
 for(let i=1;i<duplicates;i++) {
  assert.equal(rows[i].code,'prg_mythic_'+i.toString(36));
  assert.deepEqual({...rows[i],code:'item-mythic'},before[i]);
 }
 assert.deepEqual(rows[duplicates],before[duplicates]);
 assert.equal(rows.at(-1).code,'prg_roll');
 assert.equal(new Set(rows.map(x=>x.code)).size,rows.length);
 assert.equal(rows.findIndex(x=>x.code==='prg_roll'),[...new Set(rows.map(x=>x.code))].indexOf('prg_roll'));
 checks++;
}
for(const mutate of [
 t=>t.properties.rows.push({code:'item-mythic',func1:'1',stat1:'item_mythic'},{code:'item-mythic',func1:'1',stat1:'item_mythic'}),
 t=>t.properties.rows.push({code:'prg_mythic_1',func1:'1'}),
]) {
 const r=run({},mutate);assert.ok(r.error);assert.equal(r.writes.length,0);assert.equal(r.copies.length,0);checks++;
}
for(const mutate of [t=>t.misc.rows.find(r=>r.code==='r24').invfile='',t=>t.armor.rows.push({code:'prg0'}),t=>t.armor.rows.push({code:'pgm'}),t=>t.weapons.rows.push({code:'pgm'}),t=>t.misc.rows.push({code:'pgm'}),t=>t.misc.rows.push({...t.misc.rows[0],code:'prg0'}),t=>t.misc.headers=t.misc.headers.filter(h=>h!=='compactsave'),t=>t.misc.headers=t.misc.headers.filter(h=>h!=='component'),t=>t.misc.rows.find(r=>r.code==='r24').stackable='1',t=>t.itemstatcost.rows[2].Stat='',t=>t.itemstatcost.rows[2].Stat=t.itemstatcost.rows[1].Stat,t=>{while(t.itemstatcost.rows.length<511){let i=t.itemstatcost.rows.length;t.itemstatcost.rows.push({Stat:'synthetic_'+i,'*ID':String(i)});}}]) {
 const r=run({},mutate);assert.ok(r.error);assert.equal(r.writes.length,0);assert.equal(r.copies.length,0);checks++;
}
// Missing/invalid current game model must stop before any data or asset writes.
for(const model of [null,[]]) {
 const r=run({},()=>{},false,model);assert.ok(r.error);assert.equal(r.writes.length,0);assert.equal(r.copies.length,0);checks++;
}
// Verify third-party files byte-for-byte and their native sprite structure.
const assets=JSON.parse(read('ProbabilisticRuneDowngrade/research/glowing-runes.json'));
assert.equal(Object.keys(assets.files).length,64);
const bundled=fs.readdirSync(new URL('ProbabilisticRuneDowngrade/hd/global/ui/items/misc/rune/',root));
assert.equal(bundled.length,64);
for(const [path,info] of Object.entries(assets.files)) {
 const data=fs.readFileSync(new URL('ProbabilisticRuneDowngrade/'+path,root));
 assert.equal(createHash('sha256').update(data).digest('hex'),info.sha256);
 assert.equal(data.subarray(0,4).toString(),'SPa1');
 assert.equal(data.readUInt16LE(4),31);
 const size=path.endsWith('.lowend.sprite')?49:98;
 assert.equal(data.readInt32LE(8),size);assert.equal(data.readInt32LE(12),size);
 assert.equal(data.length,40+size*size*4);
 assert.match(path,/^hd\/global\/ui\/items\/misc\/rune\/prg_pending_(0[2-9]|[12][0-9]|3[0-3])(?:\.lowend)?\.sprite$/);
}
checks++;
// A separate hammer code must not collide with any existing item/type mapping.
for(const table of ['misc','armor','weapons']) {
 const r=run({},t=>t[table].rows.push({code:'prh'}));
 assert.ok(r.error);assert.equal(r.writes.length,0);assert.equal(r.copies.length,0);checks++;
}
for(const field of ['GheedMin','GheedMax','PermStoreItem','NightmareUpgrade','HellUpgrade']) {
 const r=run({},t=>t.misc.headers=t.misc.headers.filter(k=>k!==field));
 assert.ok(r.error);assert.equal(r.writes.length,0);assert.equal(r.copies.length,0);checks++;
}
for(const mutate of [t=>t.weapons.rows=[], t=>t.weapons.rows.find(r=>r.code==='hdm').invfile='']) {
 const r=run({},mutate);assert.ok(r.error);assert.equal(r.writes.length,0);assert.equal(r.copies.length,0);checks++;
}
verify({},false,t=>t.misc.rows=t.misc.rows.filter(r=>r.code!=='isc'));
verify({},false,t=>t.misc.rows.find(r=>r.code==='isc').stackable='1');
const hammerAssets=JSON.parse(read('ProbabilisticRuneDowngrade/research/hammer-icon.json')).files;
assert.equal(Object.keys(hammerAssets).length,2);
for(const [path,info] of Object.entries(hammerAssets)) {
 const data=fs.readFileSync(new URL('ProbabilisticRuneDowngrade/'+path,root));
 assert.equal(createHash('sha256').update(data).digest('hex'),info.sha256);
 assert.equal(data.subarray(0,4).toString(),'SPa1');assert.equal(data.readUInt16LE(4),31);
 const size=path.endsWith('.lowend.sprite')?49:98;
 assert.equal(data.readInt32LE(8),size);assert.equal(data.readInt32LE(12),size);
 assert.equal(data.length,40+size*size*4);
}
checks++;
if(fs.existsSync('/tmp/rg-cubemain.txt')) verify({istOnly:false},true);
 checksByEdition[edition]=checks-before;
}
activate('tiered');
const groupConfig=(prefix,values)=>Object.fromEntries(keys.map((key,i)=>[prefix+key[0].toUpperCase()+key.slice(1),values[i]]));
// Deliberately different distributions expose wrong-side boundary selection at 20/21 and 25/26.
verify({...groupConfig('low',[100,0,0,0]),...groupConfig('mid',[0,100,0,0]),...groupConfig('high',[0,0,100,0])});
verify({...groupConfig('low',[11,22,33,34]),...groupConfig('mid',[40,30,20,10]),...groupConfig('high',[1,2,3,94])});
for(const prefix of prefixes) {
 for(const values of [[0,34,33,33],[33,0,34,33],[33,33,0,34],[34,33,33,0],[100,0,0,0],[0,100,0,0],[0,0,100,0],[0,0,0,100]]) {
  verify({...groupConfig('low',[11,22,33,34]),...groupConfig('mid',[40,30,20,10]),...groupConfig('high',[1,2,3,94]),...groupConfig(prefix,values)});
 }
 for(const bad of [-1,0.5,'50',NaN,undefined,101,49,51]) {
  const id=prefix+'DoubleChance';
  const result=run({[id]:bad},()=>{},false,undefined,true);
  assert.ok(result.error);assert.match(result.error.message,new RegExp(prefix==='low'?'Low':prefix==='mid'?'Mid':'High'));
  assert.equal(result.writes.length,0);assert.equal(result.copies.length,0);checks++;
 }
}
// Old global IDs cannot silently override explicit group values or substitute for missing fields.
const stale=run({doubleChance:100,singleChance:0,returnChance:0,missChance:0},()=>{},false,undefined,true);
assert.equal(stale.error,undefined);
assert.deepEqual(copiesAsPlain(stale.tables),copiesAsPlain(run().tables));checks++;
const missing=Object.fromEntries(Object.keys(defaults).map(k=>[k,undefined]));
Object.assign(missing,{doubleChance:50,singleChance:25,returnChance:10,missChance:15});
const rejected=run(missing,()=>{},false,undefined,true);
assert.ok(rejected.error);assert.equal(rejected.writes.length,0);assert.equal(rejected.copies.length,0);checks++;
// Equal group settings generate exactly the same game data as Standard (defaults and custom values).
for(const values of [[50,25,10,15],[17,28,31,24]]) {
 activate('tiered');const tiered=run(Object.assign({},...prefixes.map(p=>groupConfig(p,values))));
 activate('standard');const standard=run(Object.fromEntries(keys.map((k,i)=>[k,values[i]])));
 assert.equal(tiered.error,undefined);assert.equal(standard.error,undefined);
 assert.deepEqual(copiesAsPlain(tiered.tables),copiesAsPlain(standard.tables));assert.deepEqual(copiesAsPlain(tiered.hd),copiesAsPlain(standard.hd));
 assert.deepEqual(copiesAsPlain(tiered.strings),copiesAsPlain(standard.strings));assert.deepEqual(copiesAsPlain(tiered.copies),copiesAsPlain(standard.copies));checks++;
}
activate('tiered');
assert.equal(metadata.config.length,3);
assert.equal(flatFields(metadata.config).length,12);
assert.equal(new Set(flatFields(metadata.config).map(c=>c.id)).size,12);
assert.deepEqual(Object.keys(Object.fromEntries(flatFields(editions.standard.metadata.config).map(c=>[c.id,c.defaultValue]))),keys);
assert.ok(metadata.config.every(s=>s.type==='section'&&s.defaultValue===undefined&&s.children.every(f=>f.type==='number'&&f.minValue===0&&f.maxValue===100)));
checks++;
const sha = s => createHash('sha256').update(s).digest('hex');
const inputs=Object.fromEntries(['ProbabilisticRuneDowngrade/mod.js','ProbabilisticRuneDowngrade/mod.json','ProbabilisticRuneDowngrade/research/schema.json','tools/verify.mjs','tools/package-editions.mjs','ProbabilisticRuneDowngrade/research/glowing-runes.json','ProbabilisticRuneDowngrade/research/hammer-icon.json'].map(p=>[p,sha(read(p))]));
const report={inputs,date:new Date().toISOString().slice(0,10),checks,checksByEdition,status:'PASS',engine:'Node vm; mocked D2RMM API',actualTables:fs.existsSync('/tmp/rg-cubemain.txt'),limitations:'Not D2RMM installation or game execution. Installer checks only; game validation is separately user-reported. Reign of the Warlock only.'};
fs.writeFileSync(new URL('ProbabilisticRuneDowngrade/docs/LOCAL_VALIDATION.json',root),JSON.stringify(report,null,2)+'\n');
console.log(report);
