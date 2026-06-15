
const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

function setHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
}
setHeader();
window.addEventListener('scroll', setHeader);

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.main-nav a, .hero-nav-inline a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === current) link.classList.add('active');
});
