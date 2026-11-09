import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const root = new URL('../', import.meta.url);
export function buildEditions() {
  const source = fs.readFileSync(new URL('ProbabilisticRuneDowngrade/mod.js', root), 'utf8');
  const metadata = JSON.parse(fs.readFileSync(new URL('ProbabilisticRuneDowngrade/mod.json', root), 'utf8'));
  const marker = "const probabilityMode = 'tiered';";
  if (source.split(marker).length !== 2) throw new Error('Expected exactly one edition marker');
  const keys = ['doubleChance', 'singleChance', 'returnChance', 'missChance'];
  const groups = metadata.config.filter(field => field.type === 'section');
  const shared = metadata.config.filter(field => field.type !== 'section');
  if (groups.length !== 3 || groups.some((group, i) =>
    group.type !== 'section' || group.id !== ['low','mid','high'][i]+'RuneChances' || group.children.length !== 4)) {
    throw new Error('Expected the three tier configuration groups');
  }
  const standard = structuredClone(metadata);
  standard.name = 'Probabilistic Rune Downgrade (Standard)';
  standard.description = '악마술사의 군림 오프라인 전용 / Offline Reign of the Warlock. 전 등급 동일 확률. 합계 100. 전용 망치 사용. / One probability table for all rune ranks; dismantling hammer required.';
  standard.config = [...groups[0].children.map((field, i) => ({...field, id:keys[i], defaultValue:[50,25,10,15][i]})), ...shared];
  return [
    {edition:'tiered', metadata, code:source},
    {edition:'standard', metadata:standard, code:source.replace(marker, "const probabilityMode = 'standard';")},
  ];
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(JSON.stringify(buildEditions()));
}
