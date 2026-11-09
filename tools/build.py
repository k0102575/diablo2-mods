"""Build deterministic rune downgrade installation ZIPs from the multi-mod repo."""
import hashlib
import json
import subprocess
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
mod = root / 'ProbabilisticRuneDowngrade'
version = json.loads((mod / 'mod.json').read_text())['version']
report = json.loads((mod / 'docs/LOCAL_VALIDATION.json').read_text())
assert report['status'] == 'PASS', 'Run local validation first'
for name, digest in report['inputs'].items():
    assert hashlib.sha256((root/name).read_bytes()).hexdigest() == digest, f'Stale validation: {name}'
dist = root / 'dist'
dist.mkdir(exist_ok=True)
runtime = {f'mods/{mod.name}/{name}': (mod/name).read_bytes() for name in ['mod.js', 'mod.json']}
runtime[f'mods/{mod.name}/CREDITS.md'] = (mod/'CREDITS.md').read_bytes()
assets = {}
for name in ['glowing-runes.json', 'hammer-icon.json']:
    assets.update(json.loads((mod/'research'/name).read_text())['files'])
actual_assets = {p.relative_to(mod).as_posix() for p in (mod/'hd').rglob('*') if p.is_file()}
assert actual_assets == set(assets), 'Unexpected or missing bundled assets'
for name, info in sorted(assets.items()):
    data = (mod/name).read_bytes()
    assert hashlib.sha256(data).hexdigest() == info['sha256'], f'Asset changed: {name}'
    runtime[f'mods/{mod.name}/{name}'] = data
# Use the exact edition code/configuration exercised by the Node verifier.
editions = json.loads(subprocess.check_output(
    ['node', str(root/'tools/package-editions.mjs')], text=True
))
assert {e['edition'] for e in editions} == {'tiered', 'standard'}
assert all(report.get('checksByEdition', {}).get(e['edition'], 0) > 0 for e in editions), 'Both editions must pass validation'

def build(name, contents):
    archive = dist/name
    with ZipFile(archive, 'w', compression=ZIP_DEFLATED) as z:
        for entry, data in sorted(contents.items()):
            assert not entry.startswith('/') and '..' not in entry.split('/')
            info = ZipInfo(entry, date_time=(2026,11,2,0,0,0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, data)
    with ZipFile(archive) as z:
        assert z.testzip() is None
        assert set(z.namelist()) == set(contents)
        for entry, data in contents.items():
            assert z.read(entry) == data
        assert f'mods/{mod.name}/mod.json' in z.namelist()
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    (dist/(archive.name+'.sha256')).write_text(digest+'  '+archive.name+'\n')
    print(f'{archive}\nSHA256 {digest}\n{len(contents)} files verified')

for edition in editions:
    label = edition['edition']
    contents = dict(runtime)
    contents[f'mods/{mod.name}/mod.js'] = edition['code'].encode()
    contents[f'mods/{mod.name}/mod.json'] = (json.dumps(edition['metadata'], ensure_ascii=False, indent=2)+'\n').encode()
    full = dict(contents)
    for name in ['README.md', 'CHANGELOG.md']:
        full[name] = (mod/name).read_bytes()
    full['LICENSE'] = (root/'LICENSE').read_bytes()
    for path in sorted((mod/'docs').glob('*')):
        if path.is_file():
            full['docs/'+path.name] = path.read_bytes()
    manifest = {name: hashlib.sha256(data).hexdigest() for name, data in sorted(full.items())}
    full['MANIFEST.sha256.json'] = (json.dumps(manifest, indent=2)+'\n').encode()
    minimal = dict(contents)
    minimal[f'mods/{mod.name}/LICENSE.txt'] = (root/'LICENSE').read_bytes()
    build(f'{mod.name}-{version}-{label}.zip', full)
    build(f'{mod.name}-{version}-{label}-mods-only.zip', minimal)
