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
