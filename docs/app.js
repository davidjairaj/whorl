(() => {
  'use strict';
  const slides = [
    { image: './assets/tutorial/open-moon.png', title: 'Your shortcuts, together.', description: 'Tap the centre button to open or close your shortcuts.', alt: 'Whorl’s Moon button with eight shortcuts arranged around it.' },
    { image: './assets/tutorial/open-moon.png', title: 'Choose each shortcut.', description: 'Long-press a shortcut. Choose its action and what it opens, then tap Save.', alt: 'The open Moon ring, with the Camera shortcut highlighted as an example to long-press.', callout: 'shortcut' },
    { image: './assets/tutorial/button-picker.png', title: 'Find your favourite.', description: 'Tap the palette below the ring. Choose from twelve button designs.', alt: 'Whorl’s native design picker showing all twelve button designs.' },
    { image: './assets/tutorial/open-vinyl.png', title: 'Home is still home.', description: 'Tap the house below the ring to return to your original Home screen.', alt: 'Whorl with a Vinyl button and the original Home screen control highlighted below the ring.', callout: 'home' }
  ];
  let currentSlide = 0;
  const slideImage = document.getElementById('slide-image');
  const previous = document.getElementById('previous-slide');
  const next = document.getElementById('next-slide');
  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    const slide = slides[currentSlide];
    slideImage.src = slide.image;
    slideImage.alt = slide.alt;
    const callout = document.getElementById('screen-callout');
    callout.hidden = !slide.callout;
    callout.dataset.target = slide.callout || '';
    document.getElementById('slide-title').textContent = slide.title;
    document.getElementById('slide-description').textContent = slide.description;
    document.getElementById('slide-position').textContent = `${currentSlide + 1} / ${slides.length}`;
  }
  previous.disabled = false;
  next.disabled = false;
  previous.addEventListener('click', () => showSlide(currentSlide - 1));
  next.addEventListener('click', () => showSlide(currentSlide + 1));

  const fields = document.getElementById('signup-fields');
  const submit = document.getElementById('signup-submit');
  const form = document.getElementById('signup-form');
  const message = document.getElementById('signup-message');
  const counter = document.getElementById('remaining-count');
  const availability = document.getElementById('availability-label');
  const availabilityNote = document.getElementById('availability-note');
  let apiOrigin = null;
  let isOpen = false;
  let submitting = false;
  let verifiedRequestSent = false;
  let refreshTimer;
  const localNames = new Set(['localhost', '127.0.0.1', '[::1]']);
  function readOrigin(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const url = new URL(value);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Invalid configuration');
    const localDevelopment = localNames.has(location.hostname) && localNames.has(url.hostname) && url.protocol === 'http:';
    if (url.protocol !== 'https:' && !localDevelopment) throw new Error('Invalid configuration');
    return url.origin;
  }
  function setMessage(text, kind = '') {
    message.textContent = text;
    message.dataset.kind = kind;
    message.classList.toggle('sr-only', !kind && !submitting && !verifiedRequestSent);
  }
  function syncForm() {
    fields.disabled = !isOpen || submitting || verifiedRequestSent;
    submit.disabled = fields.disabled;
  }
  function unavailable(note = 'Registration is not open yet. Please check back.') {
    isOpen = false;
    counter.textContent = '—';
    availability.textContent = 'Registration not open';
    availabilityNote.textContent = 'Availability will appear here when the test opens.';
    syncForm();
    if (!verifiedRequestSent && !submitting) setMessage(note);
  }
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      return await fetch(url, { ...options, signal: controller.signal, credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer' });
    } finally { clearTimeout(timer); }
  }
  async function refreshStatus() {
    if (!apiOrigin || document.hidden || submitting) return;
    try {
      const response = await request(`${apiOrigin}/api/status`);
      if (!response.ok) throw new Error('Status unavailable');
      const status = await response.json();
      if (status.capacity !== 20 || !Number.isInteger(status.remaining) || status.remaining < 0 || status.remaining > 20 || typeof status.open !== 'boolean') throw new Error('Invalid status');
      isOpen = status.open && status.remaining > 0;
      counter.textContent = String(status.remaining).padStart(2, '0');
      availability.textContent = status.remaining === 0 ? 'All places are filled' : isOpen ? 'Free places remaining' : 'Registration not open';
      availabilityNote.textContent = isOpen ? 'Confirmed after email verification, while codes remain.' : status.remaining === 0 ? 'Thank you for your interest in Whorl.' : 'The closed test is being prepared.';
      syncForm();
      if (!verifiedRequestSent) setMessage(isOpen ? 'We’ll email a link to verify your address.' : status.remaining === 0 ? 'The first twenty places have been filled.' : 'Registration is not open yet. Please check back.');
    } catch {
      unavailable('We can’t check availability right now. Please try again shortly.');
      availability.textContent = 'Availability unavailable';
      availabilityNote.textContent = 'Please check back shortly.';
    }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!apiOrigin || !isOpen || submitting || verifiedRequestSent || !form.reportValidity()) return;
    const email = document.getElementById('signup-email').value.trim();
    const adult = document.getElementById('signup-adult').checked;
    const website = document.getElementById('signup-website').value;
    submitting = true;
    syncForm();
    setMessage('Requesting your verification email…');
    try {
      const response = await request(`${apiOrigin}/api/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, country: 'IN', adult, website }) });
      if (!response.ok) {
        if (response.status === 429) throw new Error('Please wait a few minutes before trying again.');
        if (response.status === 409) throw new Error('Registration has closed. Please check availability again.');
        if (response.status === 400) throw new Error('Please check your email and eligibility confirmation.');
        throw new Error('Your request could not be confirmed. Please try again shortly.');
      }
      const result = await response.json();
      if (result.accepted !== true) throw new Error('Your request could not be confirmed. Please try again shortly.');
      verifiedRequestSent = true;
      setMessage('If your address is eligible, a verification email will arrive shortly. Check your inbox and spam folder. Your place is confirmed after verification, while codes remain.');
    } catch (error) {
      const text = error.name === 'AbortError' || error instanceof TypeError ? 'Your request could not be confirmed. Please wait a moment before trying again.' : error.message;
      setMessage(text, 'error');
    } finally {
      submitting = false;
      syncForm();
    }
  });
  async function start() {
    try {
      const response = await request('./signup-config.json');
      if (!response.ok) throw new Error('Configuration unavailable');
      const config = await response.json();
      apiOrigin = readOrigin(config.apiOrigin);
      if (!apiOrigin) { unavailable(); return; }
      await refreshStatus();
      refreshTimer = setInterval(refreshStatus, 30000);
    } catch { unavailable(); }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshStatus(); });
  window.addEventListener('pagehide', () => clearInterval(refreshTimer), { once: true });
  start();
})();
