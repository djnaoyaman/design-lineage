"""Public artist records must be sourced, linked, and statically readable."""
import json,re
from pathlib import Path
from urllib.parse import urlparse
from html.parser import HTMLParser
class Document(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.links=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get("id"):self.ids.append(a["id"])
  if tag=="a":self.links.append(a.get("href"))
entries=json.loads(Path('entries.json').read_text());registry=json.loads(Path('artists.json').read_text());people=registry['artists']
assert registry['schema_version']==1
assert len({p['id'] for p in people})==len(people)
for p in people:
 assert re.fullmatch('[a-z0-9-]+',p['id'])
 for field in ['name_ja','name_kana','name_original','short_bio','sources','chapter_relationships','representative_works','verified_at']:assert p.get(field),(p['id'],field)
 if p.get('birth_year') is not None and p.get('death_year') is not None:assert p['birth_year']<=p['death_year']
 assert p.get('death_year') is not None or p.get('life_status') in ['verified_living','unknown']
 for source in p['sources']:
  assert urlparse(source['url']).scheme=='https' and source['institution'] and source['verified_at']
 for work in p['representative_works']:assert work['title_ja'] and work['date_label'] and work['work_type'] and urlparse(work['source_url']).scheme=='https'
 for rel in p['chapter_relationships']:
  e=next(e for e in entries if e['slug']==rel['chapter_id']);assert p['id'] in e['artist_ids']
for e in entries:
 if not e.get('artist_ids'):continue
 text=Path('entries',e['slug']+'.html').read_text();html=Document(text)
 assert sum(x.startswith('artist-') for x in html.ids)==len(e['artist_ids'])
 for ident in e['artist_ids']:
  p=next(p for p in people if p['id']==ident);assert 'artist-'+ident in html.ids and p['short_bio'] in text
  for source in p['sources']:assert source['url'] in html.links
  for work in p['representative_works']:assert work['source_url'] in html.links
for marker in ['/workspace/','/tmp/','libfile_','sediment://','QA-ONLY']:
 assert marker not in Path('artists.json').read_text()
print(f'PASS {len(people)} sourced profiles and their static article links')
