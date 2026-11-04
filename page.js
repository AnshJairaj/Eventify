/* =====================================================
   Eventify – page.js  (How it works / Contact / About page)
   Small script: theme toggle, navbar, scroll effects, copy email
   ===================================================== */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ic = name => `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const THEME_KEY = 'eventify_theme'; // same key as the main site, so the choice carries over

function savedTheme() {
  try { const t = JSON.parse(localStorage.getItem(THEME_KEY)); if (t === 'light' || t === 'dark') return t; } catch { /* ignore */ }
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#themeBtn').innerHTML = ic(theme === 'dark' ? 'moon' : 'sun');
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#0a0a14' : '#f5f5fb';
  try { localStorage.setItem(THEME_KEY, JSON.stringify(theme)); } catch { /* ignore */ }
}

function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 3100);
}

// Theme
setTheme(savedTheme());
$('#themeBtn').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

// Mobile menu
const menu = $('#menuBtn'), navLinks = $('#navLinks');
const setMenu = open => { navLinks.classList.toggle('open', open); menu.setAttribute('aria-expanded', open); menu.innerHTML = ic(open ? 'x' : 'menu'); };
menu.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
$$('#navLinks a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Scroll progress bar
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#scrollBar').style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
}, { passive: true });

// Reveal on scroll
const reveal = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); }
}), { threshold: .12 });
$$('.reveal').forEach(el => reveal.observe(el));

// Highlight the nav link of the section in view
const links = $$('#navLinks a[href^="#"]');
const secObs = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['how', 'support', 'contact', 'about'].forEach(id => secObs.observe($('#' + id)));

// Copy email buttons (contact + support)
$$('[data-email]').forEach(btn => btn.addEventListener('click', async () => {
  const email = btn.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    toast('Email copied: ' + email);
  } catch {
    toast('Copy failed – please copy ' + email + ' manually');
  }
}));
