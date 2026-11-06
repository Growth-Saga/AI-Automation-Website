/* Growth Saga AI site: smooth scroll, reveals, 5-step process clock, case-study tabs, dashboard, FAQ.
   Same motion system as the creator Home page: one easing curve, no bounce, subtle magnetic pull. */
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const EASE = 'expo.out';

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.__lenis = lenis;

  // in-page links go through Lenis
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    lenis ? lenis.scrollTo(el, { offset: id === '#top' ? 0 : -80, duration: 1.4 }) : el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ---------- Text: wrap words so lines can rise from a mask ---------- */
  function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return $$('.wi', el);
  }

  /* ---------- Shared widgets that work with or without motion ---------- */
  initHeader();
  initTabs();
  initBusywork();
  initFaq();
  initMenu();
  initSticky();

  if (reduced) return finishStatic();

  /* ---------- Hero intro (no preloader: content is there at once) ---------- */
  const heroWords = splitWords($('.hero__title'));
  gsap.set('[data-hero-fade]', { y: 24 });
  gsap.timeline({ defaults: { ease: EASE }, delay: .15 })
    .from('.header', { opacity: 0, duration: 1.2 })
    .from(heroWords, { yPercent: 125, duration: 1.3, stagger: .045 }, '<')
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.1, stagger: .08 }, '-=1');

  gsap.to('.hero__grid', { yPercent: -8, opacity: .35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center top+=20%', end: 'bottom top', scrub: true } });

  /* ---------- Section headlines + reveals ---------- */
  $$('[data-split]').forEach(el => {
    if (el.classList.contains('hero__title')) return;
    gsap.from(splitWords(el), { yPercent: 110, duration: 1.2, ease: EASE, stagger: .035, scrollTrigger: { trigger: el, start: 'top 95%' } });
  });
  $$('[data-reveal]').forEach(el => gsap.from(el, { opacity: 0, y: 40, duration: 1.2, ease: EASE, scrollTrigger: { trigger: el, start: 'top 97%' } }));
  $$('[data-reveal-group]').forEach(g => gsap.from(g.children, { opacity: 0, y: 30, duration: 1.1, ease: EASE, stagger: .08, scrollTrigger: { trigger: g, start: 'top 95%' } }));

  /* ---------- Stats strip: each number's artwork plays in ---------- */
  const stats = $('[data-stats]');
  if (stats) {
    const line = $('.stat__art .line', stats);
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ defaults: { ease: EASE }, scrollTrigger: { trigger: stats, start: 'top 92%' } })
      .from($$('.stat', stats), { opacity: 0, y: 30, duration: 1.1, stagger: .08 })
      .from($$('.stat__art--bars rect', stats), { scaleY: 0, duration: .9, stagger: .08 }, '-=.7')
      .to(line, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, '<')
      .from($$('.stat__art .area, .stat__art--line .hot', stats), { opacity: 0, duration: .8 }, '-=.6')
      .from($$('.stat__art--grid rect', stats), { opacity: 0, scale: .3, transformOrigin: '50% 50%', duration: .5, stagger: .04 }, '<-.9')
      .from($$('.stat__art--ticks rect', stats), { scaleY: 0, duration: .6, stagger: .06 }, '<');
  }

  /* ---------- 80 / 20 bar fills, dashboard bars grow ---------- */
  if ($('[data-split-bar]')) gsap.from('.split span', { scaleX: 0, duration: 1.4, ease: EASE, stagger: .25, scrollTrigger: { trigger: '[data-split-bar]', start: 'top 90%' } });
  if ($('[data-dash-bars]')) gsap.from('[data-dash-bars] rect',{ scaleY: 0, duration: 1, ease: EASE, stagger: .04, scrollTrigger: { trigger: '[data-dash-bars]', start: 'top 90%' } });

  /* ---------- Count-up numbers ---------- */
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const o = { v: 0 };
    el.textContent = pre + '0' + suf;
    gsap.to(o, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => (el.textContent = pre + Math.round(o.v).toLocaleString('en-US') + suf)
    });
  });

  /* ---------- Words light up as you scroll ---------- */
  $$('[data-scrub-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(w => `<span class="sw" aria-hidden="true">${w}</span>`).join(' ');
    // tied to the whole section: every word is lit by the time the section is fully on screen
    const section = el.closest('section') || el;
    gsap.to($$('.sw', el), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: section, start: 'top 75%', end: 'bottom bottom', scrub: true } });
  });

  /* ---------- 5 · Process clock ----------
     Desktop: the section scrolls fully into view first (Discovery stays on), then pins.
     While pinned, each step gets an equal share of the scroll and the timeline fills with it. */
  const steps = $$('.step');
  const nameEl = $('[data-step-name]'), dayEl = $('[data-day]');
  const segs = $$('.timeline__seg i');
  let current = -1;
  const setStep = i => {
    if (i === current) return;
    const dir = i > current ? 1 : -1;
    current = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    [nameEl, dayEl].forEach((el, k) => {
      const next = k ? steps[i].dataset.day : steps[i].dataset.name;
      gsap.killTweensOf(el);
      gsap.timeline()
        .to(el, { yPercent: -110 * dir, opacity: 0, duration: .22, ease: 'power2.in' })
        .add(() => (el.textContent = next))
        .fromTo(el, { yPercent: 110 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: EASE });
    });
  };
  // pages without the process section (About) skip the clock
  if (steps.length) setStep(0);
  if (steps.length) gsap.matchMedia().add('(min-width: 901px)', () => {
    ScrollTrigger.create({
      trigger: '.how', start: 'top top', end: () => '+=' + innerHeight * 2.4,
      pin: true, scrub: true, refreshPriority: 1,
      onUpdate: self => {
        const p = self.progress;
        setStep(Math.min(steps.length - 1, Math.floor(p * steps.length * .999)));
        // the bar fills over Discovery → Build; Go-live is the "Ongoing" arrow
        const fill = Math.min(1, p * steps.length / (steps.length - 1));
        segs.forEach((seg, i) => gsap.set(seg, { scaleX: Math.max(0, Math.min(1, fill * segs.length - i)) }));
      }
    });
    return () => setStep(0);
  });

  /* ---------- Founder photo opens like blinds ---------- */
  $$('[data-blinds]').forEach(el => {
    const n = +el.dataset.slats || 6;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'slat';
      s.style.cssText = `left:${(i * 100) / n}%;width:${100 / n + .5}%;transition-delay:${i * .07}s`;
      el.appendChild(s);
    }
    ScrollTrigger.create({ trigger: el, start: 'top 78%', once: true, onEnter: () => el.classList.add('is-in') });
  });

  /* ---------- Final call warms up, footer sign-off ---------- */
  if ($('.final__warm')) gsap.to('.final__warm', { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top 85%', end: 'center 45%', scrub: true } });
  gsap.from('.footer__mega span', { yPercent: 40, opacity: 0, duration: 1.4, stagger: .12, ease: EASE, scrollTrigger: { trigger: '.footer__mega', start: 'top 92%' } });

  /* ---------- Spotlight, subtle magnetic pull ---------- */
  $$('.spot').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));
  if (finePointer) $$('.magnetic').forEach(btn => {
    const xTo = gsap.quickTo(btn, 'x', { duration: .7, ease: 'power3' });
    const yTo = gsap.quickTo(btn, 'y', { duration: .7, ease: 'power3' });
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * .14);
      yTo((e.clientY - r.top - r.height / 2) * .22);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* ================= widgets ================= */

  function initHeader() {
    const header = $('.header');
    const bar = $('.progress span');
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('is-hidden', !reduced && y > 640 && y > lastY + 2 && !document.body.classList.contains('menu-open'));
      if (y < lastY - 2) header.classList.remove('is-hidden');
      lastY = y;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    lenis ? lenis.on('scroll', onScroll) : window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initSticky() {
    const bar = $('.sticky');
    const link = $('a', bar);
    const final = $('.final');
    const footer = $('.footer');
    const inView = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
    const pageButtons = $$('main .btn, main .textlink');
    const covers = () => {
      const b = bar.getBoundingClientRect(), top = innerHeight - b.height - 40;
      return pageButtons.some(el => { const r = el.getBoundingClientRect(); return r.bottom > top && r.top < innerHeight && r.right > b.left - 20 && r.left < b.right + 20; });
    };
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const on = window.scrollY / max > .3 && !inView(final) && !inView(footer) && !covers();
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', !on);
      link.tabIndex = on ? 0 : -1;
    };
    lenis ? lenis.on('scroll', update) : window.addEventListener('scroll', update, { passive: true });
  }

  // case studies: one panel at a time on desktop (all panels stack on phones, via CSS)
  function initTabs() {
    const tabs = $$('.work__tabs [role="tab"]');
    const show = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).classList.toggle('is-active', on);
      });
      if (focus) tab.focus({ preventScroll: true });
      const row = tab.parentNode;
      if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: tab.offsetLeft - row.offsetLeft - 20, behavior: reduced ? 'auto' : 'smooth' });
      const panel = $('#' + tab.getAttribute('aria-controls'));
      if (!reduced) gsap.fromTo(panel.children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7, ease: EASE, stagger: .06 });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', e => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        show(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
  }

  // busywork calculator: people × hours a week × working weeks, AI takes 30–60% of it.
  // A year = 52 weeks × 5 days = 260 weekdays, minus 24 days of holidays and leave = 236 days = 47.2 weeks.
  // USD and INR each have their own hourly-cost slider; nothing is converted between them.
  function initBusywork() {
    const box = $('.bw');
    if (!box) return;
    const WORK_DAYS = 52 * 5 - 24, WEEKS = WORK_DAYS / 5, LOW = .3, HIGH = .6;
    const CUR = {
      usd: { sign: '$', locale: 'en-US', min: 15, max: 100, step: 5, value: 30 },
      inr: { sign: '₹', locale: 'en-IN', min: 100, max: 2000, step: 50, value: 300 }
    };
    const PROOF = {
      entry: 'Our AI reads business cards and CVs in batches of 20 to 50 and fills in the records by itself.',
      invoices: 'Our AI reads a supplier bill, checks the maths and posts it straight to the books, at about $0.04 per invoice.',
      followups: 'For a manufacturer, payment reminders and 91 alerts now go out on their own, with nobody chasing.',
      reports: 'A year-long site profit report now runs in 30 to 40 seconds. It used to take about 7 minutes.',
      leads: 'Every new lead gets an answer in under 60 seconds, then goes straight to the right salesperson.'
    };
    const people = $('#bw-people'), hours = $('#bw-hours'), rate = $('#bw-rate'), cur = $('#bw-cur');
    const out = Object.fromEntries($$('[data-bw]', box).map(el => [el.dataset.bw, el]));
    const outIn = Object.fromEntries($$('[data-bw-out]', box).map(el => [el.dataset.bwOut, el]));
    const lastRate = { usd: CUR.usd.value, inr: CUR.inr.value };
    // exact figures, no rounding: up to 2 decimals only when a value has them
    const num = (v, locale = 'en-US') => (+v.toFixed(2)).toLocaleString(locale, { maximumFractionDigits: 2 });
    const money = v => {
      const c = CUR[cur.value], cents = Number.isInteger(+v.toFixed(2)) ? 0 : 2;
      return c.sign + (+v.toFixed(2)).toLocaleString(c.locale, { minimumFractionDigits: cents, maximumFractionDigits: 2 });
    };
    const fill = r => r.style.setProperty('--p', `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
    let shown = null;

    const update = () => {
      const h = +people.value * +hours.value * WEEKS;
      const cost = h * +rate.value;
      lastRate[cur.value] = +rate.value;
      [people, hours, rate].forEach(fill);
      outIn.people.textContent = people.value;
      outIn.hours.textContent = hours.value + ' h';
      outIn.rate.textContent = money(+rate.value);
      out.hoursYear.textContent = num(h) + ' hours';
      out.costYear.textContent = money(cost);
      out.saveHours.textContent = `${num(h * LOW)} to ${num(h * HIGH)} hours`;
      out.proof.textContent = PROOF[$('input[name="task"]:checked', box).value];

      const target = { a: cost * LOW, b: cost * HIGH };
      const paint = (v = shown) => (out.save.textContent = `${money(v.a)} to ${money(v.b)}`);
      if (reduced || !shown) { shown = { ...target }; return paint(); }
      // roll to the new value, then land on the exact figure
      gsap.to(shown, { ...target, duration: .6, ease: 'power3.out', overwrite: true, onUpdate: () => paint({ a: Math.round(shown.a), b: Math.round(shown.b) }), onComplete: () => paint(target) });
    };
    // switching currency swaps in that currency's own hourly-cost slider
    cur.addEventListener('change', () => {
      const c = CUR[cur.value];
      Object.assign(rate, { min: c.min, max: c.max, step: c.step });
      rate.value = lastRate[cur.value];
      shown = null;
      update();
    });
    [people, hours, rate].forEach(r => r.addEventListener('input', update));
    $$('input[name="task"]', box).forEach(r => r.addEventListener('change', update));
    update();
  }

  function initFaq() {
    let t;
    $$('.qa button').forEach(btn => btn.addEventListener('click', () => {
      const qa = btn.closest('.qa');
      const open = !qa.classList.contains('is-open');
      qa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 650);
    }));
  }

  function initMenu() {
    const burger = $('.burger');
    const menu = $('.menu');
    burger.addEventListener('click', () => {
      const open = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', !open);
      open ? lenis?.stop() : lenis?.start();
      if (open && !reduced) gsap.fromTo('.menu__links a, .menu .btn, .menu__foot', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .05, ease: EASE, delay: .15 });
    });
    $$('.menu a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
  }

  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    $('.burger').setAttribute('aria-expanded', 'false');
    $('.burger').setAttribute('aria-label', 'Open menu');
    $('.menu').setAttribute('aria-hidden', 'true');
    lenis?.start();
  }

  /* ---------- Reduced motion: everything visible, nothing moves ---------- */
  function finishStatic() {
    $$('.step').forEach(s => s.classList.add('is-active'));
    $$('.timeline__seg i').forEach(i => (i.style.transform = 'scaleX(1)'));
    $$('[data-blinds]').forEach(el => el.classList.add('is-in'));
    if ($('.final__warm')) $('.final__warm').style.opacity = .7;
  }
})();
