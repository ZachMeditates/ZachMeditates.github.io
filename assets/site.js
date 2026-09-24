// Sign up: sends the name and email through Web3Forms, which emails them on.
// The access key goes in the hidden su-key field in index.html. Until it is
// set, the form says it is not switched on rather than pretending to send.
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

    if (!name) return say('Add your name.', true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say('That email address looks incomplete.', true);
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
