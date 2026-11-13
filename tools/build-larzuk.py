"""Build a validated, deterministic mods-only Larzuk Socket Recipe ZIP."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
mod = root / 'LarzukSocketRecipe'
report = json.loads((mod/'docs/LOCAL_VALIDATION.json').read_text())
assert report['status'] == 'PASS', 'Run node tools/verify-larzuk.mjs first'
for name, digest in report['inputs'].items():
    assert hashlib.sha256((root/name).read_bytes()).hexdigest() == digest, f'Stale validation: {name}'
version = json.loads((mod/'mod.json').read_text())['version']
contents = {f'mods/{mod.name}/{name}': (mod/name).read_bytes() for name in ['mod.js','mod.json','README.md']}
for name in ['TESTING.ko.md', 'IMPLEMENTATION.ko.md']:
    contents[f'mods/{mod.name}/docs/{name}'] = (mod/'docs'/name).read_bytes()
contents[f'mods/{mod.name}/LICENSE'] = (root/'LICENSE').read_bytes()
dist = root/'dist'
dist.mkdir(exist_ok=True)
archive = dist/f'{mod.name}-{version}-mods-only.zip'
with ZipFile(archive, 'w', compression=ZIP_DEFLATED) as z:
    for entry, data in sorted(contents.items()):
        info = ZipInfo(entry, date_time=(2026,11,14,0,0,0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        z.writestr(info, data)
with ZipFile(archive) as z:
    assert z.testzip() is None and set(z.namelist()) == set(contents)
    for entry, data in contents.items():
        assert z.read(entry) == data
print(archive)
print('SHA256', hashlib.sha256(archive.read_bytes()).hexdigest())
