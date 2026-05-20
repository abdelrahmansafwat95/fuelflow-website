// FuelFlow marketing — small interactions

(function () {
  // Theme toggle
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('ff-theme', next); } catch (e) {}
    });
  }

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.setAttribute(
        'aria-expanded',
        links.classList.contains('open') ? 'true' : 'false'
      );
    });
  }

  // Contact form — graceful client-side handling
  const form = document.querySelector('form[data-form="contact"]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) return;

      const phone = form.querySelector('input[name="phone"]');
      if (phone && !/^\+?20\s?1[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/.test(phone.value.replace(/\s+/g, ' ').trim())) {
        const note = form.querySelector('[data-phone-error]');
        if (note) note.hidden = false;
        phone.focus();
        return;
      }

      const success = form.querySelector('[data-success]');
      if (success) success.hidden = false;
      form.querySelectorAll('input, select, textarea, button').forEach(el => {
        if (el.type !== 'hidden') el.disabled = true;
      });
      track('contact_form_submitted', { source: location.pathname });
    });
  }

  // Lightweight analytics stub — replace with PostHog / Plausible
  function track(event, props) {
    if (window.posthog) {
      window.posthog.capture(event, props);
    } else if (window.plausible) {
      window.plausible(event, { props });
    }
    if (window.dataLayer) {
      window.dataLayer.push({ event, ...props });
    }
  }
  window.fuelflowTrack = track;

  // Track outbound links of interest
  document.querySelectorAll('[data-track]').forEach(el => {
    el.addEventListener('click', function () {
      track(el.dataset.track, { source: location.pathname });
    });
  });

  // Scroll-reveal: auto-tag common marketing elements
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealSelectors = [
      '.section-head',
      '.card',
      '.eco-tile',
      '.sec-card',
      '.quote-card',
      '.price-card',
      '.form',
      '.hero-cta',
      '.hero-meta',
      '.hero-visual',
      '.trust-strip-inner',
      '.cta-banner > *',
      '.contact-aside',
      '.footer-col',
      '.footer-brand'
    ].join(',');

    document.querySelectorAll(revealSelectors).forEach(el => el.classList.add('reveal'));

    // Auto-stagger siblings within grids
    document.querySelectorAll('.grid-2, .grid-3, .grid-4, .eco-grid').forEach(grid => {
      Array.from(grid.children).forEach((child, i) => {
        if (i > 0 && i < 6) child.setAttribute('data-stagger', String(i));
      });
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    // Reduced motion or no IO support: show everything immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  // Button hover spotlight — track mouse position
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      btn.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  // Header shadow on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Animated number counters — opt-in via data-count
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const numFmt = new Intl.NumberFormat(document.documentElement.lang || 'en');
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        if (isNaN(target)) return;
        const duration = 1400;
        const start = performance.now();
        const initial = 0;
        const step = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const v = initial + (target - initial) * eased;
          el.textContent = numFmt.format(Math.round(v));
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = numFmt.format(target);
        };
        requestAnimationFrame(step);
        countObs.unobserve(el);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));
  }

  // Billing toggle (monthly / yearly) on the pricing page
  const billingButtons = document.querySelectorAll('.billing-toggle-btn[data-billing]');
  if (billingButtons.length) {
    const amounts = document.querySelectorAll('.price-amount[data-monthly]');
    billingButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const period = btn.getAttribute('data-billing');
        billingButtons.forEach(b => {
          const isActive = b === btn;
          b.classList.toggle('is-active', isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        amounts.forEach(el => {
          el.classList.add('is-changing');
          setTimeout(() => {
            el.textContent = el.dataset[period];
            el.classList.remove('is-changing');
          }, 180);
        });
      });
    });
  }

  // Smooth focus on anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
    });
  });
})();
