/*
 * 확률형 룬 분해 모드 — 악마술사의 군림 전용
 * Probabilistic Rune Downgrade 0.4.1 / 제작자: 빵길빵길
 * 오프라인 D2RMM 데이터 모드입니다. 엘드~조드 전체 등급을 생성합니다.
 *
 * 이 파일은 D2RMM의 '모드 설치' 버튼을 누를 때 실행됩니다.
 * 게임에서 큐브를 누를 때마다 이 JavaScript가 실행되는 것은 아닙니다.
 * 여기서는 게임이 사용할 아이템과 조합법을 만들어 둡니다.
 *
 * 게임 안의 흐름:
 *   룬 1개 + 룬 분해 망치 1개
 *     → 분해 대기 아이템 (게임 엔진이 추첨값 1~100을 부여)
 *     → 대기 아이템만 다시 조합
 *     → 추첨값에 해당하는 결과 지급
 *
 * 기본 확률: 하위 룬 2개 50%, 1개 25%, 원래 룬 10%, 망치 반환(꽝) 15%.
 * 첫 조합에서 룬과 망치를 소비하며 성공/유지에는 망치를 돌려주지 않습니다.
 * 추첨값은 첫 조합에서 저장됩니다. 두 번째 조합은 새로 추첨하지 않습니다.
 * 대기 아이템을 남긴 채 확률을 바꾸면 저장된 값에 새 확률이 적용됩니다.
 * 모드 제거·순서 변경·다른 스탯 추가 모드 설치·게임 업데이트 전에는
 * 대기 아이템을 모두 처리하고 캐릭터와 공유 보관함을 백업하세요.
 *
 * 우리 모드는 Relics of Sanctuary 뒤에 설치하세요. 아래 호환 처리는
 * 완전히 동일한 item-mythic 중복만 대상으로 하며, 모든 모드 호환을 보장하지 않습니다.
 * 쓰는 파일: misc/itemtypes/itemstatcost/properties/cubemain TSV,
 * item-runes.json 문자열, hd/items/items.json, 전용 HD 모델 정의·sprite입니다.
 * armor/weapons는 읽기 전용으로 코드 충돌·제작 무기 존재 여부를 검사합니다. 세이브 파일은 직접 수정하지 않습니다.
 *
 * 아래 순서로 읽으면 됩니다.
 *   1. 설정 검사 → 2. 공통 함수 → 3. 원본 데이터 검사
 *   4. 이름·아이콘 준비 → 5. 대기 아이템 정의
 *   6. 등급별 아이템·조합법 생성 → 7. 파일 저장
 */

// ── 1. 설정 검사 ──────────────────────────────────────────────

// 문제가 있으면 설치를 중단합니다. 오류 앞에 모드 이름을 붙입니다.
const fail = message => {
  throw new Error('[PRDG] ' + message);
};

if (D2RMM.getVersion() < 1.9) {
  fail('D2RMM 1.9+ is required.');
}

// 배열의 순서가 결과 번호입니다.
// 0: 하위 룬 2개 / 1: 하위 룬 1개 / 2: 원래 룬 / 3: 꽝
// 빌드 시 두 배포판에 고정합니다. 저장된 설정으로 판종을 자동 추측하지 않습니다.
const probabilityMode = 'tiered';
const outcomeKeys = ['doubleChance', 'singleChance', 'returnChance', 'missChance'];
const probabilityTiers = [
  { id: 'low', label: '하급 / Low (Eld-Lem, 2-20)', min: 2, max: 20 },
  { id: 'mid', label: '중급 / Mid (Pul-Gul, 21-25)', min: 21, max: 25 },
  { id: 'high', label: '고급 / High (Vex-Zod, 26-33)', min: 26, max: 33 },
];
function readChances(prefix, label) {
  const values = outcomeKeys.map(key => {
    const id = prefix ? prefix + key[0].toUpperCase() + key.slice(1) : key;
    const value = config[id];
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      fail(label + ': ' + id + ': expected integer 0..100.');
    }
    return value;
  });
  const total = values.reduce((a, b) => a + b, 0);
  if (total !== 100) {
    fail(label + ': probabilities must sum to exactly 100 / 확률 합계는 100이어야 합니다. Total=' + total);
  }
  return values;
}
if (!['tiered', 'standard'].includes(probabilityMode)) fail('Unsupported probability edition.');
// 어느 구간의 설정이 잘못돼도 게임 데이터를 쓰기 전에 설치를 중단합니다.
const chancesByTier = probabilityMode === 'tiered'
  ? Object.fromEntries(probabilityTiers.map(tier => [tier.id, readChances(tier.id, tier.label)]))
  : { standard: readChances('', '전체 / Standard') };
