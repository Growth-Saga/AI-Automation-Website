/* Growth Saga AI site: flowing light lines behind a hero (Home and Services).
   A bundle of thin S-curves with one blurred halo, drifting slowly; paused off screen, still under reduced motion. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $$('.sv-waves').forEach(waves => {
    const NS = 'http://www.w3.org/2000/svg';
    const curve = (k, t) => {
      // each line is a long S-curve; k spreads the bundle, t drifts it over time
      const y0 = 340 + k * 5 + Math.sin(t + k * .3) * 10;
      const y1 = 230 + k * 7 + Math.cos(t * .8 + k * .2) * 16;
      const y2 = 420 - k * 3 + Math.sin(t * .6 + k * .25) * 14;
      const y3 = 320 + k * 6 + Math.cos(t * .7 + k * .15) * 12;
      return `M-40 ${y0} C 260 ${y1}, 520 ${y2}, 820 ${y3} S 1100 ${250 + k * 5}, 1260 ${220 + k * 7}`;
    };
    const N = 18;
    const lines = [];
    const halo = document.createElementNS(NS, 'path');
    halo.setAttribute('class', 'halo');
    waves.appendChild(halo);
    for (let k = 0; k < N; k++) {
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('class', k === Math.floor(N / 2) ? 'core' : '');
      path.style.strokeWidth = k === Math.floor(N / 2) ? '' : '.8';
      path.style.opacity = (.25 + .75 * Math.sin(Math.PI * (k + .5) / N)).toFixed(2);
      waves.appendChild(path);
      lines.push(path);
    }
    const draw = t => {
      lines.forEach((l, k) => l.setAttribute('d', curve(k - N / 2, t)));
      halo.setAttribute('d', curve(0, t));
    };
    draw(0);
    if (!reduced) {
      let on = true;
      new IntersectionObserver(([e]) => (on = e.isIntersecting)).observe(waves.closest('section'));
      gsap.ticker.add(time => on && draw(time * .35));
      gsap.from(waves, { opacity: 0, duration: 2.4, ease: 'power2.out', delay: .3 });
    }
  });
})();
