// Read the shared D2RMM tables using the same path as other data mods.
const skillPath = ['global', 'excel', 'skills.txt'].join(String.fromCharCode(92));
const hirelingPath = ['global', 'excel', 'hireling.txt'].join(String.fromCharCode(92));
const auraNames = new Set(['Might', 'Prayer', 'Defiance', 'Blessed Aim', 'Holy Freeze']);
const slotNumbers = [1, 2, 3, 4, 5, 6];
const targetWeight = 10000;

function readTable(path, required) {
  const table = D2RMM.readTsv(path, { removeCarriageReturns: true });
  if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows) ||
      required.some((column) => !table.headers.includes(column))) {
    throw new Error('Act II Mercenary Aura Activation: unsupported table schema for ' + path + '.');
  }
  return table;
}

const skills = readTable(skillPath, ['skill', 'aitype']);
const hirelings = readTable(hirelingPath, ['Act', 'Class',
  ...slotNumbers.flatMap((slot) => ['Skill' + slot, 'Chance' + slot])]);

const targets = [];
for (const row of hirelings.rows) {
  if (String(row.Act) !== '2' || String(row.Class) !== '338') continue;
  const auraSlots = slotNumbers.filter((slot) => auraNames.has(row['Skill' + slot]));
  // A modified mercenary with multiple supported auras keeps its existing AI weights.
  if (auraSlots.length !== 1) continue;
  const slot = auraSlots[0];
  const chanceColumn = 'Chance' + slot;
  const weight = Number(row[chanceColumn]);
  if (!Number.isSafeInteger(weight) || weight < 0) {
    throw new Error('Act II Mercenary Aura Activation: invalid ' + chanceColumn + ' for ' + row['Skill' + slot] + '.');
  }
  targets.push({ row, chanceColumn, weight, aura: row['Skill' + slot] });
}
if (targets.length === 0) {
  throw new Error('Act II Mercenary Aura Activation: no supported Act II mercenary aura slots found.');
}

const auraRows = Array.from(new Set(targets.map((target) => target.aura)), (name) => {
  const matches = skills.rows.filter((row) => row.skill === name);
  if (matches.length !== 1) {
    throw new Error('Act II Mercenary Aura Activation: expected one skills.txt row for ' + name + '.');
  }
  return matches[0];
});

// In the legacy hireling AI, aitype 1 excludes an aura from the roll once its
// state is active. The hireling slot weight affects the roll before activation.
let skillsChanged = false;
for (const row of auraRows) {
  if (String(row.aitype) === '1') continue;
  row.aitype = '1';
  skillsChanged = true;
}

let hirelingsChanged = false;
for (const { row, chanceColumn, weight } of targets) {
  if (weight >= targetWeight) continue;
  row[chanceColumn] = String(targetWeight);
  hirelingsChanged = true;
}

if (skillsChanged) D2RMM.writeTsv(skillPath, skills);
if (hirelingsChanged) D2RMM.writeTsv(hirelingPath, hirelings);