// Older saved configurations may not contain this new checkbox yet.
const sellHammerAtGheed = config.sellHammerAtGheed === undefined ? true : config.sellHammerAtGheed;
if (typeof sellHammerAtGheed !== 'boolean') fail('sellHammerAtGheed: expected boolean.');

// 악마술사의 군림 데이터만 수정합니다. base 경로는 사용하지 않습니다.
const prefix = 'global\\excel\\';

// 수정할 테이블을 모아 두었다가 마지막 단계에서 저장합니다.
// HD 아이템 매핑은 3글자 코드만 지원합니다. pg0~pgv를 예약합니다.
// itemtypes 종류 식별자 prgp(4글자)는 실제 아이템 코드와 별개입니다.
const hammerCode = 'prh';
// Exact bases, not the entire hammer type. A restricted edition can narrow this list.
const hammerCraftBases = ['mau', '9m9', '7m7']; // Maul / War Club / Ogre Maul
const hammerCraftIngredients = ['r14', 'skz', 'jew']; // Dol / Perfect Skull / Jewel
const pendingCodes = new Set(
  Array.from({ length: 32 }, (_, i) => 'pg' + i.toString(36)),
);
const reservedCode = value => {
  const code = String(value).toLowerCase();
  return code.startsWith('prg') || code === hammerCode || pendingCodes.has(code);
};

const files = {};

// ── 2. 테이블을 다루는 공통 함수 ───────────────────────────────

// TSV는 탭으로 칸을 나눈 게임 데이터입니다.
// headers = 열 이름 목록, rows = 각 행의 데이터입니다.
// readOnly가 true인 테이블은 검사만 하고 저장 목록에는 넣지 않습니다.
function load(name, columns, readOnly = false) {
  const path = prefix + name + '.txt';
  let t;

  try {
    t = D2RMM.readTsv(path, { removeCarriageReturns: true });
  } catch (e) {
    fail('Required table unreadable: ' + path + ': ' + e);
  }

  if (!t || !Array.isArray(t.rows) || !Array.isArray(t.headers)) {
    fail('Invalid table: ' + path);
  }

  columns.forEach(c => {
    if (!t.headers.includes(c)) {
      fail(path + ': missing column ' + c);
    }
  });

  if (!readOnly) {
    files[path] = t;
  }

  return t;
}

// 원본의 열 이름을 유지하면서 모든 칸이 빈 새 행을 만듭니다.
function blank(t) {
  return Object.fromEntries(t.headers.map(h => [h, '']));
}

// 필요한 값만 채워서 행을 추가합니다. 게임 테이블의 값은 문자열입니다.
function add(t, values) {
  Object.keys(values).forEach(k => {
    if (!t.headers.includes(k)) {
      fail('Missing required output column: ' + k);
    }
  });

  const row = Object.assign(blank(t), values);

  if (t.headers.includes('*eol')) {
    row['*eol'] = '0';
  }

  t.rows.push(row);
  return row;
}

