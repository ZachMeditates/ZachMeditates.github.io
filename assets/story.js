(() => {
  const root = document.documentElement;
  const el = (id) => document.getElementById(id);
  const src = el('demo-data');
  if (!src) return;
  const byId = Object.fromEntries(JSON.parse(src.textContent).people.map((p) => [p.id, p]));

  // What each person told us and the documents they got. Their numbers and
  // jobs come from the data above.
  const STORY = {
    designer: {
      a: 'a product designer', tint: '#2E7D57',
      talk: [
        ['What do you want?', 'Product design, working from home.'],
        ['What do you need?', 'At least $85,000.'],
        ['Deal breakers?', 'Five days a week in an office.'],
      ],
      resume: 'Product Designer', pivot: 'Design Operations',
      guide: 'Moving into design operations',
    },
    nurse: {
      a: 'a licensed practical nurse', tint: '#3C7A8C',
      talk: [
        ['What do you want?', 'Review work from home, or a clinic close by.'],
        ['What do you need?', 'Day shifts, and at least $50,000.'],
        ['Deal breakers?', 'Nights.'],
      ],
      resume: 'Licensed Practical Nurse', pivot: 'Utilization Review',
      guide: 'Moving from the clinic to review work',
    },
    qa: {
      a: 'a software QA lead', tint: '#6B5E9B',
      talk: [
        ['What do you want?', 'Leading quality assurance, remote first.'],
        ['What do you need?', 'At least $95,000.'],
        ['Deal breakers?', 'Writing code all day.'],
      ],
      resume: 'Quality Assurance Lead', pivot: 'IT Compliance',
      guide: 'From QA lead to compliance',
    },
    sales: {
      a: 'a healthcare sales director', tint: '#9A5B2E',
      talk: [
        ['What do you want?', 'Healthcare business development.'],
        ['What do you need?', 'Base pay of at least $110,000.'],
        ['Deal breakers?', 'Commission only, or moving.'],
      ],
      resume: 'Healthcare Business Development', pivot: '', guide: '',
    },
  };
  const SHORT = { place: 'Too far', requirement: 'Missing a must-have', hours: 'Wrong hours', pay: 'Pay too low', closed: 'Closed', fit: 'Not a fit' };

  const first = (p) => p.name.split(' ')[0];
  const fmt = (n) => Number(n).toLocaleString('en-US');
  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  function countTo(node, to, ms) {
    if (still()) { node.textContent = fmt(to); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      node.textContent = fmt(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const id = byId[root.dataset.person] && STORY[root.dataset.person] ? root.dataset.person : 'designer';
  const p = byId[id];
  const s = STORY[id];

  root.style.setProperty('--person', s.tint);
  document.querySelectorAll('[data-first]').forEach((n) => { n.textContent = first(p); });
  document.querySelectorAll('[data-role]').forEach((n) => { n.textContent = s.a; });

  // 1: the conversation
  const talk = el('talk');
  talk.replaceChildren();
  s.talk.forEach(([q, a]) => {
    const them = make('li', 'bubble them', a);
    them.prepend(make('span', 'from', first(p)));
    talk.append(make('li', 'bubble us', q), them);
  });

  // 2: the documents
  const docs = el('docs');
  docs.replaceChildren();
  const paper = (kind, title, cls) => {
    const d = make('div', 'paper ' + cls);
    d.append(make('span', 'paper-k', kind), make('span', 'paper-t', title));
    return d;
  };
  const main = paper('Resume', s.resume, 'main');
  main.append(make('span', 'paper-lines'));
  docs.append(main);
  if (s.pivot) {
    docs.append(make('p', 'docs-note', 'Changing fields, so also:'));
    const fan = make('div', 'fan');
    fan.append(paper('Resume', s.pivot, 'extra'), paper('Guide', s.guide, 'guide'));
    docs.append(fan);
  } else {
    docs.append(make('p', 'docs-note', `Staying in the same field, so one sharp resume.`));
  }

  // 3: the search
  const search = el('search');
  search.replaceChildren();
  const counts = make('div', 'counts');
  [['found', p.arrived, 'postings found'], ['read', p.read, 'read closely'], ['sent', p.counts.worth, 'sent to ' + first(p)]].forEach(([k, v, label]) => {
    const d = make('div', 'count ' + k);
    const n = make('p', 'n', fmt(v));
    n.dataset.to = v;
    d.append(n, make('p', 'l', label));
    counts.append(d);
  });
  const list = make('ul', 'nope');
  p.setAside.slice(0, 3).forEach((j) => {
    const li = make('li');
    li.append(make('s', null, j.role), make('span', null, SHORT[j.kind] || 'Not a fit'));
    list.append(li);
  });
  search.append(counts, make('p', 'search-sub', 'Set aside, with the reason:'), list);

  // 4: the report
  const img = el('shot');
  img.src = `assets/report-${id}.webp`;
  const best = p.worthIt[0];
  img.alt = `${first(p)}'s report on a phone: the best match, ${best.role}, scored ${Number(best.score).toFixed(1)} out of 5, with pay, documents and the reasons it fits.`;

  root.dataset.ready = '';

  // The counts run once, when step 3 comes into view.
  if ('IntersectionObserver' in window && !still()) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        search.querySelectorAll('.count .n').forEach((n) => countTo(n, Number(n.dataset.to), 1100));
      }
    }, { rootMargin: '0px 0px -25% 0px' });
    io.observe(search);
  }
})();
