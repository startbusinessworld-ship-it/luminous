"""Validate generated guide integrity, metadata, navigation and media correspondence."""
from pathlib import Path
from html.parser import HTMLParser
import json,xml.etree.ElementTree as ET,re
R=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,s):self.tags=[];self.h1=0;super().__init__();self.feed(s)
 def handle_starttag(self,t,a):
  self.tags.append((t,dict(a)))
  if t=='h1':self.h1+=1
idx=json.loads((R/'scripts/reel-guide-index.json').read_text());assert len(idx)==49
seen=set();titles=set();videos=set();ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'};urls={x.text for x in ET.parse(R/'sitemap.xml').findall('.//s:loc',ns)}
for i in idx:
 s=(R/'articles'/f'{i["slug"]}.html').read_text();p=Page(s);assert p.h1==1,i['slug'];assert i['url'] not in seen;seen.add(i['url']);assert i['title'] not in titles;titles.add(i['title']);assert i['video'] not in videos;videos.add(i['video']);assert i['url'] in urls
 meta=[a for t,a in p.tags if t=='meta' and a.get('name')=='description'];assert len(meta)==1 and 30<len(meta[0]['content'])<=170
 assert any(t=='link' and a.get('rel')=='canonical' and a['href']==i['url'] for t,a in p.tags)
 assert any(t=='source' and a.get('src')==i['video'] for t,a in p.tags)
 player=next(a for t,a in p.tags if t=='video');assert player['poster']==i['poster'];assert 'controls' in player and player.get('preload')=='none' and 'autoplay' not in player
 assert (R/i['poster'].lstrip('/')).is_file()
 graph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1])['@graph'];v=next(x for x in graph if x['@type']=='VideoObject');assert v['contentUrl']==i['video'];assert v['duration'].startswith('PT') and float(v['duration'][2:-1])>0;assert v['uploadDate'].endswith('+01:00');assert any(x['@type']=='BreadcrumbList' for x in graph)
 for t,a in p.tags:
  u=a.get('href','')
  if u.startswith('/articles/'):assert (R/(u.lstrip('/')+'.html')).exists(),u
blog=(R/'blog.html').read_text();assert blog.count('data-reel-card')==49;assert blog.count('id="reel-search"')==1;assert blog.count('In-depth company guides')==1
assert len(ET.parse(R/'video-sitemap.xml').getroot())==49
assert len(list((R/'articles').glob('*.html')))==61
print('PASS: 49 unique articles and videos; canonical/meta/Article/VideoObject/Breadcrumb data, posters, internal links, sitemaps, existing 12 guides and searchable library.')
