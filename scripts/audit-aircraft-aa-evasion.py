"""Read the Wiki evasion table and strictly match ordinary aircraft to the master.

Emit JSON only. Jets and base aircraft remain outside the main-fleet loss model.
"""
from datetime import date
from decimal import Decimal
import importlib.util
import json
from pathlib import Path
import re
import sys
import unicodedata
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://wikiwiki.jp/kancolle/対空砲火'
CATEGORIES = {'艦上攻撃機', '艦上爆撃機', '水上爆撃機'}


def norm(value):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', value)).replace('―', 'ー')


def audit(html):
    spec = importlib.util.spec_from_file_location('map_audit', ROOT / 'scripts/audit-map-air.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    parser = module.Tables()
    parser.feed(html)
    text = (ROOT / 'ship-master-snapshot.js').read_text()
    master = json.loads(text.split('window.HD_KANCOLLE_MASTER_SNAPSHOT=', 1)[1].rstrip().removesuffix(';'))
    names = {}
    for name, item in master['equipment'].items():
        names.setdefault(norm(name), []).append((name, item))
    aircraft = {}
    for table in parser.tables:
        for row in module.grid(table):
            if len(row) != 6 or row[0] not in CATEGORIES or not re.fullmatch(r'0\.\d+', row[2]):
                continue
            candidates = names.get(norm(row[1]), [])
            if len(candidates) != 1:
                raise ValueError('Ambiguous or missing master name: ' + row[1])
            name, item = candidates[0]
            if item['typeName'] != row[0]:
                raise ValueError('Aircraft category mismatch: ' + name)
            weighted, fleet = [int(Decimal(x) * 100) for x in row[2:4]]
            if not 0 < weighted <= 100 or not 0 < fleet <= 100:
                raise ValueError('Invalid coefficient: ' + name)
            value = {'name': name, 'id': item['id'], 'category': row[0], 'weightedPercent': weighted, 'fleetPercent': fleet}
            key = norm(name)
            if key in aircraft and aircraft[key] != value:
                raise ValueError('Conflicting evasion: ' + name)
            aircraft[key] = value
    if len(aircraft) != 30:
        raise ValueError(f'Review changed source coverage before updating: {len(aircraft)} aircraft')
    return {'checkedAt': date.today().isoformat(), 'source': SOURCE + '#avoid_AAfire', 'aircraft': aircraft}


if __name__ == '__main__':
    if len(sys.argv) > 1:
        html = Path(sys.argv[1]).read_text()
    else:
        request = Request(quote(SOURCE, safe=':/'), headers={'User-Agent': 'HarborDesk-data-audit/1.0'})
        with urlopen(request, timeout=45) as response:
            html = response.read().decode('utf-8')
    print(json.dumps(audit(html), ensure_ascii=False, indent=1))
