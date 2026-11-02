#!/usr/bin/env python3
"""Render selected normalized articles only; never writes the existing site/catalog.
Images must be explicitly assigned public assets/... local_file paths by the writer.
"""
import argparse,html,json,re
from pathlib import Path,PurePosixPath
from datetime import datetime,timezone,timedelta
from urllib.parse import urlsplit
BASE='https://djnaoyaman.github.io/design-lineage/'
E=lambda x:html.escape(str(x),quote=True)
def url(x):
 x=str(x or '')
 if urlsplit(x).scheme not in ('http','https'):raise ValueError('Expected public source URL')
 return E(x)
def pp(value):
 values=value if isinstance(value,list) else [value]
 out=[]
 for v in values:
  if not v:continue
  # A paragraph remains natural Japanese; long supplied leads get sentence breaks.
  chunks=re.findall(r'.+?(?:。|$)',str(v)) if len(str(v))>130 else [str(v)]
  out.extend('<p>'+E(c)+'</p>' for c in chunks if c)
 return ''.join(out)
def link(u,label):return f'<a href="{url(u)}" target="_blank" rel="noopener noreferrer">{E(label)} ↗</a>'
def public_asset(im):
 f=im.get('local_file','')
 if not f:return None
 p=PurePosixPath(f)
 if p.is_absolute() or '..' in p.parts or not f.startswith('assets/'):raise ValueError('Image local_file must be public assets/...')
 return f

def image_html(im,reference=False):
 f=public_asset(im)
 if not f:return ''
 w,h=im.get('width'),im.get('height')
 if not isinstance(w,int) or not isinstance(h,int) or w<=0 or h<=0:raise ValueError('Image dimensions required')
 label='参照・関連資料を見る' if reference else '実作品を見る'
 desc=im.get('alt',im.get('title',''))
 variants=im.get('display_derivatives',{}).get('variants',[])
 variants=[v for v in variants if v.get('local_file') and public_asset(v) and isinstance(v.get('width'),int)]
 variants.sort(key=lambda v:v['width'])
 display=next((v['local_file'] for v in variants if v['width']>=min(w,1000)),variants[-1]['local_file'] if variants else f)
 srcset=(' srcset="'+', '.join('../'+E(v['local_file'])+' '+str(v['width'])+'w' for v in variants)+'" sizes="(max-width:700px) 88vw, 1200px"') if variants else '' 
 notes=im.get('visual_notes') or ([dict(title='ここを見てみよう。',text=im['viewing_point'])] if im.get('viewing_point') else [])
 # A single note spans all columns; no empty three-column desktop layout.
 observations=''.join(f'<article{chr(32)+"style="+chr(34)+"grid-column:1/-1"+chr(34) if len(notes)==1 else ""}><h3>{E(n.get("title","見る手がかり"))}</h3>{pp(n.get("text",""))}</article>' for n in notes)
 rights=''.join(pp(im.get(k,'')) for k in ['license','underlying_work_rights','reproduction_rights','reuse_notice','image_processing','territory_note','role'])
 rights+=pp(im.get('presentation',{}).get('provenance_note',''))
 if im.get('original_image',{}).get('url'):rights+=link(im['original_image']['url'],'出典先の原画像を開く')
 if im.get('license_url'):rights+=link(im['license_url'],'画像の利用条件')
 if im.get('display_derivatives'):rights+=pp(im['display_derivatives'].get('method',''))
 return f'''<figure id="{E(im.get('presentation',{}).get('anchor') or im.get('id',''))}" class="collected-art{' reference-art' if reference else ''}"><p class="eyebrow">{label}</p><a class="art-fullsize" href="../{E(f)}" target="_blank" rel="noopener noreferrer"><img src="../{E(display)}"{srcset} width="{w}" height="{h}" alt="{E(desc)}" style="width:{min(w,1200)}px;max-width:100%;height:auto;object-fit:contain{chr(59)+"image-rendering:pixelated" if im.get("rendering")=="pixelated" else ""}" loading="lazy" decoding="async"></a><p class="preview-error" hidden>画像を表示できませんでした。下の出典ページで確認できます。</p><figcaption><h2>{E(im.get('title',''))}</h2>{pp(' / '.join(str(im.get(k,'')) for k in ['author','year'] if im.get(k)))}{pp(im.get('presentation',{}).get('scope_note',''))}<div class="art-observations">{observations}</div><p class="credit">{E(im.get('credit',''))}</p>{link(im['source_page'],'出典で作品・資料を見る')}<details><summary>画像の記録と、利用条件</summary>{rights}</details></figcaption></figure>'''

