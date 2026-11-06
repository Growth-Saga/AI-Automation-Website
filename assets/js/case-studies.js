/* Growth Saga AI site: Case Studies page. Runs after main.js (Lenis, ScrollTrigger, reveals are already set up).
   Service filter chips show only the matching cases; the hero result tiles glow in turn; tiles and case cards rise in. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const EASE = 'expo.out';

  /* ---------- Filter by service ---------- */
  const chips = $$('.chip');
  const cards = $$('[data-cases] > [data-svc]');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
    const shown = cards.filter(card => {
      const show = f === 'all' || card.dataset.svc === 'all' || card.dataset.svc.split(' ').includes(f);
      card.classList.toggle('is-out', !show);
      return show;
    });
    if (!reduced) gsap.fromTo(shown, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, ease: EASE, stagger: .05 });
    ScrollTrigger.refresh();
  }));

  /* ---------- Hero: one result tile at a time glows; hovering a tile takes over ---------- */
  const res = $$('.res');
  if (res.length) {
    let i = 0, timer = null;
    const light = n => res.forEach((t, k) => t.classList.toggle('is-lit', k === n));
    light(0);
    const run = () => { if (!reduced) timer = setInterval(() => light(i = (i + 1) % res.length), 2400); };
    const grid = res[0].parentNode;
    grid.addEventListener('pointerenter', () => { clearInterval(timer); light(-1); });
    grid.addEventListener('pointerleave', () => { light(i); run(); });
    run();
  }

  if (reduced) return;

  /* ---------- Hero: results tiles follow the headline in ---------- */
  gsap.from('.res', { opacity: 0, y: 30, duration: 1.1, ease: EASE, stagger: .07, delay: .7 });

  /* ---------- Case cards rise in as they scroll into view ---------- */
  $$('[data-cases]').forEach(grid => gsap.from(grid.children, { opacity: 0, y: 36, duration: 1.1, ease: EASE, stagger: .08, scrollTrigger: { trigger: grid, start: 'top 88%' } }));
})();
