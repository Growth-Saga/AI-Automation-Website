/* Growth Saga AI site: About page. Runs after main.js (Lenis, ScrollTrigger, reveals are already set up).
   Hero mark and portrait play in, unused tools get struck out, the founder timeline draws as you scroll,
   the "Saga" chapters fill, and the belief quote lights up word by word. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const EASE = 'expo.out';

  /* ---------- 3 · Founder timeline: the clock shows the current chapter ---------- */
  const chapters = $$('.chapter');
  const roleEl = $('[data-role]'), noEl = $('[data-role-no]');
  const bars = $$('.story__climb rect');
  let current = -1;
  const setRole = i => {
    if (i === current) return;
    const dir = i > current ? 1 : -1, first = current < 0;
    current = i;
    chapters.forEach((c, k) => c.classList.toggle('is-past', k <= i));
    bars.forEach((b, k) => { b.classList.toggle('on', k < i); b.classList.toggle('hot', k === i); });
    noEl.textContent = String(i + 1).padStart(2, '0');
    const next = chapters[i].dataset.role;
    if (reduced || first) { roleEl.textContent = next; return; }
    gsap.killTweensOf(roleEl);
    gsap.timeline()
      .to(roleEl, { yPercent: -110 * dir, opacity: 0, duration: .22, ease: 'power2.in' })
      .add(() => (roleEl.textContent = next))
      .fromTo(roleEl, { yPercent: 110 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: EASE });
  };
  if (chapters.length) setRole(0);

  // the belief quote: wrap each word (keeping the coral phrase) so it can light up
  const quote = $('[data-scrub-quote]');
  if (quote) {
    quote.setAttribute('aria-label', quote.textContent.replace(/\s+/g, ' ').trim());
    const walk = node => [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span');
          s.className = 'sw'; s.setAttribute('aria-hidden', 'true'); s.textContent = p;
          frag.appendChild(s);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    });
    walk(quote);
  }

  if (reduced) {
    chapters.forEach(c => c.classList.add('is-past'));
    $$('[data-shelf] li').forEach(li => li.classList.add('is-struck'));
    gsap.set('.chapters__fill', { scaleY: 1 });
    return;
  }

  /* ---------- 1 · Hero: the glow warms up, the two facets rise into the Ascent mark, Yash and his card follow ---------- */
  gsap.timeline({ delay: .35, defaults: { ease: EASE } })
    .from('.ab-founder__glow', { opacity: 0, duration: 2.2 })
    .from('.ab-founder .f-w', { opacity: 0, y: 70, duration: 1.6 }, '<')
    .from('.ab-founder .f-c', { opacity: 0, y: -70, duration: 1.6 }, '<.12')
    .from('.ab-founder__img', { opacity: 0, y: 40, duration: 1.5 }, '<.3')
    .from('.ab-founder__card', { opacity: 0, y: 24, duration: 1.1 }, '-=.8');

  /* ---------- 2 · Unused tools get struck out one by one, then "built around your process" lights up ---------- */
  const shelf = $('[data-shelf]');
  if (shelf) {
    const unused = $$('li', shelf);
    const built = $('.shelf__built');
    gsap.set(built, { opacity: 0, y: 16 });
    ScrollTrigger.create({
      trigger: shelf, start: 'top 72%', once: true,
      onEnter: () => {
        unused.forEach((li, i) => setTimeout(() => li.classList.add('is-struck'), 300 + i * 260));
        gsap.to(built, { opacity: 1, y: 0, duration: 1, ease: EASE, delay: .4 + unused.length * .26 });
        // the bar glows once it lands
        gsap.fromTo(built, { boxShadow: '0 0 0 rgba(255, 90, 60, 0)' }, { boxShadow: '0 0 40px -6px rgba(255, 90, 60, .6)', duration: 1.2, ease: 'power2.out', delay: 1.2 + unused.length * .26 });
      }
    });
  }

  /* ---------- 3 · Timeline line draws down; each chapter takes over the clock as it passes ---------- */
  const list = $('[data-chapters]');
  if (list) {
    gsap.to('.chapters__fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 62%', end: 'bottom 62%', scrub: true } });
    chapters.forEach((c, i) => ScrollTrigger.create({
      trigger: c, start: 'top 62%', end: 'bottom 62%',
      onToggle: self => self.isActive && setRole(i),
      onLeaveBack: () => i === 0 && setRole(0)
    }));
    gsap.from(bars, { scaleY: 0, duration: 1, ease: EASE, stagger: .06, scrollTrigger: { trigger: '.story__climb', start: 'top 92%' } });
  }

  /* ---------- 5 · Proof artwork plays in ---------- */
  const proof = $('[data-proof]');
  if (proof) {
    const line = $('.proof__art--line .line', proof);
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ defaults: { ease: EASE }, scrollTrigger: { trigger: proof, start: 'top 88%' } })
      .from($$('.proof-card', proof), { opacity: 0, y: 30, duration: 1.1, stagger: .08 })
      .from($$('.proof__art--blocks rect, .proof__art--ticks rect', proof), { scaleY: 0, duration: .9, stagger: .06 }, '-=.8')
      .from($$('.proof__art--grid rect', proof), { opacity: 0, scale: .3, transformOrigin: '50% 50%', duration: .5, stagger: .06 }, '<')
      .to(line, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, '<')
      .from($$('.proof__art--line .area', proof), { opacity: 0, duration: .8 }, '-=.6');
  }

  /* ---------- 7 · Saga chapters fill in order: go-live, then every month after ---------- */
  const saga = $('[data-saga]');
  if (saga) gsap.from($$('.saga__bar i', saga), { scaleX: 0, duration: 1, ease: 'power2.inOut', stagger: .35, scrollTrigger: { trigger: saga, start: 'top 88%' } });

  /* ---------- 8 · Belief: words light up as you scroll ---------- */
  // every word is lit by the time the section is fully on screen
  if (quote) gsap.to($$('.sw', quote), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: quote.closest('section'), start: 'top 75%', end: 'bottom bottom', scrub: true } });
})();