// 예: unique(misc, 'code', 'isc')는 감별 주문서 행 하나를 찾습니다.
// 없거나 두 개 이상이면 원본/다른 모드와의 충돌 가능성이 있어 중단합니다.
function unique(t, key, value) {
  const rows = t.rows.filter(r => r[key] === value);

  if (rows.length !== 1) {
    fail('Expected exactly one ' + key + '=' + value);
  }

  return rows[0];
}

// ── 3. 게임 테이블 읽기 및 충돌 검사 ───────────────────────────

// misc: 룬·주문서·대기 아이템의 기본 정보
// auto prefix/normcode/ubercode/ultracode는 이 생성기에 필요하지 않습니다.
// 일부 조사용 수정 테이블에만 있는 열을 순정 misc의 필수 열로 요구하지 않습니다.
const misc = load('misc', [
  'code', 'namestr', 'type', 'type2', 'compactsave', 'invfile',
  'flippyfile', 'useable', 'stackable', 'spawnable',
  'spelldesc', 'spelldescstr', 'gemsockets', 'cost', 'quest',
  'GheedMin', 'GheedMax', 'GheedMagicMin', 'GheedMagicMax', 'GheedMagicLvl',
  'PermStoreItem', 'multibuy', 'NightmareUpgrade', 'HellUpgrade',
]);

// itemtypes: 아이템 종류 / itemstatcost: 아이템에 저장되는 속성 정의
const types = load('itemtypes', [
  'Code', 'ItemType', 'Equiv1', 'Equiv2', 'Normal', 'Body',
  'Magic', 'Rare', 'TreasureClass', 'VarInvGfx', 'StorePage',
]);

const stats = load('itemstatcost', [
  'Stat', 'Save Bits', 'Save Add', 'Send Bits', 'Send Other',
  'Signed', 'Encode', 'ValShift', 'Save Param Bits', 'descfunc',
]);

// properties: 조합 속성을 실제 스탯에 연결 / cubemain: 큐브 조합법
const props = load('properties', ['code', 'func1', 'stat1']);

const cube = load('cubemain', [
  'description', 'enabled', 'version', 'numinputs', 'input 1',
  'input 2', 'input 3', 'input 4', 'output', 'output b', 'op', 'param', 'value',
  'mod 1', 'mod 1 chance', 'mod 1 min', 'mod 1 max',
]);

// 다른 아이템 분류에서도 같은 코드를 쓰고 있는지 검사합니다.
const armor = load('armor', ['code'], true);
const weapons = load('weapons', ['code'], true);
hammerCraftBases.forEach(code => unique(weapons, 'code', code));
hammerCraftIngredients.forEach(code => unique(misc, 'code', code));

if ([armor, weapons].some(t =>
  t.rows.some(r => reservedCode(r.code))
)) {
  fail('PRG item code collision in armor/weapons.');
}

const statIDColumn = stats.headers.includes('*ID') ? '*ID' : 'ID';

if (!stats.headers.includes(statIDColumn)) {
  fail('itemstatcost requires ID or *ID.');
}

// 실제 스탯 ID는 행 위치입니다. *ID/ID 참고값과의 일치는 검사하지 않습니다.
// 기존 행·주석값·순서를 보존하고 이름의 공백/중복만 검사해 끝에 추가합니다.
const existingStatNames = new Set();
stats.rows.forEach((r, i) => {
  if (typeof r.Stat !== 'string' ||
      !r.Stat.trim() ||
      existingStatNames.has(r.Stat)) {
    fail('Empty or duplicate itemstatcost Stat at row ' + i);
  }
  existingStatNames.add(r.Stat);
});

const statID = stats.rows.length;
// 앞서 설치된 다른 모드가 추가한 스탯도 포함한 위치입니다.
// 설치 순서가 바뀌면 이 번호도 달라질 수 있으므로 대기 아이템을 남기지 마세요.

// 511은 저장 데이터의 종료 표식이므로 스탯 ID로 사용할 수 없습니다.
if (statID > 510) {
  fail('No safe item stat ID available (511 is reserved).');
}

