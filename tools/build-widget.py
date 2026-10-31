#!/usr/bin/env python3
"""Build the reviewed TV source without local credentials or preview mocks."""
from pathlib import Path
import hashlib, json, zipfile, xml.etree.ElementTree as ET
root = Path(__file__).resolve().parent.parent
src = root / 'skylight'
out = root / 'dist' / 'RothrauffOutdoor.wgt'
ET.parse(src / 'config.xml')
out.parent.mkdir(exist_ok=True)
files = [p for p in src.rglob('*') if p.is_file() and p.name != 'mock-tizen.js']
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in sorted(files):
        rel = p.relative_to(src).as_posix()
        data = p.read_bytes()
        if rel == 'index.html':
            data = data.replace(b'  <script src="js/mock-tizen.js"></script>\n', b'')
        info = zipfile.ZipInfo(rel, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        z.writestr(info, data)
sha = hashlib.sha256(out.read_bytes()).hexdigest()
(out.parent / 'RothrauffOutdoor.sha256').write_text(f'{sha}  {out.name}\n')
print(json.dumps({'archive':str(out), 'sha256':sha, 'files':len(files)}))
