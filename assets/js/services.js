/* Growth Saga AI site: Services page. Runs after main.js (Lenis, ScrollTrigger, reveals are already set up).
   Hero: the four service tiles glow one after another (the light lines come from waves.js).
   Below: the fit arrows draw, and each step's timeline bar fills as the steps scroll in. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const EASE = 'expo.out';

  /* ---------- 1 · Hero: one tile at a time glows; hovering a tile takes over ---------- */
  const tiles = $$('.jump');
  if (tiles.length) {
    let i = 0, timer = null;
    const light = n => tiles.forEach((t, k) => t.classList.toggle('is-lit', k === n));
    light(0);
    const run = () => { if (!reduced) timer = setInterval(() => light(i = (i + 1) % tiles.length), 2600); };
    const grid = tiles[0].parentNode;
    grid.addEventListener('pointerenter', () => { clearInterval(timer); light(-1); });
    grid.addEventListener('pointerleave', () => { light(i); run(); });
    run();
  }

  if (reduced) return;

  /* ---------- 1 · Hero: the four service tiles follow the headline in ---------- */
  gsap.from('.jump', { opacity: 0, y: 36, duration: 1.2, ease: EASE, stagger: .08, delay: .7 });

  /* ---------- 2 · Find your fit: each arrow draws from the problem to the service ---------- */
  const list = document.querySelector('.fit-list');
  if (list) gsap.from($$('.fit-row__arrow i', list), { scaleX: 0, duration: 1, ease: EASE, stagger: .07, scrollTrigger: { trigger: list, start: 'top 80%' } });

  /* ---------- 9 · Steps: each bar fills along the call → week 6 timeline, in order ---------- */
  const road = document.querySelector('[data-road]');
  if (road) gsap.from($$('.gantt i', road), { scaleX: 0, duration: 1.1, ease: 'power2.inOut', stagger: .22, scrollTrigger: { trigger: road, start: 'top 82%' } });
})();
