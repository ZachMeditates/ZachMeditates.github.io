(() => {
  const el = (id) => document.getElementById(id);
  const src = el('demo-data');
  if (!src) return;
  const people = JSON.parse(src.textContent).people;
  el('demo-live').hidden = false;

  const ROLE = { nurse: 'nurse', sales: 'sales', designer: 'designer', qa: 'software QA' };
  const first = (p) => p.name.split(' ')[0];
  const fmt = (n) => Number(n).toLocaleString('en-US');
  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let timers = [];
  let frames = [];
  const stop = () => {
    timers.forEach(clearTimeout); timers = [];
    frames.forEach(cancelAnimationFrame); frames = [];
  };
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function countTo(node, to, ms) {
    if (still()) { node.textContent = fmt(to); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      node.textContent = fmt(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frames.push(requestAnimationFrame(tick));
    };
    frames.push(requestAnimationFrame(tick));
  }

  function rows(p) {
    const kept = p.worthIt.slice(0, 3).map((j) => ({ ...j, cls: 'in' }));
    const out = p.setAside.slice(0, 2).map((j) => ({ ...j, cls: 'out' }));
    const list = [];
    while (kept.length || out.length) {
      if (kept.length) list.push(kept.shift());
      if (out.length) list.push(out.shift());
    }
    return list.map((j) => {
      const li = document.createElement('li');
      li.className = j.cls;
      li.innerHTML = '<span class="t"></span><span class="co"></span><span class="s"></span><span class="why"></span>';
      li.querySelector('.t').textContent = j.role;
      li.querySelector('.co').textContent = [j.company, j.remote ? 'from home' : j.where].join(' · ');
      li.querySelector('.s').textContent = j.cls === 'in' ? Number(j.score).toFixed(1) : '';
      li.querySelector('.why').textContent = j.why;
      return li;
    });
  }

  function show(p, animate) {
    stop();
    document.querySelectorAll('#demo-who button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === p.id)));
    const wants = el('demo-wants');
    wants.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = `${first(p)} wants: `;
    wants.append(b, document.createTextNode(p.wants));

    const list = el('demo-sort');
    list.innerHTML = '';
    const items = rows(p);
    items.forEach((li) => list.append(li));

    if (!animate || still()) {
      el('demo-found').textContent = fmt(p.arrived);
      el('demo-read').textContent = fmt(p.read);
      el('demo-worth').textContent = fmt(p.counts.worth);
      items.forEach((li) => li.classList.add('done'));
      return;
    }
    ['demo-found', 'demo-read', 'demo-worth'].forEach((id) => { el(id).textContent = '0'; });
    countTo(el('demo-found'), p.arrived, 1000);
    later(() => countTo(el('demo-read'), p.read, 800), 500);
    later(() => countTo(el('demo-worth'), p.counts.worth, 600), 1000);
    items.forEach((li, i) => later(() => li.classList.add('done'), 1500 + i * 450));
  }

  const who = el('demo-who');
  let current = people[0];
  for (const p of people) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.id = p.id;
    btn.innerHTML = '<strong></strong> <span></span>';
    btn.querySelector('strong').textContent = first(p);
    btn.querySelector('span').textContent = ROLE[p.id] || p.headline.toLowerCase();
    btn.addEventListener('click', () => { current = p; show(p, true); });
    who.append(btn);
  }
  el('demo-again').addEventListener('click', () => show(current, true));

  show(current, false);
  if ('IntersectionObserver' in window && !still()) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); show(current, true); }
    }, { rootMargin: '0px 0px -30% 0px' });
    io.observe(who);
  }
})();
