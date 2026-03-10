/* ============================================
   Silicon Valley Software House
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
  // 4. BOOTCAMP TIMELINE (Scroll-driven)
  // ==========================================

  const timeline = document.querySelector('.bootcamp__timeline');

  if (timeline) {
    const trackFill = timeline.querySelector('.bootcamp__track-fill');
    const weeks = timeline.querySelectorAll('.bootcamp__week');
    const phases = timeline.querySelectorAll('.bootcamp__phase');
    // Phase boundaries as fractions of the 8-week track
    // Phase 1: W1 (0–12.5%), Phase 2: W2–5 (12.5–62.5%), Phase 3: W6–7 (62.5–87.5%), Phase 4: W8 (87.5–100%)
    const phaseBounds = [0.125, 0.625, 0.875, 1.0];

    var maxProgress = 0;

    function updateTimeline() {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start filling when timeline enters bottom of viewport,
      // finish when it reaches top quarter
      const start = vh;
      const end = vh * 0.25;
      const raw = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));

      // Only go forward, never backward
      if (raw > maxProgress) maxProgress = raw;
      var progress = maxProgress;

      // Update track fill
      if (trackFill) {
        trackFill.style.setProperty('--track-progress', (progress * 100) + '%');
      }

      // Light up week markers
      weeks.forEach(function (w, i) {
        var threshold = (i + 1) / 8;
        w.classList.toggle('lit', progress >= threshold);
      });

      // Activate phase card that the progress bar is currently in
      var activeIdx = -1;
      for (var p = 0; p < phaseBounds.length; p++) {
        if (progress > (p === 0 ? 0 : phaseBounds[p - 1])) {
          activeIdx = p;
        }
      }
      phases.forEach(function (phase, i) {
        phase.classList.toggle('active', i === activeIdx);
      });
    }

    var timelineTicking = false;
    window.addEventListener('scroll', function () {
      if (!timelineTicking) {
        requestAnimationFrame(function () {
          updateTimeline();
          timelineTicking = false;
        });
        timelineTicking = true;
      }
    }, { passive: true });

    // Initial state
    updateTimeline();
  }

  // ==========================================
  // 5. ANIMATED COUNTERS (Metrics Section)
  // ==========================================

  const counters = document.querySelectorAll('.metrics__number');
  let countersAnimated = false;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if (counters.length > 0) {
    const metricsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersAnimated) {
            countersAnimated = true;
            counters.forEach(animateCounter);
            metricsObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    const metricsSection = document.getElementById('metrics');
    if (metricsSection) metricsObserver.observe(metricsSection);
  }

  // ==========================================
  // 6. WAITLIST FORM (Google Form Integration)
  // ==========================================

  const form = document.getElementById('waitlist-form');
  const formStatus = document.getElementById('form-status');

  if (form) {
    // -------------------------------------------------------
    // CONFIGURE: Replace these with your Google Form values
    // 1. Create a Google Form with one "Email" field
    // 2. Get the form action URL (inspect form HTML or use pre-filled link)
    // 3. Get the entry field name (e.g., entry.123456789)
    // -------------------------------------------------------
    const GOOGLE_FORM_URL = ''; // e.g., 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse'
    const GOOGLE_FORM_EMAIL_FIELD = ''; // e.g., 'entry.123456789'

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = form.querySelector('.cta__input').value;

      if (!email) return;

      if (!GOOGLE_FORM_URL) {
        // Placeholder mode — show success without submitting
        formStatus.textContent = 'Thank you! We\'ll be in touch soon.';
        formStatus.className = 'cta__status cta__status--success';
        form.querySelector('.cta__input').value = '';
        return;
      }

      // Submit to Google Form
      const formData = new FormData();
      formData.append(GOOGLE_FORM_EMAIL_FIELD, email);

      fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      })
        .then(() => {
          formStatus.textContent = 'Thank you! We\'ll be in touch soon.';
          formStatus.className = 'cta__status cta__status--success';
          form.querySelector('.cta__input').value = '';
        })
        .catch(() => {
          formStatus.textContent = 'Something went wrong. Please try again.';
          formStatus.className = 'cta__status cta__status--error';
        });
    });
  }
})();
