/* The source cards remain available when JavaScript or motion is disabled. */
(function(){
 const section=document.querySelector('#services');
 const list=section&&section.querySelector('.solution-grid');
 if(!list||section.querySelector('.approach-motion-viewport'))return;
 const viewport=document.createElement('div');viewport.className='approach-motion-viewport';
 viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Luminos services');
 const track=document.createElement('div');track.className='approach-motion-track';
 list.before(viewport);track.append(list);viewport.append(track);
 const copy=list.cloneNode(true);copy.classList.add('approach-motion-copy');copy.setAttribute('aria-hidden','true');
 copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
 copy.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(node=>node.tabIndex=-1);
 track.append(copy);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let motion=null,span=0,duration=0,resizeFrame=0,keyboard=false;
 function refresh(){
  resizeFrame=0;
  if(reduced.matches){
   if(motion)motion.cancel();motion=null;span=0;
   section.classList.remove('approach-motion-ready');section.classList.add('approach-motion-static');return;
  }
  section.classList.remove('approach-motion-static');section.classList.add('approach-motion-ready');
  const next=list.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
  if(!next||Math.abs(next-span)<.1&&motion)return;
  const phase=motion&&duration?(Number(motion.currentTime||0)%duration)/duration:0;
  const paused=motion&&motion.playState==='paused';
  if(motion)motion.cancel();span=next;duration=span/34*1000;
  motion=track.animate([{transform:`translate3d(${-span}px,0,0)`},{transform:'translate3d(0,0,0)'}],{duration,iterations:Infinity,easing:'linear'});
  motion.currentTime=phase*duration;
  if(paused)motion.pause();
 }
 // Pointer interaction never pauses or restarts the ribbon.
 document.addEventListener('keydown',event=>{if(event.key==='Tab')keyboard=true;},true);
 document.addEventListener('pointerdown',()=>{keyboard=false;if(motion&&motion.playState==='paused')motion.play();},true);
 viewport.addEventListener('mousedown',event=>{if(event.target.closest('a'))event.preventDefault();});
 // Keyboard users can read and activate each original card without chasing it.
 viewport.addEventListener('focusin',event=>{
  if(!keyboard||!motion||reduced.matches)return;
  const card=event.target.closest('.solution-card');if(!card||!list.contains(card))return;
  motion.pause();
  const left=card.offsetLeft-list.offsetLeft;
  const target=-Math.min(left,Math.max(0,list.offsetWidth-viewport.clientWidth));
  motion.currentTime=Math.min(duration-.01,(1+target/span)*duration);
 });
 viewport.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(motion&&!viewport.contains(document.activeElement))motion.play();}));
 if('ResizeObserver' in window)new ResizeObserver(()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(refresh);}).observe(viewport);
 else window.addEventListener('resize',()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(refresh);});
 reduced.addEventListener('change',refresh);
 refresh();
})();
