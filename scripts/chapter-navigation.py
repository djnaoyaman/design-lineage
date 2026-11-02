"""Static chapter links in catalog listing order; never chronology."""
from pathlib import Path
import json, html

def navigation(site, slug, articles=None):
 entries = {e['name']: e for e in (articles if articles is not None else json.loads((site/'entries.json').read_text()))}
 ordered = [entries[c['name']] for c in json.loads((site/'catalog.json').read_text()) if c['name'] in entries]
 index = next((i for i,e in enumerate(ordered) if e['slug'] == slug), None)
 if index is None: return ''
 def link(j, rel, label):
  if not 0 <= j < len(ordered): return '<span class="chapter-boundary">'+('図録の最初です' if j < 0 else '図録の最後です')+'</span>'
  e = ordered[j]; title = html.escape(e['title_ja']); href = html.escape(e['slug']+'.html', quote=True)
  return f'<a rel="{rel}" href="{href}" aria-label="{label}の項目：{title}"><span>{"← 前の項目" if rel == "prev" else "次の項目 →"}</span><strong>{title}</strong></a>'
 return f'<nav class="chapter-navigation" aria-label="図録の掲載順で読む"><h2>図録の掲載順で読む</h2><p>{index+1} / {len(ordered)} 項目。年代順や、影響の順序ではありません。</p><div class="chapter-links">{link(index-1,"prev","前")}{link(index+1,"next","次")}</div><p class="chapter-gesture-hint">本文の中央を左へ払うと次、右へ払うと前の項目へ。画像の上や画面の端では切り替わりません。上のリンクでも移動できます。キーボードでは、リンクなどを選んでいないときに左右キーで移動できます。</p></nav>'