// 이 모드는 자체 이름에 prg/PRG 접두사를 사용합니다.
for (const [table, key] of [
  [misc, 'code'],
  [types, 'Code'],
  [stats, 'Stat'],
  [props, 'code'],
]) {
  if (table.rows.some(r => reservedCode(r[key]))) {
    fail('PRG namespace collision in ' + key);
  }
}

// Relics of Sanctuary: 동일한 Mythic 속성 중복 등록 대응
// addMythicProperty()와 addNewItems()의 payload가 같은 속성을 추가하는 경우입니다.
// 첫 정의는 유지하고 후속 동일 행의 코드만 내부 별칭으로 바꿉니다.
// 행 삭제/재정렬은 하지 않으며 이름 이외의 값도 그대로 보존합니다.
// 따라서 기존 숫자 참조의 위치를 유지합니다. 서로 다른 정의는 임의로 병합하지 않습니다.
// PRG 이름 충돌 검사 후에 별칭을 생성하므로 기존 별칭을 덮어쓰지 않습니다.
const mythicEntries = props.rows
  .map((row, index) => ({ row, index }))
  .filter(entry => entry.row.code === 'item-mythic');

for (let n = 1; n < mythicEntries.length; n++) {
  const first = mythicEntries[0].row;
  const { row, index } = mythicEntries[n];

  const identical = props.headers.every(
    key => String(row[key] ?? '') === String(first[key] ?? '')
  );

  if (first.func1 !== '8' ||
      first.stat1 !== 'item_mythic' ||
      !identical) {
    fail('Conflicting item-mythic definitions; compatibility repair aborted.');
  }

  row.code = 'prg_mythic_' + index.toString(36);
  console.log('[PRDG] Relics compatibility: renamed duplicate at row ' + index);
}

if (cube.rows.some(r => String(r.description).startsWith('PRDG:'))) {
  fail('Recipes already installed in input data. Rebuild from original game data.');
}


for (let rank = 1; rank <= 33; rank++) {
  const r = unique(misc, 'code', 'r' + String(rank).padStart(2, '0'));

  if (r.stackable !== '0' || r.type !== 'rune') {
    fail('Modified/stacked rune unsupported: ' + r.code);
  }
}

// ── 4. 표시 이름과 HD 아이콘 준비 ──────────────────────────────

const stringsPath = 'local\\lng\\strings\\item-runes.json';
const hdPath = 'hd\\items\\items.json';
let strings, hd;

try {
  strings = D2RMM.readJson(stringsPath);
  hd = D2RMM.readJson(hdPath);
} catch (e) {
  fail('Required strings or HD item mapping missing: ' + e);
}

if (!Array.isArray(strings) || !Array.isArray(hd)) {
  fail('Unsupported localization/HD JSON schema.');
}

if (
  strings.some(s => String(s.Key).startsWith('PRG')) ||
  hd.some(s => Object.keys(s).some(k => reservedCode(k)))
) {
  fail('String or HD namespace collision.');
}

const languageKeys = [
  'enUS', 'zhTW', 'deDE', 'esES', 'frFR', 'itIT', 'koKR',
  'plPL', 'esMX', 'jaJP', 'ptBR', 'ruRU', 'zhCN',
];

// 한글과 영어 문자열을 등록합니다. 나머지 언어에는 영어를 표시합니다.
function text(key, en, ko) {
  const row = { id: D2RMM.getNextStringID(), Key: key };

  languageKeys.forEach(lang => {
    row[lang] = lang === 'koKR' ? ko : en;
  });

  strings.push(row);
}

text(
  'PRGHelp',
  'Transmute again alone to reveal the result',
  '추가 재료 없이 단독으로 다시 조합하세요',
);

// ── 5. 추첨값을 담을 스탯과 전용 아이템 종류 정의 ──────────────

