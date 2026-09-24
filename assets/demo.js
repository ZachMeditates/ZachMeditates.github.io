(() => {
  const el = (id) => document.getElementById(id);
  const src = el('demo-data');
  if (!src) return;
  const data = JSON.parse(src.textContent);
  const people = data.people;
  const ROLE = { nurse: 'nurse', sales: 'healthcare sales', designer: 'designer', qa: 'quality assurance' };
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
  function sequence(p) {
    const kept = p.worthIt.map((j) => ({ ...j, cls: 'in' }));
    const out = p.setAside.map((j) => ({ ...j, cls: 'out' }));
    const list = [];
    while (kept.length || out.length) {
      if (kept.length) list.push(kept.shift());
      if (out.length) list.push(out.shift());
    }
    return list;
  }

  function row(j) {
    const li = document.createElement('li');
    li.className = j.cls;
    const where = [j.company, j.remote ? 'from home' : j.where, j.cls !== 'out' ? j.pay : null].filter(Boolean).join(' · ');
    const score = j.cls === 'out' || j.score == null ? '' : Number(j.score).toFixed(1);
    li.innerHTML = '<span class="t"></span><span class="co"></span><span class="s"></span><span class="why"></span>';
    li.querySelector('.t').textContent = j.role;
    if (j.cls === 'catch') {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = 'with a catch';
      li.querySelector('.t').append(tag);
    }
    li.querySelector('.co').textContent = where;
    li.querySelector('.s').textContent = score;
    li.querySelector('.why').textContent = j.why;
    return li;
  }

  function show(p, animate) {
    stop();
    document.querySelectorAll('#demo-who button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === p.id)));
    el('demo-wants').innerHTML = '';
    const b = document.createElement('b');
    b.textContent = `${first(p)} asked for: `;
    el('demo-wants').append(b, document.createTextNode(p.wants));
    el('demo-outside-l').textContent = `outside what ${first(p)} asked for`;

    const reasons = el('demo-reasons');
    reasons.innerHTML = '';
    for (const r of p.outside.reasons) {
      const li = document.createElement('li');
      const why = r.why.replace(/\.$/, '');
      li.append(document.createTextNode(why.charAt(0).toUpperCase() + why.slice(1) + ' '));
      const n = document.createElement('b');
      n.textContent = fmt(r.count);
      li.append(n);
      reasons.append(li);
    }

    const list = el('demo-sort');
    list.innerHTML = '';
    const rows = sequence(p).map(row);
    rows.forEach((li) => list.append(li));
    const catches = p.withACatch.map((j) => row({ ...j, cls: 'catch' }));
    const catchList = el('demo-catch-list');
    catchList.innerHTML = '';
    catches.forEach((li) => { li.classList.add('done'); catchList.append(li); });
    el('demo-catches-s').textContent = `${catches.length} more worth a look, each with a catch`;
    el('demo-catches').open = false;
    const worth = p.worthIt.length;
    el('demo-worth-l').textContent = `worth an evening, out of ${fmt(p.arrived)} postings.`;

    if (!animate || still()) {
      el('demo-found').textContent = fmt(p.arrived);
      el('demo-outside').textContent = fmt(p.outside.count);
      el('demo-worth').textContent = worth;
      rows.forEach((li) => li.classList.add('done'));
      return;
    }
    el('demo-found').textContent = '0';
    el('demo-outside').textContent = '0';
    el('demo-worth').textContent = '0';
    countTo(el('demo-found'), p.arrived, 1100);
    later(() => countTo(el('demo-outside'), p.outside.count, 1100), 500);
    rows.forEach((li, i) => later(() => li.classList.add('done'), 1500 + i * 420));
    later(() => countTo(el('demo-worth'), worth, 400), 1500 + rows.length * 420);
  }

  const who = el('demo-who');
  for (const p of people) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = p.id;
    b.innerHTML = '<strong></strong> <span></span>';
    b.querySelector('strong').textContent = first(p);
    b.querySelector('span').textContent = ROLE[p.id] || p.headline.toLowerCase();
    b.addEventListener('click', () => show(p, true));
    who.append(b);
  }
  let current = people[0];
  who.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) current = people.find((p) => p.id === b.dataset.id) || current;
  });
  el('demo-again').addEventListener('click', () => show(current, true));
  show(current, false);
  if ('IntersectionObserver' in window && !still()) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); show(current, true); }
    }, { rootMargin: '0px 0px -30% 0px' });
    io.observe(el('demo-who'));
  }
})();
