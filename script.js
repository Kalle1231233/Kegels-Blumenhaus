/* ============================================================
   Kegels Blumenhaus – JavaScript
   ============================================================ */

'use strict';

/* ── Mobile Navigation ──────────────────────────────────── */
const navToggle   = document.getElementById('navToggle');
const navLinks    = document.getElementById('navLinks');
const header      = document.getElementById('header');

function openNav() {
  navLinks.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Menü schließen');
}

function closeNav() {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Menü öffnen');
}

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('open');
  isOpen ? closeNav() : openNav();
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Close nav on outside click
document.addEventListener('click', e => {
  if (!header.contains(e.target)) {
    closeNav();
  }
});

// Close nav on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

/* ── Header scroll behavior ─────────────────────────────── */
function onScroll() {
  const scrolled = window.scrollY > 20;
  header.classList.toggle('scrolled', scrolled);
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ── Highlight current open hours row ───────────────────── */
function highlightTodayRow() {
  const today = new Date().getDay(); // 0 = Sunday
  const row   = document.querySelector(`.hours-row[data-day="${today}"]`);
  if (row) {
    row.classList.add('hours-row--today');
    // Remove closed style on today's row so it doesn't appear grayed out
    row.classList.remove('hours-row--closed');
  }
}

highlightTodayRow();

/* ── Scroll-to-Top Button ────────────────────────────────── */
const scrollTopBtn = document.getElementById('scrollTop');

scrollTopBtn.addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Trigger once to set initial state
onScroll();

/* ── Scroll Reveal (Intersection Observer) ──────────────── */
const revealItems = document.querySelectorAll(
  '.service-card, .occasion-card, .testimonial, .gallery-item, .why-card, .usp-item, .about-content, .about-visual'
);

function addRevealClasses() {
  revealItems.forEach((el, i) => {
    el.classList.add('reveal');
    const delay = i % 4; // cycle 0-3
    if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
  });
}

function createRevealObserver() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

if ('IntersectionObserver' in window) {
  addRevealClasses();
  createRevealObserver();
} else {
  // Fallback: show everything
  revealItems.forEach(el => el.classList.add('visible'));
}

/* ── Smooth Scroll for Anchor Links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const headerHeight = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Contact Form ────────────────────────────────────────── */
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitBtn = form.querySelector('[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.8s linear infinite;">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    Wird gesendet…
  `;

  // Simulate sending (replace with actual form submission endpoint)
  setTimeout(() => {
    form.reset();
    submitBtn.disabled  = false;
    submitBtn.innerHTML = originalText;
    formSuccess.hidden  = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide success message after 8 seconds
    setTimeout(() => {
      formSuccess.hidden = true;
    }, 8000);
  }, 1200);
});

/* ── CSS: spinner animation for submit button ───────────── */
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

/* ── Active navigation link on scroll ───────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');

function updateActiveNav() {
  const scrollPos = window.scrollY + header.offsetHeight + 60;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollPos >= top && scrollPos < bottom) {
      const id = section.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

/* Add active nav link style */
const navStyle = document.createElement('style');
navStyle.textContent = `.nav-link.active { color: var(--green-sage); font-weight: 600; }`;
document.head.appendChild(navStyle);
