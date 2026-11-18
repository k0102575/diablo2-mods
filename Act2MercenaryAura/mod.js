// Use the shared D2RMM table so earlier skill edits remain in the output.
const path = ['global', 'excel', 'skills.txt'].join(String.fromCharCode(92));
const table = D2RMM.readTsv(path, { removeCarriageReturns: true });
if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows) ||
    !table.headers.includes('skill') || !table.headers.includes('aitype')) {
  throw new Error('Act II Mercenary Aura Activation: skills.txt requires skill and aitype columns.');
}

const auraNames = ['Might', 'Prayer', 'Defiance', 'Blessed Aim', 'Holy Freeze'];
const targetRows = auraNames.map((name) => {
  const matches = table.rows.filter((row) => row.skill === name);
  if (matches.length !== 1) {
    throw new Error('Act II Mercenary Aura Activation: expected one skills.txt row for ' + name + '.');
  }
  return matches[0];
});

if (targetRows.some((row) => String(row.aitype) !== '1')) {
  for (const row of targetRows) row.aitype = '1';
  D2RMM.writeTsv(path, table);
}
