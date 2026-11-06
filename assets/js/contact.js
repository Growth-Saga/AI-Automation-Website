/* Growth Saga AI site: Contact page. Runs after main.js.
   Live clocks on the booking ticket, and the Calendly calendar opening in a panel over the page. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Live clocks: New York, London, Dubai, Surat ---------- */
  const clocks = $$('.clk li');
  const tick = () => {
    const now = new Date();
    clocks.forEach(li => {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: li.dataset.tz, hour: 'numeric', minute: '2-digit', hour12: true })
        .formatToParts(now).map(p => [p.type, p.value]));
      const h = +parts.hour % 12, m = +parts.minute;
      $('.clk__time', li).innerHTML = `${parts.hour}:${parts.minute}<small>${parts.dayPeriod}</small>`;
      $('.clk__dial .h', li).style.transform = `rotate(${(h + m / 60) * 30}deg)`;
      $('.clk__dial .m', li).style.transform = `rotate(${m * 6}deg)`;
    });
  };
  tick();
  setInterval(tick, 15000);

  /* ---------- Calendly panel ---------- */
  const panel = $('#calm');
  const frame = $('.calm__frame', panel);
  let lastFocus = null;
  const open = () => {
    if (!frame.src) frame.src = frame.dataset.src;   // load Calendly only when it's asked for
    lastFocus = document.activeElement;
    panel.hidden = false;
    document.body.classList.add('cal-open');
    window.__lenis?.stop();
    if (!reduced) gsap.fromTo('.calm__panel', { opacity: 0, y: 30, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'expo.out' });
    $('.calm__x', panel).focus();
  };
  const close = () => {
    panel.hidden = true;
    document.body.classList.remove('cal-open');
    window.__lenis?.start();
    lastFocus?.focus();
  };
  // capture phase, so the in-page scroll handler in main.js doesn't also run for #book links
  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-cal-open]');
    if (opener) { e.preventDefault(); e.stopPropagation(); open(); return; }
    if (e.target.closest('[data-cal-close]')) close();
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
})();
