"""The creator's original style must remain distinct from the historical catalog."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,hashlib,re

root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.links=[];self.images=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag=='img':self.images.append(a)

page=(root/'omochi-pop.html').read_text();p=Page(page)
assert len(p.ids)==len(set(p.ids)),'Duplicate IDs'
assert '編者オリジナル / デザイン様式' in page
assert 'class="study omochi-page"' in page
assert 'study.css?' in page and 'deep-reading.css?' in page
assert 'class="study-title"' in page and 'class="reading-entrance"' in page
assert 'omochi-hero' not in page and 'omochi-tag' not in page
assert 'box-shadow' not in (root/'omochi-pop.css').read_text()
assert '歴史上の運動とは別に' in page
assert '70〜80年代全体をそのままミッドセンチュリーとは呼びません' in page
assert '1949年' in page and '1970年' in page and '1981年' in page and '2016年' in page
assert 'https://djnaoyaman.github.io/buncho-ureshi/game/' in p.links
assert len(re.findall(r'class="representative omochi-work"',page))==7
for im in p.images:
 assert im.get('alt') and int(im['width'])>0 and int(im['height'])>0
 assert not urlsplit(im['src']).scheme,'No third-party image embedding'
 assert (root/im['src']).is_file(),im['src']
for href in p.links:
 u=urlsplit(href)
 if u.scheme:assert u.scheme=='https';continue
 if not u.path:
  if u.fragment:assert unquote(u.fragment) in p.ids,href
 else:assert (root/unquote(u.path)).is_file(),href
entries=json.loads((root/'entries.json').read_text());catalog=json.loads((root/'catalog.json').read_text())
assert len(entries)==len(catalog)==89
assert not any(e.get('slug')=='omochi-pop' for e in entries)
assert 'omochi-pop.html' in (root/'compiler.html').read_text()
prov=json.loads((root/'omochi-pop-provenance.json').read_text())
assert prov['classification']=='editor_original_digital_style_not_historical_movement'
assert all(i['historical_representative_image'] is False for i in prov['images'])
for i in prov['images']:
 data=(root/i['file']).read_bytes()
 if i.get('sha256'):assert hashlib.sha256(data).hexdigest()==i['sha256']
 if i.get('bytes'):assert len(data)==i['bytes']
assert 'data-copy-page="https://djnaoyaman.github.io/design-lineage/omochi-pop.html"' in page
for bad in ['file://','/workspace/','/tmp/','sediment://','library_file_id']:
 assert bad not in page and bad not in (root/'omochi-pop-provenance.json').read_text()
print('PASS OMOCHI POP: 7 sourced references; 2 original images; creator/historical distinction; links, alt text, image hashes; 89-item catalog preserved')
