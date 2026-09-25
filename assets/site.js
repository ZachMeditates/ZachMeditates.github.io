(() => {
  const root = document.documentElement;
  const THEMES = ['light', 'dark', 'retro'];
  const NAMES = { light: 'light', dark: 'dark', retro: '90s' };
  const btn = document.getElementById('theme-toggle');
  const picks = [...document.querySelectorAll('[data-theme-pick]')];
  const current = () => root.dataset.theme
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const show = () => {
    const now = current();
    const next = THEMES[(THEMES.indexOf(now) + 1) % THEMES.length];
    if (btn) btn.setAttribute('aria-label', `Theme: ${NAMES[now]}. Switch to ${NAMES[next]}.`);
    picks.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.themePick === now)));
  };
  const set = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) { /* not kept */ }
    show();
  };
  show();
  if (btn) btn.addEventListener('click', () => set(THEMES[(THEMES.indexOf(current()) + 1) % THEMES.length]));
  picks.forEach((p) => p.addEventListener('click', () => set(p.dataset.themePick)));
})();
(() => {
  const form = document.getElementById('su-form');
  if (!form) return;
  const note = document.getElementById('su-note');
  const send = document.getElementById('su-send');
  const say = (text, isError) => { note.textContent = text; note.classList.toggle('err', !!isError); };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const key = form.elements.access_key.value.trim();

    const bad = (field, text) => {
      field.setAttribute('aria-invalid', 'true');
      field.focus();
      say(text, true);
    };
    form.elements.name.removeAttribute('aria-invalid');
    form.elements.email.removeAttribute('aria-invalid');
    if (!name) return bad(form.elements.name, 'Add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(form.elements.email, 'That email address looks incomplete.');
    if (!key) return say('Sign up is not switched on yet, so nothing was sent.', true);

    send.disabled = true;
    say('Sending...');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.success) throw new Error(out.message || 'not sent');
      form.reset();
      say('Thanks. You will hear back soon.');
    } catch {
      say('That did not go through. Please try again in a minute.', true);
    } finally {
      send.disabled = false;
    }
  });
})();