def representative(w,n):
 intro=w.get('reading_intro') or {};heading=intro.get('heading') or w.get('title_ja') or w.get('title','')
 original=w.get('title_original') or w.get('title','');label='原題' if w.get('title_original') else '作品名（出典表記）'
 kind=w.get('example_kind') or w.get('domain','')
 lines=intro.get('lead') or [w.get('reason','')]
 record=pp(' / '.join(str(w.get(k,'')) for k in ['creator','date','domain'] if w.get(k)))
 if w.get('title_display_note'):record+=pp(w['title_display_note'])
 record+=pp(w.get('limitation',''))
 if w.get('reason') and w.get('reason') not in lines:record+=pp(w['reason'])
 return f'''<article class="representative"><span class="work-no">{n:02}</span><div><h3>{E(heading)}</h3><p class="note">{E(kind)}</p>{pp(lines)}{link(w.get('evidence') or w.get('source_url'),'作品・資料の出典を見る')}<details class="work-record"><summary>作品・資料の記録を読む</summary><p>{label}：{E(original)}</p>{record}</details></div></article>'''

def render(entry,template,stamp):
 slug=entry['slug'];title=entry['title_ja'];canonical=BASE+'entries/'+slug+'.html'
 if not re.fullmatch(r'[a-z0-9-]+',slug):raise ValueError('Unsafe slug')
 header=re.search(r'<header\b.*?</header>',template,re.S)[0]
 header=re.sub(r'compare.html\?a=[^"<>]+','compare.html?a='+slug,header)
 footer=re.search(r'<footer\b.*?</footer>',template,re.S)[0]
 footer=re.sub(r'data-copy-page="[^"]+"','data-copy-page="'+canonical+'"',footer)
 footer=re.sub(r'<time datetime="[^"]+">[^<]+</time>',f'<time datetime="{stamp}">{datetime.fromisoformat(stamp).strftime("%Y年%m月%d日 %H:%M JST")}</time>',footer)
 styles=''.join(re.findall(r'<link rel="stylesheet"[^>]+>',template))
 meta=json.dumps({'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':canonical+'#page','url':canonical,'name':title+' — DESIGN LINEAGE','description':entry['summary'],'inLanguage':'ja','dateModified':stamp,'isPartOf':{'@id':BASE+'#website'}},{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'図鑑','item':BASE},{'@type':'ListItem','position':2,'name':title,'item':canonical}]}]},ensure_ascii=False).replace('<','\\u003c')
 head=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="index,follow"><title>{E(title)} — DESIGN LINEAGE</title><meta name="description" content="{E(entry['summary'])}">{styles}<link rel="canonical" href="{canonical}"><meta name="dateModified" content="{stamp}"><meta property="og:site_name" content="DESIGN LINEAGE"><meta property="og:title" content="{E(title)} — DESIGN LINEAGE"><meta property="og:description" content="{E(entry['summary'])}"><meta property="og:url" content="{canonical}"><meta property="og:type" content="article"><meta property="og:locale" content="ja_JP"><meta property="og:image" content="{BASE}assets/design-lineage-og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="DESIGN LINEAGE — デザイン表現史"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{BASE}assets/design-lineage-og.png"><link rel="icon" type="image/png" sizes="32x32" href="../assets/icon-32.png"><link rel="apple-touch-icon" sizes="180x180" href="../assets/icon-180.png"><link rel="manifest" href="../site.webmanifest"><script type="application/ld+json" id="site-update-metadata">{meta}</script></head><body><a class="skip" href="#main">本文へ</a>{header}'''
 if entry.get('deep_dive') and slug!='art-nouveau' and 'deep-reading.css' not in head:
  head=head.replace('</head>','<link rel="stylesheet" href="../deep-reading.css?v=20261102-0953"></head>')
 actual=[i for i in entry.get('adopted_images',[]) if public_asset(i)]
 refs=[i for i in entry.get('reference_images',[]) if public_asset(i)]
 status=f'作品・制作の例{len(entry.get("representatives",[]))}件を紹介しています。実作品画像{len(actual)}点、参照・関連画像{len(refs)}点。画像の収集は継続中です。'
 intro=entry.get('reading_intro') or {};lead=intro.get('lead') or [entry['summary']]
 title_markup='<span class="title-word">アール・</span><wbr><span class="title-word">ヌーヴォー</span>' if slug=='art-nouveau' and title=='アール・ヌーヴォー' else E(title)
 title_attrs=''
 if entry.get('title_segments'):
  if ''.join(entry['title_segments'])!=title:raise ValueError('Title segments must preserve exact title')
  title_markup='<wbr>'.join('<span class="title-part">'+E(part)+'</span>' for part in entry['title_segments'])
  title_attrs=' class="segmented-title'+(' compact-title' if entry.get('compact_title') else '')+'"'
  if 'chapter-titles.css' not in head:head=head.replace('</head>','<link rel="stylesheet" href="../chapter-titles.css?v=20261102-0921"></head>')
 questions=''.join('<li>'+E(x)+'</li>' for x in intro.get('looking_questions',[]))
 body=f'''<main id="main" tabindex="-1" class="study"><p class="study-status">{status}</p><div class="study-title"><p class="eyebrow">{E(entry['type'])}</p><h1{title_attrs}>{title_markup}</h1><p class="ja-title">{E(entry['name'])}</p><dl><div><dt>時期</dt><dd>{E(entry['period'])}</dd></div><div><dt>地域</dt><dd>{E(entry['region'])}</dd></div></dl></div><section class="reading-entrance"><h2>{E(intro.get('heading') or title)}</h2>{pp(lead)}{('<ul class="looking-questions" aria-label="見るときの問い">'+questions+'</ul>') if questions else ''}</section>'''
 body+='<nav class="article-index" aria-label="このページの目次"><h2>気になるところから読む</h2><ul><li><a href="#actual-works">実作品を大きく見る</a></li><li><a href="#representative-works">作品の記録を読む</a></li><li><a href="#deeper-story">背景と地域の違い</a></li><li><a href="#article-timeline">年表</a></li><li><a href="#article-glossary">ことばの意味</a></li></ul></nav>' if entry.get('deep_dive') else ''
 if entry.get('deep_dive'):
  body+='<details class="article-image-index"><summary>掲載画像から選ぶ（'+str(len(actual))+'点）</summary><ul>'+''.join('<li><a href="#'+E(im.get('presentation',{}).get('anchor') or im['id'])+'">'+E(im['title'])+'</a></li>' for im in actual)+'</ul></details>'
 body+='<div id="actual-works">'+''.join(image_html(i).replace('loading="lazy"','loading="eager"',1) if n==0 else image_html(i) for n,i in enumerate(actual))+''.join(image_html(i,True) for i in refs)+'</div>'
 if not actual:body+='<p class="note">実作品の画像は、まだ掲載していません。下の出典リンクから作品を確かめられます。参照図や説明図は、実作品の画像とは別に数えます。</p>'
 body+='<section id="representative-works"><h2 class="study-section-title">'+E(entry.get('example_section_label') or '作品・制作の例を見比べる。')+'</h2>'+pp(entry.get('canonical_status_note',''))
 body+=''.join(representative(w,i) for i,w in enumerate(entry.get('representatives',[]),1))+'</section>'
 if entry.get('deep_dive'):
  body+='<section id="deeper-story" class="article-story"><h2 class="study-section-title">もっとよく見るための、背景とつながり</h2>'
  sources={x.get('id'):x for x in entry['sources'] if x.get('id')}
  def source_links(ids):
   return '<p class="note">'+ ' / '.join(link(sources[x]['url'],sources[x].get('institution') or sources[x].get('title','出典')) for x in ids if x in sources)+'</p>' if ids else ''
  for block in entry['deep_dive']:
   body+='<section id="'+E(block['id'])+'"><h3>'+E(block['title'])+'</h3>'+pp(block['paragraphs'])+source_links(block.get('source_ids',[]))+'</section>'
  if entry.get('regional_variants'):
   body+='<section><h3>地域ごとの名前と、形の違い</h3><div class="regional-notes">'
   for region in entry['regional_variants']:
    body+='<article><h4>'+E(region['name'])+'</h4>'+pp(region.get('place',''))+pp(region['description'])+source_links(region.get('source_ids',[]))+'</article>'
   body+='</div></section>'
  related=entry.get('related_articles')
  if related is None and slug=='art-nouveau':related=[{'slug':'arts-and-crafts','title':'アーツ・アンド・クラフツ'},{'slug':'art-deco','title':'アール・デコ'},{'slug':'vienna-secession','title':'ウィーン分離派'}]
  if related:
   if any(not re.fullmatch(r'[a-z0-9-]+',x['slug']) for x in related):raise ValueError('Unsafe related article slug')
   body+='<nav aria-label="関連する記事"><p>'+ ' / '.join('<a href="'+E(x['slug'])+'.html">'+E(x['title'])+'</a>' for x in related)+'</p></nav>'
  body+='</section>'
 if entry.get('timeline'):
  body+='<section id="article-timeline" class="article-story"><h2 class="study-section-title">流れを、年表で見る</h2><dl class="article-timeline">'
  for item in entry['timeline']:body+='<div><dt>'+E(item['date'])+'</dt><dd>'+pp(item['event'])+source_links(item.get('source_ids',[]))+'</dd></div>'
  body+='</dl></section>'
 glossary=entry.get('glossary') or entry.get('reader_glossary',[])
 if glossary:
  body+='<details id="article-glossary" class="article-deeper"><summary>ことばの意味</summary><dl>'+''.join('<dt><ruby>'+E(g['term'])+'<rp>（</rp><rt>'+E(g.get('reading',''))+'</rt><rp>）</rp></ruby></dt><dd>'+E(g['explanation'])+'</dd>' for g in glossary)+'</dl></details>'
 body+='<details class="article-deeper"><summary>もう少し知る：背景と、つながり</summary><section class="study-overview"><h2>どんな背景で生まれた？</h2>'+pp(entry['context'])+'</section>'
 body+='<section><h2>'+E(entry.get('recognition_section_label') or 'よく見るための手がかり')+'</h2><div class="study-views">'
 for key,label in [('color','色'),('type','文字'),('form','形・素材'),('composition','どこに、どう置く？')]:
  body+='<article><h3>'+label+'</h3>'+pp(entry.get('recognition',{}).get(key,''))+'</article>'
 body+='</div></section><section class="study-context"><h2>ほかの表現との、つながり</h2>'+pp(entry['comparison'])+'<h2>'+E(entry.get('modern_section_label') or 'いま、考えてみること')+'</h2>'+pp(entry['modern'])+'</section></details>'
 if entry.get('technical_history_examples'):
  body+='<details class="article-deeper"><summary>つくる道具の歴史：作品とは別の参考資料</summary>'+''.join(representative(w,i) for i,w in enumerate(entry['technical_history_examples'],1))+'</details>'
 body+='<section class="sources"><h2>調べた資料</h2><ol>'
 seen_sources=set()
 for s in entry['sources']:
  if s['url'] in seen_sources:continue
  seen_sources.add(s['url'])
  body+='<li>'+link(s['url'],' — '.join(v for v in [s.get('institution'),s.get('title')] if v) or '出典資料')+'</li>'
 body+='</ol>'+pp(entry.get('representativeness_limit',''))+'<p class="note">'+status+'</p></section></main>'
 scripts=''.join(re.findall(r'<script src="[^\"]+"[^>]*></script>',template))
 return head+body+footer+scripts+'</body></html>\n'

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--entries',type=Path,required=True);ap.add_argument('--site',type=Path,required=True);ap.add_argument('--out',type=Path,required=True);ap.add_argument('--slugs',nargs='*');ap.add_argument('--stamp');ap.add_argument('--allow-existing',action='store_true');args=ap.parse_args()
 site=args.site.resolve();out=args.out.resolve()
 if out==site or site in out.parents:raise SystemExit('Output must be outside the existing site')
 existing={p.stem for p in (site/'entries').glob('*.html')};entries=json.loads(args.entries.read_text());entries=[e for e in entries if args.slugs is None or e['slug'] in args.slugs]
 if not args.allow_existing and any(e['slug'] in existing for e in entries):raise SystemExit('Refusing to regenerate existing article')
 if len({e['slug'] for e in entries})!=len(entries):raise SystemExit('Duplicate slugs')
 stamp=args.stamp or datetime.now(timezone(timedelta(hours=9))).replace(second=0,microsecond=0).isoformat()
 template=(site/'entries/flat-design.html').read_text();(out/'entries').mkdir(parents=True,exist_ok=True)
 for e in entries:
  text=render(e,template,stamp)
  for prohibited in ['/tmp/','/workspace/','libfile_','sediment://','QA-ONLY-manifest']:
   if prohibited in text:raise ValueError('Private data in rendered HTML')
  (out/'entries'/f'{e["slug"]}.html').write_text(text)
 print(json.dumps({'rendered':len(entries),'examples':sum(len(e.get('representatives',[])) for e in entries),'existing_pages_modified':0,'stamp':stamp},ensure_ascii=False))
if __name__=='__main__':main()
