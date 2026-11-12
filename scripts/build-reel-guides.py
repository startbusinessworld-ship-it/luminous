"""Build one static, indexable guide per approved Luminos reel. No network or deployment."""
from pathlib import Path
import json,re,html,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1];DATE='2026-11-12';BASE='https://www.luminoscorp.com'
def esc(s):return html.escape(str(s),quote=True)
items=json.loads((R/'scripts/reel-editorial.json').read_text());media={x['number']:x for x in json.loads((R/'media/reels/manifest.json').read_text())};blog=(R/'blog.html').read_text();header=re.search(r'<header class="unified-header"[\s\S]*?</header>',blog).group();footer=re.search(r'<footer class="unified-footer"[\s\S]*?</footer>',blog).group()
upload_dates={x['video']:x['date']+'+01:00' for x in json.loads((R/'scripts/video-upload-dates.json').read_text()) if x.get('date')}
INC='https://www.cr.gov.hk/en/faq/local-company/incorporation.htm';BANK='https://www.hkma.gov.hk/eng/smart-consumers/account-opening/information-required/';NAME='https://www.cr.gov.hk/en/faq/local-company/company-name.htm';ANNUAL='https://www.cr.gov.hk/en/compliance/annual-return/private-company.htm';RECORDS='https://www.ird.gov.hk/eng/tax/bus_rke.htm';AW='https://www.airwallex.com/en-hk'
rules={
'Formation':('Company setup and later operations are distinct. Confirm the registered-office and secretary arrangements, then plan the records and obligations that continue after incorporation.',INC,'Hong Kong Companies Registry: incorporation','why-hong-kong'),
'Remote formation':('Remote incorporation does not remove local company requirements. A registered office in Hong Kong and an eligible company secretary remain part of the setup, while banking and personal obligations require separate consideration.',INC,'Hong Kong Companies Registry: incorporation','why-hong-kong'),
'Company roles':('Ownership, management and company-secretarial responsibilities have different functions. Record the appointments accurately and check the relevant eligibility rules before filing.', 'https://www.cr.gov.hk/en/faq/local-company/directors-secretary.htm','Hong Kong Companies Registry: directors and company secretary','why-hong-kong'),
'Company names':('Company registration and brand protection serve different purposes. A proposed name should be checked under the company-name rules, with trade mark questions considered separately.',NAME,'Hong Kong Companies Registry: company names','why-hong-kong'),
'Company structure':('The company structure sets out legal relationships and responsibilities. It is not a substitute for planning operations, funding and the obligations that follow incorporation.',INC,'Hong Kong Companies Registry: incorporation','why-hong-kong'),
'Business accounts':('A financial institution reviews the business and its intended account use. Supporting documents should be genuine, relevant and consistent; no formation service can guarantee the institution’s approval.',BANK,'Hong Kong Monetary Authority: information for account opening','bank-account-guide'),
'Airwallex':('Airwallex is a financial platform, not a bank in Hong Kong. Eligibility, product availability and approval depend on its review and current terms. Images of a visit do not by themselves establish a partnership.',AW,'Airwallex: Hong Kong platform and products','bank-account-guide'),
'International business':('A company structure, payment arrangements and the rules in the countries where a business operates are separate considerations. Plan them together without assuming that incorporation settles every cross-border question.',INC,'Hong Kong Companies Registry: incorporation','why-hong-kong'),
'E-commerce':('The company and storefront should describe a consistent business. Payment-product access, record keeping and rules relevant to the markets where you operate need separate attention.',BANK,'Hong Kong Monetary Authority: information for account opening','bank-account-guide'),
'Annual obligations':('Use the company’s own documents and official notices to identify obligations and dates. Company filings, tax reporting and renewals are different processes; retain evidence of the action taken for each.',ANNUAL,'Hong Kong Companies Registry: annual returns','hong-kong-company-renewal'),
'Records':('Business records explain income, expenditure and the commercial activity behind transactions. The Inland Revenue Department describes the record-keeping and retention requirements, including a general minimum of seven years.',RECORDS,'Hong Kong Inland Revenue Department: record keeping','hong-kong-company-renewal'),
'Compliance':('Business registration does not replace any additional permission that applies to a particular activity. Check the relevant licensing requirements before relying on a certificate as authority to trade.','https://www.ird.gov.hk/eng/tax/bre_gen.htm','Hong Kong Inland Revenue Department: business registration','why-hong-kong'),
'Immigration':('Company registration is separate from permission to enter, stay or work in Hong Kong. Review the immigration rules relevant to your nationality, circumstances and intended personal activity.','https://www.immd.gov.hk/eng/services/','Hong Kong Immigration Department: services','why-hong-kong'),
'Company checks':('Official company records are useful for checking registration details. They are one part of due diligence, not a guarantee of commercial reliability or a substitute for verifying a transaction.','https://www.cr.gov.hk/en/services/obtain-company-info.htm','Hong Kong Companies Registry: company information searches','why-hong-kong'),
'Tax and setup':('Hong Kong’s territorial approach focuses on the source of profits. Offshore treatment depends on the operations and applicable rules, including any relevant foreign-sourced income provisions, rather than an automatic company label.','https://www.ird.gov.hk/eng/paf/bus_pft_tsp.htm','Hong Kong Inland Revenue Department: territorial source principle','hong-kong-offshore-tax')}
for i in items:
 m=media[i['id']];assert m['status']=='verified';i['description']=i['focus'].split('. ')[0]+'.'
 if len(i['description'])>160:i['description']=i['description'][:157].rsplit(' ',1)[0]+'…'
 i['url']=BASE+'/articles/'+i['slug'];i['video']=m['video'];i['poster']=m['poster'];i['duration']=m['duration']
