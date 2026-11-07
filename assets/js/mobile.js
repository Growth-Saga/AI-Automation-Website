/* Growth Saga AI site: phone helpers (every page).
   1. The corner-card menu closes on a tap outside it.
   2. Swipe rows ([data-m-swipe]) get arrows and dots underneath. The nav is hidden above 900px. */
(() => {
  const phone = matchMedia('(max-width: 900px)');

  /* ---------- 1 · Menu: mark the current page, tap outside to close ---------- */
  const here = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.menu__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === '#top' || href === here) a.setAttribute('aria-current', 'page');
  });
  document.addEventListener('click', e => {
    if (!phone.matches || !document.body.classList.contains('menu-open')) return;
    if (e.target.closest('.menu, .burger')) return;
    document.querySelector('.burger')?.click();
  });

  /* the page behind dims while the menu is open */
  const dim = document.createElement('div');
  dim.className = 'menu-dim';
  document.body.appendChild(dim);

  /* a coral bar follows the link under your finger, and rests on the current page */
  const links = document.querySelector('.menu__links');
  if (links) {
    const bar = document.createElement('i');
    bar.className = 'menu__bar';
    bar.setAttribute('aria-hidden', 'true');
    links.appendChild(bar);
    const all = [...links.querySelectorAll('a')];
    const current = all.find(a => a.hasAttribute('aria-current'));
    const point = a => {
      all.forEach(x => x.classList.toggle('is-hot', x === a));
      if (!a) { bar.style.opacity = 0; return; }
      bar.style.opacity = 1;
      bar.style.top = a.offsetTop + 'px';
      bar.style.height = a.offsetHeight + 'px';
    };
    const rest = () => point(current);
    links.addEventListener('pointerover', e => { const a = e.target.closest('a'); if (a) point(a); });
    links.addEventListener('pointerleave', rest);
    document.querySelector('.burger')?.addEventListener('click', () => requestAnimationFrame(rest));

    /* tap: the tile fills with coral, then the page changes */
    document.addEventListener('click', e => {
      const a = e.target.closest('.menu__links a');
      if (!a || !phone.matches || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute('href');
      if (href.startsWith('#')) return;
      e.preventDefault(); e.stopPropagation();
      point(a);
      a.classList.add('is-go');
      setTimeout(() => { location.href = a.href; }, 320);
    }, true);
    /* coming back with the browser's back button: clear the filled tile */
    addEventListener('pageshow', () => all.forEach(a => a.classList.remove('is-go')));
  }

  /* ---------- 2 · Swipe rows ---------- */
  const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 2L4 8L10 14L11.4 12.6L6.8 8L11.4 3.4Z"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2L12 8L6 14L4.6 12.6L9.2 8L4.6 3.4Z"/></svg>';

  document.querySelectorAll('[data-m-swipe]').forEach(row => {
    const nav = document.createElement('div');
    nav.className = 'm-swipe-nav';
    nav.innerHTML = `<button type="button" aria-label="Previous">${ARROW}</button><span class="m-swipe-dots"></span><button type="button" aria-label="Next">${ARROW_R}</button>`;
    row.after(nav);
    const [prev, next] = nav.querySelectorAll('button');
    const dots = nav.querySelector('.m-swipe-dots');
    const cards = () => [...row.children].filter(c => c.offsetParent !== null);
    const step = () => { const c = cards(); return c.length > 1 ? c[1].offsetLeft - c[0].offsetLeft : row.clientWidth; };
    const index = () => Math.round(row.scrollLeft / step());

    function build() {
      dots.innerHTML = cards().map(() => '<i></i>').join('');
      sync();
    }
    function sync() {
      const n = cards().length, i = Math.min(index(), n - 1);
      [...dots.children].forEach((d, k) => d.classList.toggle('is-on', k === i));
      prev.disabled = row.scrollLeft < 4;
      next.disabled = row.scrollLeft + row.clientWidth > row.scrollWidth - 4;
      nav.hidden = n < 2;
    }
    prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
    dots.addEventListener('click', e => {
      const k = [...dots.children].indexOf(e.target);
      if (k >= 0) row.scrollTo({ left: k * step(), behavior: 'smooth' });
    });
    row.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync);
    /* the case-study filter hides cards: rebuild the dots and go back to the first card */
    document.querySelectorAll('[data-filter]').forEach(chip => chip.addEventListener('click', () => setTimeout(() => { row.scrollLeft = 0; build(); }, 60)));
    build();
  });
})();
