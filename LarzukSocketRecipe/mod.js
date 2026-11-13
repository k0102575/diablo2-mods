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
const qualities = [
  ['low', 6, 6], ['nor', 6, 6], ['hiq', 6, 6], ['mag', 1, 2],
  ['rar', 1, 1], ['set', 1, 1], ['uni', 1, 1], ['crf', 1, 1],
];
const added = [];
for (const type of ['weap', 'armo']) {
  for (const [quality, min, max] of qualities) {
    const row = Object.fromEntries(table.headers.map((column) => [column, '']));
    Object.assign(row, {
      description: `${prefix}${type} ${quality}`,
      enabled: '1', version: '100', numinputs: '3',
      'input 1': `${type},${quality},nos`,
      'input 2': 'r23,qty=1', 'input 3': 'gem4,qty=1',
      output: 'useitem,sock=6', 'mod 1': 'sock',
      'mod 1 min': String(min), 'mod 1 max': String(max),
    });
    if (table.headers.includes('*eol')) row['*eol'] = '0';
    added.push(row);
  }
}
table.rows.push(...added);
D2RMM.writeTsv(path, table);
