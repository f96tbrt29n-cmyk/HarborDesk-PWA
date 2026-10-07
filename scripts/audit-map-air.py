"""Read public Wiki enemy tables; emit JSON to stdout, never edit project files.

Only enemy-table air columns are read. Row/column spans are expanded first;
superiority/supremacy columns are deliberately ignored. Samples are not route
guarantees and include every listed HQ/gauge variation.
"""
import concurrent.futures
import json
import re
from html.parser import HTMLParser
from urllib.parse import quote
from urllib.request import Request, urlopen


class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.stack.append({'rows': [], 'row': None, 'cell': None})
        if not self.stack:
            return
        table = self.stack[-1]
        if tag == 'tr':
            table['row'] = []
        if tag in ('td', 'th'):
            attrs = dict(attrs)
            table['cell'] = ['', int(attrs.get('rowspan', 1)), int(attrs.get('colspan', 1))]
        if tag == 'br' and table['cell']:
            table['cell'][0] += ' '

    def handle_data(self, data):
        if self.stack and self.stack[-1]['cell'] is not None:
            self.stack[-1]['cell'][0] += data

    def handle_endtag(self, tag):
        if not self.stack:
            return
        table = self.stack[-1]
        if tag in ('td', 'th') and table['cell'] is not None:
            if table['row'] is not None:
                table['row'].append(table['cell'])
            table['cell'] = None
        if tag == 'tr' and table['row'] is not None:
            table['rows'].append(table['row'])
            table['row'] = None
        if tag == 'table':
            self.tables.append(self.stack.pop()['rows'])


def grid(rows):
    carry = {}
    for cells in rows:
        row = {col: value for col, (value, ttl) in carry.items()}
        carry = {col: (value, ttl - 1) for col, (value, ttl) in carry.items() if ttl > 1}
        col = 0
        for raw, rowspan, colspan in cells:
            while col in row:
                col += 1
            value = re.sub(r'\s+', ' ', raw).strip()
            for offset in range(colspan):
                row[col + offset] = value
                if rowspan > 1:
                    carry[col + offset] = (value, rowspan - 1)
            col += colspan
        yield [row.get(i, '') for i in range(max(row, default=-1) + 1)]


REGIONS = ['鎮守府', '南西諸島', '北方', '西方', '南方', '中部', '南西']
COUNTS = [6, 5, 5, 5, 6, 5, 5]


def audit(pair):
    world, area = pair
    key = f'{world}-{area}'
    source = f'https://wikiwiki.jp/kancolle/{REGIONS[world - 1]}海域/{key}'
    request = Request(quote(source, safe=':/'), headers={'User-Agent': 'HarborDesk-data-audit/1.0'})
    with urlopen(request, timeout=40) as response:
        html = response.read().decode('utf-8')
    parser = Tables()
    parser.feed(html)
    nodes = {}
    for table in parser.tables:
        indices = None
        for row in grid(table):
            if '出現場所' in row and '敵制空値' in row and '出現艦船' in row:
                indices = {name: row.index(name) for name in ['出現場所', '敵制空値', '出現艦船', 'パターン']}
                continue
            if indices is None or len(row) <= max(indices.values()):
                continue
            label, pattern, enemy, air = [row[indices[name]] for name in ['出現場所', 'パターン', '出現艦船', '敵制空値']]
            match = re.match(r'^([A-Z]+[0-9]*)\s*[:：]', label)
            if not match or not re.search(r'パターン\s*\d', pattern):
                continue
            # A blank air cell in this table means no enemy air power; other
            # non-numeric values stay unknown rather than being coerced to zero.
            numeric = re.match(r'^\d+', air)
            aviation = re.search(r'空母|軽母|飛行場|離島|集積|港湾|ヒ船団|深海海月|泊地水鬼', enemy)
            power = int(numeric.group()) if numeric else 0 if (not air or air in ['-', '－', '―']) and not aviation else None
            node = nodes.setdefault(match.group(1), {'label': label, 'patterns': []})
            sample = {'name': pattern, 'enemy': enemy, 'air': power}
            if sample not in node['patterns']:
                node['patterns'].append(sample)
    if not nodes:
        raise ValueError(key + ': no enemy-table nodes parsed')
    return key, {'source': source, 'checkedAt': '2026-10-07', 'nodes': nodes}


if __name__ == '__main__':
    maps = [(world, area) for world, count in enumerate(COUNTS, 1) for area in range(1, count + 1)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        result = dict(pool.map(audit, maps))
    print(json.dumps(result, ensure_ascii=False, separators=(',', ':')))
