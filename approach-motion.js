/* Seamless automatic motion with direct drag, swipe and keyboard control. */
(function(){
 const section=document.querySelector('#services');
 const list=section&&section.querySelector('.solution-grid');
 if(!list||section.querySelector('.approach-motion-viewport'))return;
 const viewport=document.createElement('div');viewport.className='approach-motion-viewport';viewport.id='luminos-service-cards';viewport.tabIndex=0;
 viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Luminos services. Drag, swipe or use the arrow keys to explore.');
 const track=document.createElement('div');track.className='approach-motion-track';
 const controls=document.createElement('div');controls.className='approach-motion-controls';
 const hint=document.createElement('span');hint.className='approach-motion-hint';hint.textContent='Drag or use the arrows';
 const buttons=document.createElement('div');buttons.className='approach-motion-buttons';
 function button(label,text,className){const b=document.createElement('button');b.type='button';b.className=className;b.setAttribute('aria-label',label);b.setAttribute('aria-controls',viewport.id);b.textContent=text;buttons.append(b);return b;}
 const previous=button('Previous service','←','approach-motion-arrow');
 const toggle=button('Pause automatic scrolling','Ⅱ Pause','approach-motion-toggle');
 const next=button('Next service','→','approach-motion-arrow');
 controls.append(hint,buttons);list.before(controls,viewport);track.append(list);viewport.append(track);
 const copy=list.cloneNode(true);copy.classList.add('approach-motion-copy');copy.setAttribute('aria-hidden','true');
 copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
 copy.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(node=>node.tabIndex=-1);
 track.append(copy);track.querySelectorAll('img').forEach(img=>img.draggable=false);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let motion=null,span=0,duration=0,resizeFrame=0,keyboard=false,automatic=!reduced.matches,drag=null,suppressClickUntil=0;
 function setAutomatic(value){
  automatic=value;
  toggle.textContent=value?'Ⅱ Pause':'▶ Auto-scroll';
  toggle.setAttribute('aria-label',value?'Pause automatic scrolling':'Resume automatic scrolling');
  toggle.setAttribute('aria-pressed',String(!value));
  if(motion){if(value)motion.play();else motion.pause();}
 }
 function position(){return motion&&duration?-span+(Number(motion.currentTime||0)%duration)/duration*span:0;}
 function seek(x){if(motion&&span){const phase=((x+span)%span+span)%span/span;motion.currentTime=phase*duration;}}
 function shift(pixels){setAutomatic(false);seek(position()+pixels);}
 function step(){return list.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);}
 function refresh(){
  resizeFrame=0;section.classList.add('approach-motion-ready');
  const nextSpan=list.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
  if(!nextSpan||Math.abs(nextSpan-span)<.1&&motion)return;
  const phase=motion&&duration?(Number(motion.currentTime||0)%duration)/duration:0;
  if(motion)motion.cancel();span=nextSpan;duration=span/34*1000;
  motion=track.animate([{transform:`translate3d(${-span}px,0,0)`},{transform:'translate3d(0,0,0)'}],{duration,iterations:Infinity,easing:'linear'});
  motion.currentTime=phase*duration;setAutomatic(automatic);
 }
 previous.addEventListener('click',()=>shift(step()));
 next.addEventListener('click',()=>shift(-step()));
 toggle.addEventListener('click',()=>setAutomatic(!automatic));
 // Direct interaction takes over; only the Auto-scroll button resumes motion.
 viewport.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0)return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,position:position(),moved:false};
 });
 viewport.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  if(event.pointerType==='mouse'&&event.buttons===0){release(event);return;}
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.moved){
   if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>7){drag=null;return;}
   if(Math.abs(dx)<7)return;
   drag.moved=true;setAutomatic(false);viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');
  }
  seek(drag.position+dx);
 });
 function release(event){
  if(!drag||event.pointerId!==drag.id)return;
  const moved=drag.moved;drag=null;viewport.classList.remove('is-dragging');
  if(moved)suppressClickUntil=performance.now()+350;
  if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
 }
 viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);
 viewport.addEventListener('lostpointercapture',event=>{if(event.target===viewport)release(event);});
 viewport.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();}},true);
 viewport.addEventListener('wheel',event=>{
  const horizontal=event.shiftKey?event.deltaY:event.deltaX;
  if(!horizontal||!event.shiftKey&&Math.abs(horizontal)<=Math.abs(event.deltaY))return;
  event.preventDefault();const units=event.deltaMode===1?16:event.deltaMode===2?viewport.clientWidth:1;shift(-horizontal*units);
 },{passive:false});
 document.addEventListener('keydown',event=>{if(event.key==='Tab')keyboard=true;},true);
 document.addEventListener('pointerdown',()=>{keyboard=false;},true);
 viewport.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();shift((event.key==='ArrowLeft'?1:-1)*step());}
  if(event.key==='Home'||event.key==='End'){event.preventDefault();setAutomatic(false);seek(event.key==='Home'?0:-3*step());}
 });
 viewport.addEventListener('focusin',event=>{
  if(!keyboard||!motion)return;const card=event.target.closest('.solution-card');if(!card||!list.contains(card))return;
  setAutomatic(false);const left=card.offsetLeft-list.offsetLeft;
  const target=-Math.min(left,Math.max(0,list.offsetWidth-viewport.clientWidth));
  motion.currentTime=Math.min(duration-.01,(1+target/span)*duration);
 });
 if('ResizeObserver' in window)new ResizeObserver(()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(refresh);}).observe(viewport);
 else window.addEventListener('resize',()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(refresh);});
 reduced.addEventListener('change',()=>{if(reduced.matches)setAutomatic(false);});
 refresh();
})();
