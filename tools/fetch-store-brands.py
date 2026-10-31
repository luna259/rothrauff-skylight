#!/usr/bin/env python3
"""Fetch the store's verified brand artwork; do not commit third-party logos."""
from pathlib import Path
import hashlib, json, re, urllib.request
import xml.etree.ElementTree as ET
root = Path(__file__).resolve().parent.parent
assets = root / 'skylight' / 'brands'
for entry in json.loads((assets / 'sources.json').read_text()):
    path = assets / entry['file']
    expected = entry['sha256']
    if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest() == expected:
        print(entry['brand'] + ': verified local copy')
        continue
    url = entry['source']
    if not url.startswith('https://'):
        raise ValueError('Artwork requires HTTPS')
    response = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=20)
    if not response.url.startswith('https://'):
        raise ValueError('Artwork redirected away from HTTPS')
    data = response.read(5_000_001)
    if len(data) > 5_000_000:
        raise ValueError('Artwork exceeded size limit')
    if entry.get('inline_svg'):
        html = data.decode()
        choices = re.findall(r'<svg\b.*?</svg>', html, re.S)
        candidates = [svg for svg in choices if ('icon--logo' in svg[:500] if entry['brand'] == 'magnum' else re.search(r'aria-label="logo"', svg[:500]))]
        if not candidates:
            raise ValueError('Official header logo was not found')
        data = candidates[0].replace('currentColor','#111111').encode()
    if hashlib.sha256(data).hexdigest() != expected:
        raise ValueError(entry['brand'] + ': artwork changed; review before accepting a new checksum')
    if path.suffix == '.svg':
        tree = ET.fromstring(data)
        for node in tree.iter():
            if node.tag.rsplit('}',1)[-1] in ('script','foreignObject','image','iframe'):
                raise ValueError('Active or external SVG content is not allowed')
            for key,value in node.attrib.items():
                if key.lower().startswith('on') or (key.rsplit('}',1)[-1] == 'href' and not value.startswith('#')):
                    raise ValueError('External SVG references are not allowed')
    path.write_bytes(data)
    print(entry['brand'] + ': downloaded and verified')
