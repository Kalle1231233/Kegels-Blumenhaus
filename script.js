/* =============================================
   KEGELS BLUMENHAUS – MAIN SCRIPT
============================================= */

(() => {
  'use strict';

  /* -----------------------------------------------
     NAVIGATION – STICKY SCROLL EFFECT
  ----------------------------------------------- */
  const header = document.getElementById('site-header');

  function updateHeaderOnScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();


  /* -----------------------------------------------
     MOBILE NAVIGATION TOGGLE
  ----------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav   = document.getElementById('mainNav');

  function openNav() {
    mainNav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Navigation schließen');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Navigation öffnen');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.contains('open');
    isOpen ? closeNav() : openNav();
  });

  // Close nav when a link is clicked
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close nav on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      closeNav();
      navToggle.focus();
    }
  });

  // Close nav when clicking outside
  document.addEventListener('click', e => {
    if (mainNav.classList.contains('open') &&
        !mainNav.contains(e.target) &&
        !navToggle.contains(e.target)) {
      closeNav();
    }
  });


  /* -----------------------------------------------
     SMOOTH SCROLLING FOR ANCHOR LINKS
  ----------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* -----------------------------------------------
     SCROLL ANIMATIONS (IntersectionObserver)
  ----------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(el => el.classList.add('visible'));
  }


  /* -----------------------------------------------
     BACK-TO-TOP BUTTON & FLOATING CALL CTA
  ----------------------------------------------- */
  const backToTop    = document.getElementById('backToTop');
  const floatingCall = document.getElementById('floatingCall');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 400;

    if (backToTop) {
      scrolled ? backToTop.removeAttribute('hidden') : backToTop.setAttribute('hidden', '');
    }

    // Floating phone CTA: einblenden nach Hero (ca. 600px)
    if (floatingCall) {
      floatingCall.classList.toggle('visible', window.scrollY > 600);
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* -----------------------------------------------
     OPENING HOURS – HIGHLIGHT TODAY & OPEN/CLOSED STATUS
  ----------------------------------------------- */

  // Opening schedule: day index (0=Sun) → { open, close } or null (closed)
  const SCHEDULE = {
    0: { open: 8 * 60,       close: 13 * 60 },       // Sun 08:00–13:00
    1: { open: 8 * 60,       close: 18 * 60 },        // Mon 08:00–18:00
    2: null,                                            // Tue closed
    3: { open: 8 * 60,       close: 18 * 60 },        // Wed
    4: { open: 8 * 60,       close: 18 * 60 },        // Thu
    5: { open: 8 * 60,       close: 18 * 60 },        // Fri
    6: { open: 8 * 60,       close: 15 * 60 },        // Sat 08:00–15:00
  };

  function initOpeningHours() {
    const now         = new Date();
    const dayIndex    = now.getDay(); // 0=Sun … 6=Sat
    const minuteOfDay = now.getHours() * 60 + now.getMinutes();
    const schedule    = SCHEDULE[dayIndex];
    const isOpen      = schedule !== null &&
                        minuteOfDay >= schedule.open &&
                        minuteOfDay <  schedule.close;

    // Highlight today's row in the hours table
    const hoursRows = document.querySelectorAll('.hours-row');
    hoursRows.forEach(row => {
      if (parseInt(row.dataset.day, 10) === dayIndex) {
        row.classList.add('hours-row--today');
      }
    });

    // Show open/closed status badge
    const statusEl = document.getElementById('openStatus');
    if (statusEl) {
      if (isOpen) {
        const closeTime = minutesToTimeStr(schedule.close);
        statusEl.textContent = `Jetzt geöffnet – heute bis ${closeTime} Uhr`;
        statusEl.className = 'open-status open';
      } else if (schedule !== null) {
        const openTime = minutesToTimeStr(schedule.open);
        statusEl.textContent = `Heute geschlossen – öffnet ${dayIndex === 2 ? 'nicht' : `um ${openTime} Uhr`}`;
        statusEl.className = 'open-status closed';
      } else {
        statusEl.textContent = 'Heute geschlossen';
        statusEl.className = 'open-status closed';
      }
    }
  }

  function minutesToTimeStr(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  initOpeningHours();


  /* -----------------------------------------------
     CONTACT FORM – CLIENT-SIDE VALIDATION & SUBMISSION
  ----------------------------------------------- */
  const contactForm  = document.getElementById('contactForm');
  const formSuccess  = document.getElementById('formSuccess');

  if (contactForm) {
    const fields = {
      name:    { el: document.getElementById('c-name'),    errId: 'nameError',    msg: 'Bitte geben Sie Ihren Namen ein.' },
      email:   { el: document.getElementById('c-email'),   errId: 'emailError',   msg: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
      message: { el: document.getElementById('c-message'), errId: 'messageError', msg: 'Bitte schreiben Sie Ihre Nachricht.' },
    };

    function validateEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function showError(field, message) {
      field.el.classList.add('error');
      field.el.setAttribute('aria-invalid', 'true');
      const errEl = document.getElementById(field.errId);
      if (errEl) errEl.textContent = message;
    }

    function clearError(field) {
      field.el.classList.remove('error');
      field.el.removeAttribute('aria-invalid');
      const errEl = document.getElementById(field.errId);
      if (errEl) errEl.textContent = '';
    }

    // Live validation on blur
    Object.values(fields).forEach(field => {
      field.el.addEventListener('blur', () => {
        const val = field.el.value.trim();
        if (!val) {
          showError(field, field.msg);
        } else if (field === fields.email && !validateEmail(val)) {
          showError(field, fields.email.msg);
        } else {
          clearError(field);
        }
      });

      field.el.addEventListener('input', () => {
        if (field.el.classList.contains('error')) {
          clearError(field);
        }
      });
    });

    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      // Validate all required fields
      if (!fields.name.el.value.trim()) {
        showError(fields.name, fields.name.msg);
        valid = false;
      }

      if (!fields.email.el.value.trim() || !validateEmail(fields.email.el.value.trim())) {
        showError(fields.email, fields.email.msg);
        valid = false;
      }

      if (!fields.message.el.value.trim()) {
        showError(fields.message, fields.message.msg);
        valid = false;
      }

      if (!valid) {
        // Focus first error field
        const firstError = contactForm.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate submission (replace with actual fetch/API call)
      const submitBtn = contactForm.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';

      setTimeout(() => {
        contactForm.reset();
        Object.values(fields).forEach(f => clearError(f));
        formSuccess.removeAttribute('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Nachricht senden <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 800);
    });
  }


  /* -----------------------------------------------
     ACTIVE NAV LINK BASED ON SCROLL POSITION
  ----------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.main-nav .nav-link:not(.nav-link--cta)');

  function updateActiveNav() {
    const navH  = parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--nav-h'), 10) || 72;
    const scrollY = window.scrollY + navH + 40;

    let current = '';

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();


  /* -----------------------------------------------
     MAPS LINKS – Apple Maps auf iOS, Google Maps sonst
  ----------------------------------------------- */
  const MAPS_QUERY = 'Hauptstraße+15a,+16548+Glienicke+Nordbahn';
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const mapsUrl = isIOS
    ? `maps://maps.apple.com/?q=${MAPS_QUERY}`
    : `https://maps.google.com/?q=${encodeURIComponent('Hauptstraße 15a, 16548 Glienicke Nordbahn')}`;

  ['heroBadgeMaps', 'aboutBadgeMaps'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = mapsUrl;
  });

})();