for i in items:
 m=media[i['id']];context,source,label,pillar=rules[i['category']];related=[j for j in items if j['category']==i['category'] and j['id']!=i['id']][:2];desc=i['description'];url=i['url'];poster=BASE+i['poster'];duration='PT'+str(round(m['duration'],2)).rstrip('0').rstrip('.')+'S'
 article={'@type':'Article','@id':url+'#article','headline':i['title'],'description':desc,'datePublished':DATE,'dateModified':DATE,'inLanguage':'en','mainEntityOfPage':url,'author':{'@type':'Organization','name':'Luminos','url':BASE},'publisher':{'@type':'Organization','name':'Luminos','url':BASE,'logo':{'@type':'ImageObject','url':BASE+'/logo.svg'}},'image':poster,'video':{'@id':url+'#video'}}
 video={'@type':'VideoObject','@id':url+'#video','name':i['title'],'description':desc,'thumbnailUrl':[poster],'contentUrl':i['video'],'uploadDate':upload_dates[i['video']],'duration':duration,'inLanguage':'en','publisher':{'@type':'Organization','name':'Luminos'},'isFamilyFriendly':True}
 crumbs={'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'Guides','item':BASE+'/blog'},{'@type':'ListItem','position':3,'name':i['title'],'item':url}]}
 structured=json.dumps({'@context':'https://schema.org','@graph':[article,video,crumbs]},ensure_ascii=False).replace('</','<\\/')
 extra=''
 if i['category']=='Airwallex':extra='<p><a href="https://help.airwallex.com/hc/en-gb/articles/900006304303-How-do-I-get-access-to-Airwallex-s-Payments-product" rel="noopener">Airwallex: access to payment products</a> · <a href="https://help.airwallex.com/hc/en-gb/articles/900001757026-Eligibility-to-open-an-account" rel="noopener">Account eligibility</a></p>'
 if i['id']==16:extra='<p><a href="https://www.cr.gov.hk/en/services/register-company.htm">Companies Registry: company types and members’ liability</a></p>'
 if i['id']==3:extra='<p><a href="https://www.ird.gov.hk/eng/faq/fsie.htm">IRD: foreign-sourced income exemption regime</a>. Luminos’s indicative service timing is separate from official processing and account-opening timelines.</p>'
 if i['id']==33:extra='<p><a href="https://www.cr.gov.hk/en/faq/companies-ordinance/filing-requirement-change.htm">Companies Registry: notifications of changes and filing periods</a></p>'
 relatedhtml=''.join(f'<li><a href="/articles/{j["slug"]}">{esc(j["title"])}</a></li>' for j in related)
 s=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(i['title'])} | Luminos</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{url}"><link rel="icon" href="/favicon.svg">
