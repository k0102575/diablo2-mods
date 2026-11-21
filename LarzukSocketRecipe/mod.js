// Larzuk Socket Recipe — independently implemented cube recipes.
// Only cubemain.txt is changed. Existing recipes and equipment tables are preserved.
// Construct one separator at runtime; duplicate separators split D2RMM's file cache.
const path = ['global', 'excel', 'cubemain.txt'].join(String.fromCharCode(92));
const table = D2RMM.readTsv(path, { removeCarriageReturns: true });
const required = ['description', 'enabled', 'version', 'numinputs', 'input 1',
  'input 2', 'input 3', 'output', 'mod 1', 'mod 1 min', 'mod 1 max'];
if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows)) {
  throw new Error('Larzuk Socket Recipe: cubemain.txt could not be read as a TSV table.');
}
const missing = required.filter((column) => !table.headers.includes(column));
if (missing.length) {
  throw new Error('Larzuk Socket Recipe: missing cubemain.txt columns: ' + missing.join(', '));
}
const prefix = 'LSR socket ';
if (table.rows.some((row) => String(row.description || '').startsWith(prefix))) {
  throw new Error('Larzuk Socket Recipe: recipes already present; reinstall from clean game data.');
}
// `sock=6` enables the engine's input socketability check, including ilvl limits.
// Properties are applied before the output socket flag. The flag does not add
// sockets again if the property has already set them. Thus magic can roll 1–2,
// while equipment with zero allowed sockets cannot consume the materials.
// Each recipe chooses its material explicitly; the same superior base can
// take Um for maximum sockets or Pul for a 1..6 roll capped by the engine.
const recipes = [
  { mode: 'max', quality: 'low', rune: 'r22', min: 6, max: 6 },
  { mode: 'max', quality: 'nor', rune: 'r22', min: 6, max: 6 },
  { mode: 'max', quality: 'hiq', rune: 'r22', min: 6, max: 6 },
  { mode: 'random', quality: 'hiq', rune: 'r21', min: 1, max: 6 },
  { mode: 'larzuk', quality: 'mag', rune: 'r23', min: 1, max: 2 },
  { mode: 'larzuk', quality: 'rar', rune: 'r23', min: 1, max: 1 },
  { mode: 'larzuk', quality: 'set', rune: 'r23', min: 1, max: 1 },
  { mode: 'larzuk', quality: 'uni', rune: 'r23', min: 1, max: 1 },
  { mode: 'larzuk', quality: 'crf', rune: 'r23', min: 1, max: 1 },
];
const added = [];
for (const type of ['weap', 'armo']) {
  for (const { mode, quality, rune, min, max } of recipes) {
    const row = Object.fromEntries(table.headers.map((column) => [column, '']));
    Object.assign(row, {
      description: `${prefix}${mode} ${type} ${quality}`,
      enabled: '1', version: '100', numinputs: '3',
      'input 1': `${type},${quality},nos`,
      'input 2': `${rune},qty=1`, 'input 3': 'gem4,qty=1',
      output: 'useitem,sock=6', 'mod 1': 'sock',
      'mod 1 min': String(min), 'mod 1 max': String(max),
    });
    if (table.headers.includes('*eol')) row['*eol'] = '0';
    added.push(row);
  }
}
table.rows.push(...added);
D2RMM.writeTsv(path, table);
