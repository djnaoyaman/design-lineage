from pathlib import Path
from html.parser import HTMLParser
import json,re,subprocess,runpy
root=Path(__file__).resolve().parents[1]
nav=runpy.run_path(str(root/'scripts/chapter-navigation.py'))['navigation']
entries=json.loads((root/'entries.json').read_text()); byname={e['name']:e for e in entries}; ordered=[byname[c['name']] for c in json.loads((root/'catalog.json').read_text())]
for e in ordered:
 p=root/'entries'/f'{e["slug"]}.html';s=p.read_text();expected=nav(root,e['slug'])
 assert s.count('class="chapter-navigation"')==1 and expected in s
 assert s.count('../chapter-navigation.js?')==1 and s.count('../chapter-navigation.css?')==1
 assert f'https://djnaoyaman.github.io/design-lineage/entries/{e["slug"]}.html' in s
 for href in re.findall(r'<a rel="(?:prev|next)" href="([^"]+)"',expected):assert (root/'entries'/href).is_file()
 # Scope: stripping only this feature recovers original article bytes.
 stripped=s.replace(expected,'');stripped=re.sub(r'<link rel="stylesheet" href="../chapter-navigation.css\?[^\"]+">','',stripped);stripped=re.sub(r'<script src="../chapter-navigation.js\?[^\"]+" defer></script>','',stripped)
 old=subprocess.check_output(['git','show','33bdad12bdfd50466652b1ed833396d299d7fb67:entries/'+e['slug']+'.html'],cwd=root).decode()
 def dates(text):
  return re.sub(r'2026年\d\d月\d\d日 \d\d:\d\d JST','DATE',re.sub(r'2026-\d\d-\d\dT\d\d:\d\d:\d\d\+09:00','DATE',text))
 assert dates(stripped)==dates(old),e['slug']
# Input contract: an external articles list, not script repository records.
custom=[dict(e,title_ja='TEST '+e['title_ja']) for e in entries]
assert 'TEST ' in nav(root,'art-deco',custom)
print('PASS 88 exact mappings/canonicals/assets; original article bytes preserved except release-date markers; external entry input')
