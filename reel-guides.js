// Search enhances an already rendered, crawlable library; no video is auto-loaded.
(() => {
 const input=document.getElementById('reel-search');
 const topic=document.getElementById('reel-topic');
 if(!input||!topic)return;
 const cards=[...document.querySelectorAll('[data-reel-card]')];
 const count=document.getElementById('reel-count');
 const empty=document.getElementById('reel-empty');
 const update=()=>{
  const term=input.value.trim().toLocaleLowerCase();
  let visible=0;
  for(const card of cards){
   const matches=(!topic.value||card.dataset.category===topic.value)&&card.textContent.toLocaleLowerCase().includes(term);
   card.hidden=!matches;
   if(matches)visible++;
  }
  count.textContent=`${visible} video guide${visible===1?'':'s'}`;
  empty.hidden=visible!==0;
 };
 input.addEventListener('input',update);
 topic.addEventListener('change',update);
})();
