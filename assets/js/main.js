
const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

function setHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
}
setHeader();
window.addEventListener('scroll', setHeader);

function setNavOpen(open) {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('nav-open', open);
}

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    setNavOpen(!nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) setNavOpen(false);
  });
}

const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.main-nav a, .hero-nav-inline a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === current) link.classList.add('active');
});
