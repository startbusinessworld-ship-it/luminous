/* Enhance only the e-commerce artwork; the approved image remains the fallback. */
(function(){
 const panel=document.querySelector('#profile-panel'),photo=panel&&panel.querySelector('.profile-photo');
 if(!photo||photo.querySelector('.ecommerce-stage'))return;
 const sprite='/photos/luminos-ecommerce-meta-google-ads.webp';
 const bubbles=[
  {name:'Shopify',x:268,y:151,r:117,path:'M268 151 C320 180 320 278 449 319'},
  {name:'Google Ads',x:1315,y:148,r:124,path:'M1315 148 C1265 238 1230 264 1119 296'},
  {name:'Stripe',x:171,y:418,r:121,path:'M171 418 C267 408 309 451 439 453'},
  {name:'Higgsfield',x:1416,y:410,r:136,path:'M1416 410 C1320 386 1258 464 1123 454'},
  {name:'PayPal',x:181,y:676,r:120,path:'M181 676 C260 684 319 605 432 586'},
  {name:'Meta',x:1358,y:696,r:127,path:'M1358 696 C1270 701 1202 636 1127 609'}
 ];
 const stage=document.createElement('div');stage.className='ecommerce-stage';stage.setAttribute('aria-hidden','true');
 const base=new Image();base.className='ecommerce-base';base.src='/photos/luminos-ecommerce-laptop-background.webp';base.alt='';base.width=1599;base.height=900;base.decoding='async';stage.append(base);
 const ns='http://www.w3.org/2000/svg';
 const lines=document.createElementNS(ns,'svg');lines.setAttribute('viewBox','0 0 1599 900');lines.classList.add('ecommerce-connections');lines.setAttribute('focusable','false');
 for(const [i,b] of bubbles.entries()){
  for(const kind of ['line','pulse']){const path=document.createElementNS(ns,'path');path.setAttribute('d',b.path);path.setAttribute('pathLength','1');path.classList.add('ecommerce-connection-'+kind);path.style.setProperty('--line-delay',i*90+'ms');path.style.setProperty('--pulse-delay',-i*.52+'s');lines.append(path);}
 }
 stage.append(lines);
 for(const [i,b] of bubbles.entries()){
  const anchor=document.createElement('div');anchor.className='ecommerce-bubble';anchor.dataset.logo=b.name;
  anchor.style.left=b.x/1599*100+'%';anchor.style.top=b.y/900*100+'%';anchor.style.width=b.r*2/1599*100+'%';
  anchor.style.setProperty('--enter-delay',i*95+'ms');anchor.style.setProperty('--float-time',(4.6+i*.37)+'s');anchor.style.setProperty('--float-delay',(-i*.83)+'s');
  const reveal=document.createElement('div');reveal.className='ecommerce-bubble-reveal';
  const float=document.createElement('div');float.className='ecommerce-bubble-float';
  // Crop the approved artwork in SVG so the brand marks retain their exact pixels.
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`${b.x-b.r} ${b.y-b.r} ${b.r*2} ${b.r*2}`);svg.setAttribute('focusable','false');
  const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),circle=document.createElementNS(ns,'circle');
  const id='ecommerce-logo-clip-'+i;clip.id=id;clip.setAttribute('clipPathUnits','userSpaceOnUse');circle.setAttribute('cx',b.x);circle.setAttribute('cy',b.y);circle.setAttribute('r',b.r);clip.append(circle);defs.append(clip);svg.append(defs);
  const image=document.createElementNS(ns,'image');image.setAttribute('href',sprite);image.setAttribute('width','1599');image.setAttribute('height','900');image.setAttribute('clip-path',`url(#${id})`);svg.append(image);
  float.append(svg);reveal.append(float);anchor.append(reveal);stage.append(anchor);
 }
 photo.append(stage);
 let ready=false,inView=false;
 function update(){
  const active=ready&&panel.getAttribute('aria-labelledby')==='tab-commerce';
  photo.classList.toggle('has-ecommerce-motion',active);stage.classList.toggle('is-active',active);
  stage.classList.toggle('is-playing',active&&inView&&!document.hidden);
  if(active&&inView)stage.classList.add('has-entered');
  if(!active)stage.classList.remove('has-entered');
 }
 new MutationObserver(update).observe(panel,{attributes:true,attributeFilter:['aria-labelledby']});
 document.addEventListener('visibilitychange',update);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;update();},{threshold:.2}).observe(photo);
 else inView=true;
 const preload=new Image();preload.src=sprite;
 Promise.all([base.decode(),preload.decode()]).then(()=>{ready=true;update();}).catch(()=>stage.remove());
})();
