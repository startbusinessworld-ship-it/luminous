// Presentation only: business flows remain in their existing page scripts.
document.querySelectorAll('.unified-header .menu-toggle').forEach(button => {
 const menu = document.getElementById(button.getAttribute('aria-controls'));
 button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
 });
 menu.addEventListener('click', event => {
  if (event.target.closest('a')) { menu.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); }
 });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {menu.classList.remove('is-open');button.setAttribute('aria-expanded','false');button.focus();}
 });
});