// prg_roll: 대기 아이템에 1~100 값을 저장할 숨은 스탯입니다.
// 7비트는 0~127을 표현하므로 추첨값을 담을 수 있습니다.
// 표시 함수(descfunc)는 비워 두어 추첨값 자체는 툴팁에 표시하지 않습니다.
add(stats, {
  Stat: 'prg_roll',
  [statIDColumn]: String(statID),
  'Send Other': '1',
  Signed: '0',
  'Send Bits': '7',
  Encode: '0',
  ValShift: '0',
  'Save Bits': '7',
  'Save Add': '0',
  'Save Param Bits': '0',
});

// 조합법에서 prg_roll 속성을 지정하면 위 스탯에 값이 들어가게 연결합니다.
// func1=1은 min~max 범위에서 값을 정하는 게임 엔진의 속성 함수입니다.
add(props, {
  code: 'prg_roll',
  func1: '1',
  stat1: 'prg_roll',
});

// 룬/참 계열을 상속하지 않는 대기 아이템 전용 종류입니다.
add(types, {
  ItemType: 'PRG Pending Result',
  Code: 'prgp',
  Normal: '1',
  Body: '0',
  Magic: '0',
  Rare: '0',
  TreasureClass: '0',
  VarInvGfx: '0',
});

// ── 6. 등급마다 대기 아이템과 두 단계 조합법 생성 ──────────────

// 엘드(2)~조드(33) 전체 32등급을 항상 생성합니다. 엘은 분해하지 않습니다.
const ranks = Array.from({ length: 32 }, (_, i) => i + 2);

const pendingModels = {};

// 별도 비퀘스트 재료: 원래 호라드림 망치의 행·HD 매핑은 수정하지 않습니다.
const sourceHammer = unique(weapons, 'code', 'hdm');
const sourceHammerHD = hd.find(entry => entry.hdm)?.hdm;
if (!sourceHammer.invfile || !sourceHammer.flippyfile || !sourceHammerHD?.asset) {
  fail('Required Horadric Malus graphics missing.');
}
let hammerModel;
try {
  hammerModel = D2RMM.readJson('hd\\items\\weapon\\' + sourceHammerHD.asset + '.json');
} catch (e) {
  fail('Required Horadric Malus HD model missing: ' + e);
}
if (!hammerModel || typeof hammerModel !== 'object' || Array.isArray(hammerModel)) {
  fail('Unsupported Horadric Malus HD model.');
}
const hammerAsset = 'prg/dismantling_hammer';
pendingModels['hd\\items\\misc\\' + hammerAsset + '.json'] = hammerModel;
const hammerHD = JSON.parse(JSON.stringify(sourceHammerHD));
hammerHD.asset = hammerAsset;
hd.push({ [hammerCode]: hammerHD });
text('PRGHammer', 'Rune Dismantling Hammer', '룬 분해 망치');
// The game displays these description lines in reverse order.
text('PRGHammerHelp',
  '+ Dol Rune + Perfect Skull + Jewel\nCraft: Magic Maul family (excluding Great Maul family)\nTransmute with one rune (Eld-Zod). Consumed; returned on a miss.',
  '+ 돌 룬 + 최상급 해골 + 주얼\n제작: 매직 마울 계열 (그레이트 마울 계열 제외)\n엘드~조드 룬 1개와 조합. 소모되며 꽝일 때 망치만 반환됩니다.');
