/* Manual-only carousel. Touch and trackpad scrolling are handled by the browser. */
(function(){
 const section=document.querySelector('#services'),list=section&&section.querySelector('.solution-grid');
 if(!list||section.querySelector('.approach-motion-viewport'))return;
 const viewport=document.createElement('div');viewport.className='approach-motion-viewport';viewport.id='luminos-service-cards';viewport.tabIndex=0;
 viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Luminos services. Swipe or use the arrow keys to explore the four cards.');
 const controls=document.createElement('div');controls.className='approach-motion-controls';
 const hint=document.createElement('span');hint.className='approach-motion-hint';hint.textContent='Swipe or drag to explore';
 const buttons=document.createElement('div');buttons.className='approach-motion-buttons';
 function button(label,text){const b=document.createElement('button');b.type='button';b.className='approach-motion-arrow';b.setAttribute('aria-label',label);b.setAttribute('aria-controls',viewport.id);b.textContent=text;buttons.append(b);return b;}
 const previous=button('Previous service','←'),next=button('Next service','→');
 controls.append(hint,buttons);list.before(controls,viewport);viewport.append(list);section.classList.add('approach-motion-ready');
 list.querySelectorAll('img').forEach(img=>img.draggable=false);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 function update(){previous.disabled=viewport.scrollLeft<=1;next.disabled=viewport.scrollLeft>=viewport.scrollWidth-viewport.clientWidth-1;}
 function move(direction){viewport.scrollBy({left:direction*(list.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(list).columnGap)),behavior:reduced.matches?'auto':'smooth'});}
 previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 viewport.addEventListener('scroll',update,{passive:true});
 viewport.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}
  if(event.key==='Home'||event.key==='End'){event.preventDefault();viewport.scrollTo({left:event.key==='Home'?0:viewport.scrollWidth,behavior:reduced.matches?'auto':'smooth'});}
 });
 // Add click-and-drag for a mouse without intercepting native touch gestures.
 let drag=null,suppressClickUntil=0;
 viewport.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  viewport.scrollTo({left:viewport.scrollLeft,behavior:'auto'});
  drag={id:event.pointerId,x:event.clientX,left:viewport.scrollLeft,moved:false};
 });
 viewport.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  if(event.buttons===0){release(event);return;}
  const dx=event.clientX-drag.x;
  if(!drag.moved){if(Math.abs(dx)<5)return;drag.moved=true;viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');}
  viewport.scrollLeft=drag.left-dx;
 });
 function release(event){if(!drag||event.pointerId!==drag.id)return;const moved=drag.moved;drag=null;viewport.classList.remove('is-dragging');if(moved)suppressClickUntil=performance.now()+350;if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);}
 viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);viewport.addEventListener('lostpointercapture',event=>{if(event.target===viewport)release(event);});
 viewport.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();}},true);
 if('ResizeObserver' in window)new ResizeObserver(update).observe(viewport);else window.addEventListener('resize',update);
 update();
})();
