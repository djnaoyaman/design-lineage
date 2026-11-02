"""Reader-facing counts follow article data; no stale global snapshots in articles."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
entries=json.loads((root/'entries.json').read_text())
checked=0
for e in entries:
 s=(root/'entries'/f'{e["slug"]}.html').read_text()
 assert '作品の内容を説明する見出し'not in s,e['slug']
 assert '一覧に登録した項目の合計：'not in s,e['slug']
 counts=re.findall(r'この項目の実作品画像は(\d+)点、参照・関連画像は(\d+)点です',s)
 for actual,reference in counts:
  assert int(actual)==len(e.get('adopted_images',[])),e['slug']
  assert int(reference)==len(e.get('reference_images',[])),e['slug']
  checked+=1
print(f'PASS {len(entries)} articles: no editorial labels/stale global snapshots; {checked} article count notes match data')