add(types, {
  ItemType: 'PRG Dismantling Material', Code: 'prgh', Equiv1: 'misc',
  Normal: '1', Body: '0', Magic: '0', Rare: '0', TreasureClass: '0',
  VarInvGfx: '0', StorePage: 'misc',
});
const hammer = add(misc, {
  name: 'PRGHammer', code: hammerCode, namestr: 'PRGHammer', type: 'prgh',
  compactsave: '0', version: '0', level: '1', levelreq: '0', rarity: '1',
  spawnable: '1', nodurability: '1', cost: '1', component: '16',
  invwidth: '1', invheight: '1', hasinv: '0', gemsockets: '0', useable: '0',
  stackable: '0', minstack: '0', maxstack: '0', spawnstack: '0',
  unique: '0', quest: '0', questdiffcheck: '0', belt: '0', autobelt: '0',
  spelldesc: '1', spelldescstr: 'PRGHammerHelp', pSpell: '-1', spellicon: '-1',
  invfile: sourceHammer.invfile, flippyfile: sourceHammer.flippyfile,
  // PermStoreItem은 비중첩 아이템도 재구매할 수 있게 합니다.
  GheedMin: sellHammerAtGheed ? '1' : '0', GheedMax: sellHammerAtGheed ? '1' : '0',
  GheedMagicMin: '0', GheedMagicMax: '0', GheedMagicLvl: '255',
  PermStoreItem: sellHammerAtGheed ? '1' : '0', multibuy: '0', NightmareUpgrade: 'xxx', HellUpgrade: 'xxx',
});
for (const field of ['normcode', 'ubercode', 'ultracode']) {
  if (misc.headers.includes(field)) hammer[field] = hammerCode;
}
for (const field of ['alternategfx', 'dropsound', 'dropsfxframe', 'usesound']) {
  if (misc.headers.includes(field)) hammer[field] = sourceHammer[field] ?? '';
}
if (misc.headers.includes('AdvancedStashStackable')) hammer.AdvancedStashStackable = '0';

// 등급마다 첫 단계 1행 + 결과 판정 100행을 추가합니다.
// 이 상한은 보수적인 안전 제한이며 현행 엔진 한도를 입증한 값은 아닙니다.
if (cube.rows.length + ranks.length * 101 + hammerCraftBases.length > 32767) {
  fail('Safety cap: total cube rows exceed 32767.');
}

// Fixed tool output: all four ingredients are consumed; no random crafted affixes.
for (const base of hammerCraftBases) {
  add(cube, {
    description: 'PRDG: craft hammer ' + base,
    enabled: '1', version: '100', numinputs: '4',
    'input 1': base + ',mag',
    'input 2': hammerCraftIngredients[0],
    'input 3': hammerCraftIngredients[1],
    'input 4': hammerCraftIngredients[2],
    output: hammerCode + ',nor', lvl: '1',
  });
}

