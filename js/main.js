/* ============================================
   SV & CO
   Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // ==========================================
  // 1. SCROLL REVEAL (Intersection Observer)
  // ==========================================

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ==========================================
  // 2. NAVIGATION
  // ==========================================

  const nav = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');

  // Scroll detection for nav background
  let lastScrollY = 0;
  let ticking = false;

  function updateNav() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // Mobile menu toggle
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ==========================================
  // 3. STICKY SCROLL (Problem Section)
  // ==========================================

  const problemSection = document.getElementById('problem');

  if (problemSection && window.innerWidth > 768) {
    const cards = problemSection.querySelectorAll('.problem__card');

    function updateProblemCards() {
      const rect = problemSection.getBoundingClientRect();
      const sectionHeight = problemSection.offsetHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight - window.innerHeight)));

      const totalCards = cards.length;
      const activeIndex = Math.min(
        totalCards - 1,
        Math.floor(progress * totalCards)
      );

      cards.forEach((card, i) => {
        card.classList.toggle('active', i === activeIndex);
      });
    }

    let problemTicking = false;
    window.addEventListener('scroll', () => {
      if (!problemTicking) {
        requestAnimationFrame(() => {
          updateProblemCards();
          problemTicking = false;
        });
        problemTicking = true;
      }
    }, { passive: true });

    // Initial state
    updateProblemCards();
  } else if (problemSection) {
    // On mobile, show all cards
    problemSection.querySelectorAll('.problem__card').forEach((card) => {
      card.classList.add('active');
    });
  }

  // ==========================================
  // 4. CONTACT FORM (Google Sheet via Apps Script)
  // ==========================================

  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (form) {
    // -------------------------------------------------------
    // CONFIGURE: paste your Google Apps Script Web App URL here.
    // Submissions are appended as a row to your Google Sheet.
    // Setup steps: see README.md ("Contact Form → Google Sheet").
    // Leave empty to run in placeholder mode (form shows success
    // but does not send anywhere yet).
    // -------------------------------------------------------
    const GOOGLE_SHEET_ENDPOINT = ''; // e.g. 'https://script.google.com/macros/s/AKfy.../exec'

    function setStatus(message, kind) {
      formStatus.textContent = message;
      formStatus.className = 'cta__status' + (kind ? ' cta__status--' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      // Name, email, and message are required; company is optional.
      if (!name || !email || !message) {
        setStatus('Please fill in your name, email, and message.', 'error');
        return;
      }

      if (!GOOGLE_SHEET_ENDPOINT) {
        // Placeholder mode — not yet wired to a Google Sheet.
        setStatus('Thanks! Your message has been received. We\'ll be in touch soon.', 'success');
        form.reset();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setStatus('Sending…', '');

      fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: data,
      })
        .then(function () {
          setStatus('Thanks! Your message has been sent. We\'ll be in touch soon.', 'success');
          form.reset();
        })
        .catch(function () {
          setStatus('Something went wrong. Please try again or email us directly.', 'error');
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  // ==========================================
  // 5. INTERNATIONALIZATION (i18n)
  // ==========================================

  var currentLang = localStorage.getItem('lang') || 'en';
  var translations = null;

  function applyTranslations(lang) {
    if (lang === 'en') {
      // Restore original English from data attributes
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        if (el.dataset.i18nOriginal !== undefined) {
          el.innerHTML = el.dataset.i18nOriginal;
        }
      });
      // Restore original English placeholders
      document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
        if (el.dataset.i18nPhOriginal !== undefined) {
          el.setAttribute('placeholder', el.dataset.i18nPhOriginal);
        }
      });
      updateLangButtons('en');
      document.documentElement.lang = 'en';
      localStorage.setItem('lang', 'en');
      currentLang = 'en';
      return;
    }

    if (translations) {
      swapText(translations);
      return;
    }

    // Determine base path for i18n files
    var base = '';
    var scripts = document.querySelectorAll('script[src*="main.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src');
      // If script src starts with ./ or ../ or js/, adjust base
      if (src.indexOf('js/') === 0) {
        base = '';
      }
    }

    fetch(base + 'i18n/th.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        translations = data;
        swapText(data);
      })
      .catch(function (err) {
        console.warn('i18n: Could not load Thai translations', err);
      });
  }

  function swapText(data) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      if (data[key]) {
        // Store original English HTML on first swap
        if (el.dataset.i18nOriginal === undefined) {
          el.dataset.i18nOriginal = el.innerHTML;
        }
        el.innerHTML = data[key];
      }
    });
    // Translate input/textarea placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var phKey = el.dataset.i18nPh;
      if (data[phKey]) {
        if (el.dataset.i18nPhOriginal === undefined) {
          el.dataset.i18nPhOriginal = el.getAttribute('placeholder') || '';
        }
        el.setAttribute('placeholder', data[phKey]);
      }
    });
    updateLangButtons('th');
    document.documentElement.lang = 'th';
    localStorage.setItem('lang', 'th');
    currentLang = 'th';
  }

  function updateLangButtons(lang) {
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      var isActive = btn.dataset.lang === lang;
      btn.classList.toggle('footer__lang-btn--active', isActive);
    });
  }

  // Language toggle click handlers
  document.querySelectorAll('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.dataset.lang;
      if (lang !== currentLang) {
        applyTranslations(lang);
      }
    });
  });

  // Apply saved language on load
  if (currentLang === 'th') {
    applyTranslations('th');
  }
})();
