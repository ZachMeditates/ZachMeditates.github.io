(() => {
  const root = document.documentElement;
  const THEMES = ['light', 'dark', 'retro'];
  const NAMES = { light: 'light', dark: 'dark', retro: '90s' };
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const current = () => root.dataset.theme || 'light';
  const next = () => THEMES[(THEMES.indexOf(current()) + 1) % THEMES.length];
  const label = () => btn.setAttribute('aria-label', `Theme: ${NAMES[current()]}. Switch to ${NAMES[next()]}.`);
  label();
  btn.addEventListener('click', () => {
    const t = next();
    if (t === 'light') delete root.dataset.theme; else root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) { /* not kept */ }
    label();
  });
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