for (const rank of ranks) {
  // 분해 결과가 아닌 입력 룬의 등급으로 구간을 선택합니다.
  const tier = probabilityTiers.find(t => rank >= t.min && rank <= t.max);
  if (!tier) fail('Rune rank has no probability tier: ' + rank);
  const chances = chancesByTier[probabilityMode === 'tiered' ? tier.id : 'standard'];
  // 예: rank=24라면 rune=r24(이스트), lower=r23(말)입니다.
  const tag = String(rank).padStart(2, '0');
  const pending = 'pg' + (rank - 2).toString(36);
  const rune = 'r' + tag, lower = 'r' + String(rank - 1).padStart(2, '0');
  const key = 'PRGPending' + tag;

  // 입력 룬의 이름·레거시 그림·HD 바닥 모델은 유지하고 HD 아이콘만 분리합니다.
  const sourceRune = unique(misc, 'code', rune);
  const sourceName = unique({ rows: strings }, 'Key', sourceRune.namestr);
  const sourceHD = hd.find(entry => entry[rune]);

  if (!sourceName.enUS || !sourceName.koKR) {
    fail('English/Korean rune name missing: ' + rune);
  }

  if (!sourceRune.invfile || !sourceRune.flippyfile || !sourceHD || !sourceHD[rune].asset) {
    fail('Rune graphics missing: ' + rune);
  }

  // 아이템 코드는 3글자입니다. 마지막 한 글자는 36진수(0~9, a~z)로
  // 등급을 구분하므로 32개 등급을 서로 다른 코드로 표현할 수 있습니다.
  text(
    key,
    sourceName.enUS + ' — Pending Downgrade',
    sourceName.koKR + ' — 분해 대기',
  );

  // Per-rank text uses the same installed probability table as resolution.
  // Store lines in reverse order for the in-game tooltip renderer.
  const lowerRune = unique(misc, 'code', lower);
  const lowerName = unique({ rows: strings }, 'Key', lowerRune.namestr);
  if (!lowerName.enUS || !lowerName.koKR) fail('English/Korean lower rune name missing: ' + lower);
  const helpKey = 'PRGHelp' + tag;
  // Each result line must stay white even if another mod colors rune names.
  const tooltipLines = lines => lines.map((line, i) =>
    i === 0 ? 'ÿc4' + line : 'ÿc0' + line.replace(/ÿc./g, '')
  ).reverse().join('\n');
  text(helpKey,
    tooltipLines([
      'Transmute again alone to reveal the result',
      lowerName.enUS + ' x2: ' + chances[0] + '%',
      lowerName.enUS + ' x1: ' + chances[1] + '%',
      sourceName.enUS + ' returned: ' + chances[2] + '%',
      'Miss (hammer returned): ' + chances[3] + '%',
    ]),
    tooltipLines([
      '추가 재료 없이 단독으로 다시 조합하세요',
      lowerName.koKR + ' 2개: ' + chances[0] + '%',
      lowerName.koKR + ' 1개: ' + chances[1] + '%',
      sourceName.koKR + ' 반환: ' + chances[2] + '%',
      '꽝 (망치 반환): ' + chances[3] + '%',
    ]),
  );

  // 빈 행에서 시작해 상점·주문·참 접두사 같은 기존 기능의 유입을 막습니다.
  const row = add(misc, {
    name: key,
    code: pending,
    namestr: key,
    type: 'prgp',
    compactsave: '0',       // 추가 스탯(추첨값)까지 저장하도록 설정
    version: '100',
    level: '1',
    levelreq: '0',
    spawnable: '0',
    nodurability: '1',
    cost: '0',
    component: '16',
    invwidth: '1',          // 인벤토리에서 1×1 크기
    invheight: '1',
    hasinv: '0',
    gemsockets: '0',
    useable: '0',
    stackable: '0',         // 추첨값이 다른 대기 아이템을 겹치지 않음
    spawnstack: '0',
    minstack: '0',
    maxstack: '0',
    unique: '0',
    belt: '0',
    autobelt: '0',
    spelldesc: '1',
    spelldescstr: helpKey, // 입력 룬별 결과와 적용 확률
    pSpell: '-1',
    spellicon: '-1',
  });

  // 그림·바닥 모델·소리 등 표시용 필드만 입력 룬에서 가져옵니다.
  // 클래식 아이콘·바닥 표시용 필드는 입력 룬 그대로 유지합니다.
  [
    'invfile', 'flippyfile', 'alternategfx', 'dropsound',
    'dropsfxframe', 'usesound', 'transtbl',
  ].forEach(k => {
    if (misc.headers.includes(k)) {
      row[k] = sourceRune[k];
    }
  });

  if (misc.headers.includes('AdvancedStashStackable')) {
    row.AdvancedStashStackable = '0';
  }

  // HD asset은 인벤토리 sprite와 바닥 모델 JSON 양쪽에 사용됩니다.
  // 전용 sprite 경로를 쓰되 현재 입력 룬의 모델 정의를 복제해 바닥 모델을 보존합니다.
  // 원본 룬 매핑과 공용 아이콘 파일은 수정하지 않습니다.
  const pendingAsset = 'rune/prg_pending_' + tag;
  const modelPath = 'hd\\items\\misc\\' + sourceHD[rune].asset + '.json';
  let sourceModel;
  try {
    sourceModel = D2RMM.readJson(modelPath);
  } catch (e) {
    fail('Required rune HD model missing: ' + modelPath + ': ' + e);
  }
  if (!sourceModel || typeof sourceModel !== 'object' || Array.isArray(sourceModel)) {
    fail('Unsupported rune HD model: ' + modelPath);
  }
  pendingModels['hd\\items\\misc\\' + pendingAsset + '.json'] = sourceModel;
  const pendingHD = JSON.parse(JSON.stringify(sourceHD[rune]));
  pendingHD.asset = pendingAsset;
  hd.push({ [pending]: pendingHD });

  // 첫 번째 조합: 룬 + 룬 분해 망치 → 추첨값을 가진 대기 아이템
  // mod 1 chance=100은 '스탯을 항상 붙인다'는 뜻입니다.
  // 네 결과의 확률은 여기서 따로 굴리지 않고 아래의 값 구간으로 나눕니다.
  add(cube, {
    description: 'PRDG: roll ' + rune,
    enabled: '1',
    version: '100',
    numinputs: '2',
    'input 1': rune,
    'input 2': hammerCode,
    output: pending + ',nor',
    lvl: '1',
    'mod 1': 'prg_roll',
    'mod 1 chance': '100',
    'mod 1 min': '1',
    'mod 1 max': '100',
  });

  // 두 번째 조합: 대기 아이템 → 저장된 추첨값에 대응하는 결과
  // 값마다 조합법 하나를 만들어 조합법 순서에 의존하지 않게 합니다.
  for (let roll = 1; roll <= 100; roll++) {
    let outcome = 0, bound = chances[0];

    // 기본 확률에서 누적 경계(bound)는 50 → 75 → 85 → 100입니다.
    // 예: roll=60이면 50을 넘어서 outcome=1(하위 룬 1개)이 됩니다.
    // 확률이 0인 결과의 구간은 자동으로 건너뜁니다.
    while (roll > bound) {
      outcome++;
      bound += chances[outcome];
    }

    // op=18: param이 가리키는 아이템 스탯이 value와 같을 때만 허용합니다.
    // output b는 두 개 당첨 때만 사용합니다. 나머지는 빈 값입니다.
    // 원본을 변형/복사하지 않고 새 룬을 생성해 대기 스탯이 넘어가지 않게 합니다.
    add(cube, {
      description: 'PRDG: resolve ' + rune + ' ' + roll,
      enabled: '1',
      version: '100',
      numinputs: '1',
      'input 1': pending,
      op: '18',
      param: String(statID),
      value: String(roll),
      output: outcome < 2 ? lower : outcome === 2 ? rune : hammerCode,
      'output b': outcome === 0 ? lower : '',
    });
  }
}

