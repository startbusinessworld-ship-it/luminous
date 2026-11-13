/* Keep the four original service cards available without JavaScript. */
(function(){
 const section=document.querySelector('#services');
 const list=section&&section.querySelector('.solution-grid');
 if(!list||section.classList.contains('approach-motion-ready'))return;
 const viewport=document.createElement('div');viewport.className='approach-motion-viewport';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Luminos services — scroll to explore all four cards');
 const track=document.createElement('div');track.className='approach-motion-track';
 const controls=document.createElement('div');controls.className='approach-motion-controls';
 const toggle=document.createElement('button');toggle.type='button';toggle.className='approach-motion-toggle';toggle.setAttribute('aria-label','Pause card motion');toggle.setAttribute('aria-pressed','false');toggle.textContent='Ⅱ Pause motion';controls.append(toggle);
 list.before(controls,viewport);track.append(list);viewport.append(track);
 const copy=list.cloneNode(true);copy.classList.add('approach-motion-copy');copy.setAttribute('aria-hidden','true');
 copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
 copy.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(node=>node.tabIndex=-1);
 copy.addEventListener('mousedown',event=>{if(event.target.closest('a'))event.preventDefault();});
 track.append(copy);
 section.classList.add('approach-motion-ready');
 function setPaused(paused){section.classList.toggle('is-motion-paused',paused);toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume card motion':'Pause card motion');toggle.textContent=paused?'▶ Resume motion':'Ⅱ Pause motion';}
 toggle.addEventListener('click',()=>setPaused(!section.classList.contains('is-motion-paused')));
 viewport.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.pointerType==='pen')setPaused(true);});
 viewport.addEventListener('keydown',event=>{
  if(event.target!==viewport||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();setPaused(true);
  if(event.key==='Home')viewport.scrollLeft=0;
  else if(event.key==='End')viewport.scrollLeft=viewport.scrollWidth;
  else viewport.scrollBy({left:(event.key==='ArrowRight'?1:-1)*(list.firstElementChild.getBoundingClientRect().width+22),behavior:'smooth'});
 });
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>section.classList.toggle('is-motion-offscreen',!entries[0].isIntersecting),{rootMargin:'100px'});observer.observe(viewport);}
 document.addEventListener('visibilitychange',()=>section.classList.toggle('is-motion-offscreen',document.hidden));
})();
