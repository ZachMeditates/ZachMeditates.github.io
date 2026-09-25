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
      resume: 'Product Designer', pivot: 'Design Operations', picked: 'design operations',
      also: ['Learning Experience Design', 'Product Owner'],
      guide: 'Moving into design operations',
    },
    nurse: {
      a: 'a licensed practical nurse', tint: '#3C7A8C',
      talk: [
        ['What do you want?', 'Review work from home, or a clinic close by.'],
        ['What do you need?', 'Day shifts, and at least $50,000.'],
        ['Deal breakers?', 'Nights.'],
      ],
      resume: 'Licensed Practical Nurse', pivot: 'Utilization Review', picked: 'utilization review',
      also: ['Care Coordination', 'Prior Authorization'],
      guide: 'Moving from the clinic to review work',
    },
    qa: {
      a: 'a software QA lead', tint: '#6B5E9B',
      talk: [
        ['What do you want?', 'Leading quality assurance, remote first.'],
        ['What do you need?', 'At least $95,000.'],
        ['Deal breakers?', 'Writing code all day.'],
      ],
      resume: 'Quality Assurance Lead', pivot: 'IT Compliance', picked: 'IT compliance',
      also: ['Product Owner', 'Business Analysis'],
      guide: 'From QA lead to compliance',
    },
    sales: {
      a: 'a healthcare sales director', tint: '#9A5B2E',
      talk: [
        ['What do you want?', 'Healthcare business development, or close to it.'],
        ['What do you need?', 'Base pay of at least $110,000.'],
        ['Deal breakers?', 'Commission only, or moving.'],
      ],
      resume: 'Healthcare Business Development', pivot: 'Physician Relations', picked: 'physician relations',
      also: ['Provider Network Management', 'Strategic Accounts'],
      guide: 'From business development to physician relations',
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
  docs.append(make('p', 'docs-note', `Other directions that fit ${first(p)}:`));
  const options = make('div', 'options');
  options.append(make('span', 'opt picked', s.pivot), ...s.also.map((o) => make('span', 'opt', o)));
  docs.append(options);
  docs.append(make('p', 'docs-note', `${first(p)} picked ${s.picked}, and got these too:`));
  const fan = make('div', 'fan');
  fan.append(paper('Resume', s.pivot, 'extra'), paper('Guide', s.guide, 'guide'));
  docs.append(fan);

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

  // 4: the report: the best match in full, the next two on a line each
  const report = el('report');
  report.replaceChildren();
  const score = (n) => Number(n).toFixed(1);
  const where = (j) => (j.remote && !/^remote/i.test(j.where) ? `Remote, ${j.where}` : j.where);
  const [best, ...next] = p.worthIt;
  const head = make('p', 'report-head', 'Worth applying to');
  head.append(make('span', 'report-n', fmt(p.counts.worth)));
  const card = make('div', 'keep');
  const top = make('div', 'keep-top');
  top.append(make('span', 'kt', best.role), make('span', 'ks', score(best.score)));
  const extras = make('p', 'extras');
  ['Custom resume', 'Cover letter', 'Interview prep'].forEach((t) => extras.append(make('span', null, t)));
  card.append(top, make('p', 'kc', `${best.company} · ${where(best)}`),
    make('p', 'kc', best.pay || 'Pay not published yet'), make('p', 'kr', best.why), extras);
  const rest = make('ul', 'rest');
  next.slice(0, 2).forEach((j) => {
    const li = make('li');
    const t = make('span', 'rt', j.role);
    t.append(make('span', 'rc', j.company));
    li.append(t, make('span', 'rs', score(j.score)));
    rest.append(li);
  });
  report.append(head, card, rest, make('p', 'report-more', `and ${fmt(p.counts.worth - 3)} more, best first`));

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