// ── 7. 생성한 테이블과 문자열 저장 ─────────────────────────────

// 위 검사와 생성이 모두 끝난 뒤 처음으로 파일을 씁니다.
// API로 파일을 순차 저장하며, 쓰기 중 오류까지 일괄 되돌리는 트랜잭션은 아닙니다.
// 설치 실패 시 게임을 실행하지 말고 오류를 확인한 뒤 D2RMM에서 다시 설치하세요.
// 모드에 포함한 전용 파일만 복사하며 일반 룬의 공용 경로는 덮어쓰지 않습니다.
D2RMM.copyFile(
  'hd\\global\\ui\\items\\misc\\rune',
  'hd\\global\\ui\\items\\misc\\rune',
  true,
);
D2RMM.copyFile('hd\\global\\ui\\items\\misc\\prg', 'hd\\global\\ui\\items\\misc\\prg', true);
Object.keys(pendingModels).forEach(path => {
  D2RMM.writeJson(path, pendingModels[path]);
});
Object.keys(files).forEach(path => {
  D2RMM.writeTsv(path, files[path], { addCarriageReturns: true });
});

D2RMM.writeJson(stringsPath, strings);
D2RMM.writeJson(hdPath, hd);

console.log(
  '[PRDG] ' + ranks.length + ' ranks, ' + (ranks.length * 101) +
  ' recipes; stat ID ' + statID + '.',
);
