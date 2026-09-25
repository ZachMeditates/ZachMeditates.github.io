(() => {
  const el = (id) => document.getElementById(id);
  const src = el('demo-data');
  if (!src) return;
  const byId = Object.fromEntries(JSON.parse(src.textContent).people.map((p) => [p.id, p]));

  // What each person told us, and the documents they got. The numbers and
  // the jobs come from the data above.
  const STORY = {
    designer: {
      role: 'designer', tint: '#2E7D57',
      talk: [
        ['What do you want?', 'Product design, working from home.'],
        ['What do you need?', 'At least $85,000.'],
        ['Must-haves?', 'A real design team to work with.'],
        ['Deal breakers?', 'Five days a week in an office.'],
      ],
      resume: 'Product Designer',
      pivots: ['Design Operations', 'Product Owner', 'Learning Design'],
      guide: 'Moving into design operations, and what to learn first',
    },
    nurse: {
      role: 'nurse', tint: '#3C7A8C',
      talk: [
        ['What do you want?', 'Review work from home, or a clinic close by.'],
        ['What do you need?', 'Day shifts, and at least $50,000.'],
        ['Must-haves?', 'My LPN license accepted.'],
        ['Deal breakers?', 'Nights, and weekends if it can be helped.'],
      ],
      resume: 'Licensed Practical Nurse',
      pivots: ['Utilization Review, from home'],
      guide: 'Moving from the clinic to review work',
    },
    qa: {
      role: 'software QA', tint: '#6B5E9B',
      talk: [
        ['What do you want?', 'Leading quality assurance, remote first.'],
        ['What do you need?', 'At least $95,000.'],
        ['Must-haves?', 'A product I can own the quality of.'],
        ['Deal breakers?', 'Writing code all day.'],
      ],
      resume: 'Quality Assurance Lead',
      pivots: ['Product Owner', 'IT Compliance'],
      guide: 'From QA lead to compliance, and what to learn first',
    },
    sales: {
      role: 'healthcare sales', tint: '#9A5B2E',
      talk: [
        ['What do you want?', 'Healthcare business development.'],
        ['What do you need?', 'Base pay of at least $110,000.'],
        ['Must-haves?', 'Remote, or an office within an hour.'],
        ['Deal breakers?', 'Commission only, or moving.'],
      ],
      resume: 'Healthcare Business Development',
      pivots: [],
      guide: '',
    },
  };
  const ORDER = ['designer', 'nurse', 'qa', 'sales'];
  const SHORT = { place: 'Too far', requirement: 'Missing a must-have', hours: 'Wrong hours', pay: 'Pay too low', closed: 'Closed', fit: 'Not a fit' };

  const first = (p) => p.name.split(' ')[0];
  const initials = (p) => p.name.split(' ').map((w) => w[0]).join('');
  const fmt = (n) => Number(n).toLocaleString('en-US');
  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  let frames = [];
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

  function talk(p, s) {
    const list = el('talk');
    list.replaceChildren();
    s.talk.forEach(([q, a], i) => {
      const us = make('li', 'bubble us', q);
      const them = make('li', 'bubble them', a);
      us.style.setProperty('--i', i * 2);
      them.style.setProperty('--i', i * 2 + 1);
      them.prepend(make('span', 'from', first(p)));
      list.append(us, them);
    });
  }

  function docs(p, s) {
    const box = el('docs');
    box.replaceChildren();
    const main = make('div', 'paper main');
    main.append(make('span', 'paper-k', 'Resume'), make('span', 'paper-t', s.resume), make('span', 'paper-lines'));
    box.append(main);
    if (!s.pivots.length) {
      box.append(make('p', 'docs-note', `No change of field, so ${first(p)} gets one sharp resume.`));
      return;
    }
    box.append(make('p', 'docs-note', 'Changing fields, so also:'));
    const fan = make('div', 'fan');
    s.pivots.forEach((t) => {
      const d = make('div', 'paper extra');
      d.append(make('span', 'paper-k', 'Resume'), make('span', 'paper-t', t));
      fan.append(d);
    });
    const g = make('div', 'paper guide');
    g.append(make('span', 'paper-k', 'Guide'), make('span', 'paper-t', s.guide));
    fan.append(g);
    box.append(fan);
  }

  function search(p) {
    const box = el('search');
    box.replaceChildren();
    const nums = make('div', 'counts');
    [['found', p.arrived, 'postings found'], ['read', p.read, 'read closely'], ['sent', p.counts.worth, 'sent to ' + first(p)]].forEach(([k, v, label]) => {
      const d = make('div', 'count ' + k);
      const n = make('p', 'n', fmt(v));
      n.dataset.to = v;
      d.append(n, make('p', 'l', label));
      nums.append(d);
    });
    box.append(nums);
    const list = make('ul', 'nope');
    p.setAside.slice(0, 3).forEach((j, i) => {
      const li = make('li');
      li.style.setProperty('--i', i);
      const s = make('s', null, j.role);
      li.append(s, make('span', null, SHORT[j.kind] || 'Not a fit'));
      list.append(li);
    });
    box.append(make('p', 'search-sub', 'Set aside, with the reason:'), list);
    const best = p.worthIt[0];
    const keep = make('div', 'keep');
    const top = make('p', 'keep-top');
    top.append(make('span', 'kt', best.role), make('span', 'ks', Number(best.score).toFixed(1)));
    keep.append(top, make('p', 'kc', [best.company, best.remote ? 'from home' : best.where].join(' · ')), make('p', 'kr', best.why));
    box.append(make('p', 'search-sub', 'Best match, sent to ' + first(p) + ':'), keep);
  }

  function shot(p) {
    const img = el('shot');
    img.src = `assets/report-${p.id}.webp`;
    const best = p.worthIt[0];
    img.alt = `${first(p)}'s report on a phone: the best match, ${best.role}, scored ${Number(best.score).toFixed(1)} out of 5, with pay, documents and the reasons it fits.`;
  }

  let current = byId.designer;
  let counted = false;
  function show(id, fresh) {
    const p = byId[id];
    const s = STORY[id];
    if (!p || !s) return;
    current = p;
    frames.forEach(cancelAnimationFrame); frames = [];
    document.documentElement.style.setProperty('--person', s.tint);
    document.querySelectorAll('[data-first]').forEach((n) => { n.textContent = first(p); });
    document.querySelectorAll('#people button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    const story = document.querySelector('.story');
    story.classList.remove('swap');
    talk(p, s); docs(p, s); search(p); shot(p);
    if (fresh && !still()) { void story.offsetWidth; story.classList.add('swap'); }
    if (fresh || counted) document.querySelectorAll('#search .count .n').forEach((n) => countTo(n, Number(n.dataset.to), 900));
  }

  const people = el('people');
  ORDER.forEach((id) => {
    const p = byId[id];
    const s = STORY[id];
    if (!p) return;
    const b = make('button');
    b.type = 'button';
    b.dataset.id = id;
    const av = make('span', 'avatar', initials(p));
    av.style.background = s.tint;
    const txt = make('span', 'who-txt');
    txt.append(make('strong', null, first(p)), make('span', 'who-role', s.role));
    b.append(av, txt);
    b.addEventListener('click', () => show(id, true));
    people.append(b);
  });
  show('designer', false);

  // The counters run the first time step 3 comes into view.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect(); counted = true;
        document.querySelectorAll('#search .count .n').forEach((n) => countTo(n, Number(n.dataset.to), 1100));
      }
    }, { rootMargin: '0px 0px -25% 0px' });
    io.observe(el('search'));
  }
})();