<meta property="og:type" content="article"><meta property="og:site_name" content="Luminos"><meta property="og:title" content="{esc(i['title'])}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{poster}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(i['title'])}"><meta name="twitter:description" content="{esc(desc)}"><meta name="twitter:image" content="{poster}"><meta property="article:published_time" content="{DATE}"><meta property="article:modified_time" content="{DATE}">
<link rel="stylesheet" href="/site-design.css?v=1"><link rel="stylesheet" href="/reel-guides.css?v=1"><script src="/site-design.js?v=1" defer></script><script type="application/ld+json">{structured}</script></head>
<body data-page="reel-guide"><a class="skip-link" href="#guide">Skip to the guide</a>{header}
<main id="guide"><section class="reel-hero"><div class="reel-intro"><nav class="reel-breadcrumb" aria-label="Breadcrumb"><a href="/blog">Guides</a><span aria-hidden="true">/</span><span>{esc(i['category'])}</span></nav><p class="reel-kicker">LUMINOS · VIDEO GUIDE</p><h1>{esc(i['title'])}</h1><p class="reel-lead">{esc(i["focus"].split(". ")[0]+".")}</p><p class="reel-byline">By Luminos · <time datetime="{DATE}">12 November 2026</time> · {round(m['duration'])}-second video</p><a class="reel-text-link" href="#practical-guide">Read the practical guide ↓</a></div>
<figure class="reel-player"><video controls playsinline preload="none" poster="{i['poster']}" width="1080" height="1920" aria-label="{esc(i['title'])}"><source src="{esc(i['video'])}" type="video/mp4"><p>Your browser cannot play this video. <a href="{esc(i['video'])}">Open the video</a>.</p></video><figcaption>Watch the Luminos reel, then use the explanation below to plan your next step.</figcaption></figure></section>
<article class="reel-article" id="practical-guide"><h2>The practical answer</h2><p>{esc(i['focus'])}</p><aside class="reel-note"><h3>Keep the distinction clear</h3><p>{esc(context)} <a href="{source}">{esc(label)}</a>.</p></aside>
<h2>A practical example</h2><p>{esc(i['example'])}</p><p class="reel-small">This is an illustration of the process, not a promised outcome for an individual application.</p>
<h2>What to prepare next</h2><ol>{''.join('<li>'+esc(x)+'</li>' for x in i['steps'])}</ol>
<h2>{esc(i['question'])}</h2><p>{esc(i['answer'])}</p>
<section class="reel-sources" aria-label="Sources"><h2>Sources and further reading</h2><p>Reviewed on 12 November 2026. Use the current official requirements for your own circumstances.</p><p><a href="{source}">{esc(label)}</a></p>{extra}<p>Continue with our <a href="/articles/{pillar}">full {esc('banking' if pillar=='bank-account-guide' else 'company')} guide</a> for the wider context.</p></section>
<aside class="reel-contact"><p class="reel-kicker">YOUR NEXT STEP</p><h2>Let’s talk about your business.</h2><p>Tell Luminos what you want to build, where your customers are and the support you need. We can explain the company setup and the next steps within the agreed service scope.</p><a class="reel-button" href="/#contact">Discuss my project ↗</a></aside>
<section class="reel-related"><h2>Related video guides</h2><ul>{relatedhtml}<li><a href="/blog">Explore all Luminos guides</a></li></ul></section></article></main>{footer}</body></html>'''
 (R/'articles'/f'{i["slug"]}.html').write_text(s)
# The whole library is present in HTML, even with JavaScript disabled.
start='<!-- REEL LIBRARY START -->';end='<!-- REEL LIBRARY END -->';blog=re.sub(re.escape(start)+r'[\s\S]*?'+re.escape(end),'',blog)
cards=''.join(f'<a class="reel-guide-card" href="/articles/{i["slug"]}" data-reel-card data-category="{esc(i["category"])}"><div class="reel-card-photo"><img src="{i["poster"]}" width="480" height="854" alt="" loading="lazy"><span>▶ {round(i["duration"])} sec</span></div><div class="reel-card-copy"><p class="reel-kicker">{esc(i["category"])}</p><h3>{esc(i["title"])}</h3><p>{esc(i["description"])}</p><span class="reel-text-link">Watch &amp; read ↗</span></div></a>' for i in items)
options=''.join(f'<option value="{esc(c)}">{esc(c)}</option>' for c in sorted(rules) if any(i['category']==c for i in items))
lib=f'''{start}<section class="reel-library" aria-labelledby="video-guides"><div class="reel-library-heading"><p class="reel-kicker">WATCH. UNDERSTAND. TAKE YOUR NEXT STEP.</p><h2 id="video-guides">49 short videos.<br>Practical answers for your business.</h2><p>Company formation, business accounts and ongoing obligations — explained by the Luminos team.</p></div><div class="reel-filters"><label>Search the video guides<input id="reel-search" type="search" placeholder="Try Airwallex, director or invoices"></label><label>Topic<select id="reel-topic"><option value="">All topics</option>{options}</select></label><p id="reel-count" aria-live="polite">49 video guides</p></div><div class="reel-library-grid">{cards}</div><p id="reel-empty" hidden>No guide matches your search. Try a different word or topic.</p></section>{end}'''
blog=blog.replace('<div class="blog-inner">',lib+'<div class="blog-inner"><h2>In-depth company guides</h2>',1)
# Keep exactly one legacy heading when regenerated.
blog=blog.replace('<h2>In-depth company guides</h2><h2>In-depth company guides</h2>','<h2>In-depth company guides</h2>')
blog=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="Explore 49 short video guides on Hong Kong company formation, business accounts, Airwallex, remote setup and company records, with practical explanations.">',blog,count=1)
blog=re.sub(r'<title>[\s\S]*?</title>','<title>Hong Kong business video guides and articles | Luminos</title>',blog,count=1)
if '/reel-guides.css' not in blog:blog=blog.replace('</head>','<link rel="stylesheet" href="/reel-guides.css?v=1"><script src="/reel-guides.js?v=1" defer></script></head>')
(R/'blog.html').write_text(blog)
# Preserve existing URLs and dates; add only the new public guides.
ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns);tree=ET.parse(R/'sitemap.xml');rt=tree.getroot();known={x.find('{'+ns+'}loc').text:x for x in rt}
for i in items:
 if i['url'] not in known:
  el=ET.SubElement(rt,'{'+ns+'}url');ET.SubElement(el,'{'+ns+'}loc').text=i['url'];ET.SubElement(el,'{'+ns+'}lastmod').text=DATE
if BASE+'/blog' in known:known[BASE+'/blog'].find('{'+ns+'}lastmod').text=DATE
tree.write(R/'sitemap.xml',encoding='UTF-8',xml_declaration=True)
vns='http://www.google.com/schemas/sitemap-video/1.1';ET.register_namespace('video',vns);vrt=ET.Element('{'+ns+'}urlset')
for i in items:
 u=ET.SubElement(vrt,'{'+ns+'}url');ET.SubElement(u,'{'+ns+'}loc').text=i['url'];v=ET.SubElement(u,'{'+vns+'}video')
 for k,val in [('thumbnail_loc',BASE+i['poster']),('title',i['title']),('description',i['description']),('content_loc',i['video']),('duration',str(round(i['duration']))),('publication_date',upload_dates[i['video']])]:ET.SubElement(v,'{'+vns+'}'+k).text=val
ET.ElementTree(vrt).write(R/'video-sitemap.xml',encoding='UTF-8',xml_declaration=True)
robots=(R/'robots.txt').read_text();line='Sitemap: '+BASE+'/video-sitemap.xml'
if line not in robots:(R/'robots.txt').write_text(robots.rstrip()+'\n'+line+'\n')
(R/'scripts/reel-guide-index.json').write_text(json.dumps([{'id':i['id'],'slug':i['slug'],'title':i['title'],'category':i['category'],'url':i['url'],'video':i['video'],'poster':i['poster'],'duration':i['duration']} for i in items],indent=2))
print('Built 49 article pages, library, structured data and video sitemap')
