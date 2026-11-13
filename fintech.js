'use strict';
const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');}
menuButton.addEventListener('click',()=>{const open=navigation.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
const profiles={commerce:{image:{"src":"photos/luminos-ecommerce-meta-google-ads.webp","alt":"Laptop storefront surrounded by Shopify, Google Ads, Higgsfield, Stripe, PayPal and Meta bubbles","width":1599,"height":900,"position":"50% 50%"},tag:'E-COMMERCE',title:'You build the brand.<br>We help build the structure.',description:'Your store is growing and your customers span several countries. Build a company that fits your business model, suppliers and payment needs.',items:['Incorporation of your Hong Kong limited company','Preparation of your banking application','Documents and progress in one client portal'],cta:'Let’s talk about your store'},trade:{image:{"src":"photos/luminos-hong-kong-port-skyline.webp","alt":"Illustration of Hong Kong container port, cargo ship and skyline at blue hour","width":1672,"height":941,"position":"50% 50%"},tag:'IMPORT & EXPORT',title:'You find the opportunities.<br>We help you get started.',description:'You work with suppliers in Asia and buyers around the world. Set up your company and prepare for your international payment needs.',items:['A company structure for your contracts','A banking application that reflects your transactions','Support throughout the incorporation process'],cta:'Let’s talk about your trade'},services:{image:{"src":"photos/ailoun-office-portrait-polished.webp","alt":"Ailoun smiling at his desk in the Luminos office","width":943,"height":1667,"position":"50% 46%"},tag:'SERVICES & CONSULTING',title:'Your expertise goes global.<br>Your business follows.',description:'Consultant, agency or service provider: your clients cross borders. Explore a company structure that fits your international activity and the way you work.',items:['Company formation tailored to your activity','Documents for your business relationships','Administrative support after incorporation'],cta:'Let’s talk about your business'}};
const tabs=[...document.querySelectorAll('[data-profile]')];
function selectProfile(tab){const profile=profiles[tab.dataset.profile];tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;});document.querySelector('#profile-panel').setAttribute('aria-labelledby',tab.id);const photo=document.querySelector('#profile-panel .profile-photo img');photo.src=profile.image.src;photo.alt=profile.image.alt;photo.width=profile.image.width;photo.height=profile.image.height;photo.style.objectPosition=profile.image.position;document.querySelector('#profile-tag').textContent=profile.tag;document.querySelector('#profile-title').innerHTML=profile.title;document.querySelector('#profile-description').textContent=profile.description;document.querySelector('#profile-list').replaceChildren(...profile.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));document.querySelector('#profile-cta').replaceChildren(document.createTextNode(profile.cta+' '),Object.assign(document.createElement('span'),{textContent:'↗'}));}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectProfile(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();selectProfile(tabs[next]);tabs[next].focus();}});});
document.querySelectorAll('.china-enquiry').forEach(link=>link.addEventListener('click',()=>{document.querySelector('#project-service').value='china';}));
const projectForm=document.querySelector('#project-form');
projectForm.addEventListener('submit',event=>{event.preventDefault();if(!projectForm.reportValidity())return;const service=projectForm.elements.service;const message=['Hello Luminos,',`Name: ${projectForm.elements.name.value.trim()}`,`Email: ${projectForm.elements.email.value.trim()}`,`Project: ${service.options[service.selectedIndex].text}`, '',projectForm.elements.message.value.trim()].join('\n');const url='https://wa.me/85266455426?text='+encodeURIComponent(message);window.open(url,'_blank','noopener,noreferrer');const status=document.querySelector('#form-status');status.replaceChildren(document.createTextNode('If WhatsApp does not open, '));const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='open your message here';status.append(link);});
// Preserve referral attribution and the existing production tracking endpoint.
(function(){try{const ref=new URLSearchParams(window.location.search).get('ref');if(ref){localStorage.setItem('lum_ref',ref);localStorage.setItem('lum_ref_ts',Date.now().toString());fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:ref})}).catch(()=>{});}}catch(e){}})();

/* Progressive decorative effects; forms and navigation remain independent. */
(function(){
 if(!window.matchMedia || window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const hero=document.querySelector('.hero');
 if(hero&&!hero.querySelector('.luminos-beams')){
  const beams=document.createElement('div');beams.className='luminos-beams';beams.setAttribute('aria-hidden','true');
  for(let i=0;i<3;i++)beams.append(document.createElement('span'));
  hero.append(beams);
 }
 const logos=document.querySelector('.bank-logos');
 if(logos&&!logos.classList.contains('luminos-marquee')){
  const track=document.createElement('div');track.className='luminos-logo-track';
  while(logos.firstChild)track.append(logos.firstChild);
  const copy=track.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.querySelectorAll('img').forEach(img=>img.alt='');
  logos.append(track,copy);logos.classList.add('luminos-marquee');
 }
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
  }),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
  document.querySelectorAll('.section-heading,.benefits article,.solution-card,.banking-step,.steps li,.kit-grid figure,.team-copy,.price-card,.review-card,.resource-grid>a').forEach((node,i)=>{
   node.style.setProperty('--luminos-delay',String((i%3)*90)+'ms');node.classList.add('luminos-reveal');observer.observe(node);
  });
 }
})();
