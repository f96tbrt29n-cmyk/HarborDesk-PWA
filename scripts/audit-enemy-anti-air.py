"""Audit Wiki enemy equipment and formations; emit facts to stdout only.

No fuzzy ship aliases or guessed equipment IDs. Same-name variants are retained
as alternatives; the runtime uses their independent maxima as a conservative
model. Equipment combinations must match the Wiki total AA exactly.
"""
import concurrent.futures
from collections import defaultdict
from fractions import Fraction
import importlib.util
import itertools
import json
import math
from pathlib import Path
import re
import sys
import unicodedata
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('map_audit', ROOT / 'scripts/audit-map-air.py')
map_audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(map_audit)
COMMIT = 'f45f36fdc8caddf8f78c287e599dcab0cb5d5c68'
MASTER = f'https://raw.githubusercontent.com/Tibowl/api_start2/{COMMIT}/start2.json'
SHIP_SOURCES = ['https://wikiwiki.jp/kancolle/敵艦船/テーブル', 'https://wikiwiki.jp/kancolle/敵艦船/テーブル2']


def norm(value):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', value)).replace('―', 'ー')


def fetch(url):
    request = Request(quote(url, safe=':/'), headers={'User-Agent': 'HarborDesk-data-audit/1.0'})
    with urlopen(request, timeout=45) as response:
        return response.read().decode('utf-8')


def rows(html):
    parser = map_audit.Tables()
    parser.feed(html)
    return [row for table in parser.tables for row in map_audit.grid(table)]


def coefficients(item):
    kind, icon = item['api_type'][2:4]
    if kind == 21:
        weighted, bonus = 6, Fraction(1, 5)
    elif icon == 16 or kind == 36:
        weighted, bonus = 4, Fraction(7, 20)
    elif kind in [12, 13]:
        weighted, bonus = 3, Fraction(2, 5)
    elif kind == 18:
        weighted, bonus = 0, Fraction(3, 5)
    else:
        weighted, bonus = 0, Fraction(1, 5)
    aa = item['api_tyku']
    return aa, weighted * aa, bonus * aa


def ships(master, tables):
    equipment = defaultdict(list)
    for item in master['api_mst_slotitem']:
        if item['api_id'] >= 1500:
            equipment[norm(item['api_name'])].append(item)
    candidates = defaultdict(list)
    problems = defaultdict(set)
    for source, table in tables:
        for row in rows(table):
            if len(row) != 23 or not row[0].isdigit():
                continue
            name = norm(row[1])
            gear = [x for x in row[16:21] if x]
            if not row[9].isdigit() or not row[10].isdigit():
                problems[name].add('素対空・装備込み対空が未確定')
                continue
            if any(norm(g) not in equipment for g in gear):
                problems[name].add('装備ID未照合：' + '・'.join(g for g in gear if norm(g) not in equipment))
                continue
            base, total = int(row[9]), int(row[10])
            options = [list(set(coefficients(x) for x in equipment[norm(g)])) for g in gear]
            profiles = set()
            for variant in itertools.product(*options):
                if sum(x[0] for x in variant) != total - base:
                    continue
                weighted = 2 * math.isqrt(total) + sum(x[1] for x in variant)
                bonus = math.floor(sum((x[2] for x in variant), Fraction(0)))
                profiles.add((weighted, bonus))
            if not profiles:
                problems[name].add('装備込み対空と装備IDを照合できない')
                continue
            for weighted, bonus in sorted(profiles):
                candidates[name].append({'id': int(row[0]), 'weighted': weighted, 'bonus': bonus, 'totalAA': total, 'equipment': gear, 'source': source})
    result = {}
    for name in sorted(candidates.keys() | problems.keys()):
        profiles = candidates[name]
        if problems[name] or not profiles:
            result[name] = {'known': False, 'reason': ' / '.join(sorted(problems[name]))}
        else:
            variants = len(set((p['weighted'], p['bonus']) for p in profiles))
            result[name] = {'known': True, 'weighted': max(p['weighted'] for p in profiles), 'bonus': max(p['bonus'] for p in profiles), 'source': profiles[0]['source'], 'ids': sorted(set(p['id'] for p in profiles)), 'variants': variants}
    return result


def formations(pair):
    map_id, data = pair
    indices = None
    found = defaultdict(set)
    for row in rows(fetch(data['source'])):
        if all(h in row for h in ['出現場所', 'パターン', '出現艦船', '敵制空値', '陣形']):
            indices = {h: row.index(h) for h in ['出現場所', 'パターン', '出現艦船', '敵制空値', '陣形']}
            continue
        if indices is None or len(row) <= max(indices.values()):
            continue
        label, pattern, enemy, air, formation = [row[indices[h]] for h in indices]
        node = re.match(r'^([A-Z]+[0-9]*)\s*[:：]', label)
        if not node or not re.search(r'パターン\s*\d', pattern):
            continue
        for p in data['nodes'].get(node.group(1), {}).get('patterns', []):
            numeric = re.match(r'^\d+', air)
            power = int(numeric.group()) if numeric else None
            if p['name'] == pattern and p['enemy'] == enemy and (p['air'] == power or p['air'] == 0 and not air.strip('-－―')):
                matched = [f + '陣' for f in re.findall(r'(単縦|複縦|輪形|梯形|単横|警戒)(?:陣)?', formation)]
                key = (node.group(1), p['name'], p['enemy'], p['air'])
                if matched and re.sub(r'(単縦|複縦|輪形|梯形|単横|警戒)(?:陣)?|[\s・、,/／]', '', formation) == '':
                    found[key].update(matched)
                else:
                    found[key].add('未確定：' + (formation or '陣形空欄'))
    result = {}
    for node, item in data['nodes'].items():
        result[node] = [sorted(found[(node, p['name'], p['enemy'], p['air'])]) for p in item['patterns']]
    return map_id, result


if __name__ == '__main__':
    data = json.loads((ROOT / 'map-air-data.js').read_text().split('const HD_MAP_AIR_DATA=', 1)[1].strip().rstrip(';'))
    master = json.loads(fetch(MASTER))
    tables = [(source, fetch(source)) for source in SHIP_SOURCES]
    profiles = ships(master, tables)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        formation_data = dict(pool.map(formations, data.items()))
    result = {'checkedAt': '2026-10-08', 'masterCommit': COMMIT, 'shipSources': SHIP_SOURCES, 'ships': profiles, 'formations': formation_data}
    print(json.dumps(result, ensure_ascii=False, separators=(',', ':')))
    print(f"AA profiles: {sum(p['known'] for p in profiles.values())}/{len(profiles)}", file=sys.stderr)
