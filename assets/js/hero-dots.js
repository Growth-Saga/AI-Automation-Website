/* Hero: follower dots gather into the Ascent mark, with light that shows growth.
   - Square dots (followers) fly in and form the mark: white facet = the creator, coral facet = Growth Saga.
   - Extra dots on the facet edges keep the logo crisp.
   - Growth light: glowing followers stream up into the mark, a band of light sweeps up the arrow,
     a soft glow breathes behind it and the coral peak pulses.
   The mark sits in .hero__stage (so it always fills its column), pauses off screen, and is static under reduced motion.
   Works in any section (About uses it in "Why Saga?"): the dots gather when the stage scrolls into view. */
(() => {
  const canvas = document.querySelector('.hero__dots');
  const hero = canvas && canvas.closest('section');
  const stage = hero && hero.querySelector('.hero__stage');
  if (!stage) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // the two facets, in logo units (growthsaga-mark-dark.svg); the mark spans x 14–86, y 12–84
  const LEFT = [[14, 84], [47, 22], [47, 66]];
  const RIGHT = [[51, 12], [86, 78], [51, 58]];
  const PEAK = [51, 12];
  // the mark is centred on its enclosing circle (48, 55) and scaled up to fill the ring
  const LOGO_C = [48, 55], LOGO_SCALE = 1.18;
  const LEFT_SHARE = 726 / (726 + 805);
  // "growth" direction for the light sweep: from bottom-left up toward the peak
  const DIR = [.42, -.91];
  const proj = (x, y) => x * DIR[0] + y * DIR[1];
  const P_MIN = proj(14, 84), P_MAX = proj(51, 12);

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeOut = t => 1 - Math.pow(1 - t, 3.4);
  const inTriangle = ([a, b, c]) => {
    let r1 = Math.random(), r2 = Math.random();
    if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
    return [a[0] + r1 * (b[0] - a[0]) + r2 * (c[0] - a[0]), a[1] + r1 * (b[1] - a[1]) + r2 * (c[1] - a[1])];
  };
  const onEdge = tri => {
    const i = (Math.random() * 3) | 0, a = tri[i], b = tri[(i + 1) % 3], t = Math.random();
    const j = () => rand(-.35, .35);
    return [a[0] + (b[0] - a[0]) * t + j(), a[1] + (b[1] - a[1]) * t + j()];
  };

  // soft round glow sprites for the light effects (dots themselves stay square)
  const sprite = rgb => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.25, `rgba(${rgb},.45)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return c;
  };
  const GLOW = { w: sprite('255,255,255'), c: sprite('255,110,80') };

  let W = 0, H = 0, top = 0, dpr = 1, phone = false;
  let mark = { x: 0, y: 0, k: 1 };
  let dots = [], sparks = [];
  let running = false, raf = 0, start = 0;
  const mouse = { x: -9999, y: -9999 };

  function build() {
    const markCount = phone ? 2400 : 4600;
    const freeCount = phone ? 220 : 480;
    dots = [];
    for (let i = 0; i < markCount + freeCount; i++) {
      const free = i >= markCount;
      const kind = free ? 'f' : (Math.random() < LEFT_SHARE ? 'w' : 'c');
      const tri = kind === 'w' ? LEFT : RIGHT;
      const edge = !free && Math.random() < .28;
      const [lx, ly] = free ? [0, 0] : edge ? onEdge(tri) : inTriangle(tri);
      const a = free ? rand(.1, .3) : edge ? rand(.8, 1) : rand(.45, .95);
      const rgb = kind === 'c' ? '255,90,60' : kind === 'w' ? '255,255,255' : '183,191,217';
      dots.push({
        kind, lx, ly,
        p: free ? 0 : (proj(lx, ly) - P_MIN) / (P_MAX - P_MIN),  // 0 = base, 1 = peak
        fx: Math.random(), fy: Math.random(),
        sx: Math.random(), sy: Math.random(),
        size: free ? rand(1, 1.8) : edge ? rand(1.3, 1.9) : rand(1, 1.8),
        col: `rgba(${rgb},${a.toFixed(2)})`,
        delay: Math.random() * .55,
        ph: Math.random() * Math.PI * 2,
        sp: rand(.15, .45),
        ox: 0, oy: 0
      });
    }
    // followers streaming up into the mark
    sparks = Array.from({ length: phone ? 50 : 120 }, () => newSpark(true));
  }

  function newSpark(scatterLife) {
    const kind = Math.random() < LEFT_SHARE ? 'w' : 'c';
    const [lx, ly] = inTriangle(kind === 'w' ? LEFT : RIGHT);
    const life = rand(2.6, 5);
    return {
      kind, lx, ly,
      bx: rand(-.9, .9),            // start: spread below the mark (in mark widths)
      life, age: scatterLife ? Math.random() * life : 0,
      r: rand(1.6, 3.4), sway: rand(-1, 1), ph: Math.random() * Math.PI * 2
    };
  }

  // offset of the stage inside the hero, ignoring scroll transforms
  function stageBox() {
    let x = 0, y = 0, el = stage;
    while (el && el !== hero) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x, y, w: stage.offsetWidth, h: stage.offsetHeight };
  }

  function layout() {
    const wasPhone = phone;
    W = hero.clientWidth; H = hero.clientHeight;
    top = hero.getBoundingClientRect().top + window.scrollY;
    phone = W < 900;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const b = stageBox();
    // keep a band clear at the frame edge for the corner captions (outer ring = .76 × size).
    // Desktop captions sit outside the ring's curve, so 14px is enough; the wide, short phone frame needs 34px.
    const box = Math.min(b.w, b.h);
    const size = Math.min(box * .66, (box / 2 - (phone ? 34 : 14)) / .76);
    mark = { k: size * LOGO_SCALE / 72, x: b.x + b.w / 2, y: b.y + b.h / 2, size };
    buildArt();
    if (!dots.length || wasPhone !== phone) build();
  }

  // static artwork behind the mark: a hairline grid fading out from the centre, a fine ring with ticks
  let art = null;
  function buildArt() {
    const S = Math.ceil(mark.size * 1.7), c = document.createElement('canvas');
    c.width = c.height = Math.round(S * dpr);
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    const m = S / 2, step = mark.size / 9;
    g.strokeStyle = 'rgba(183,191,217,.13)'; g.lineWidth = 1;
    g.beginPath();
    for (let v = m % step; v < S; v += step) { g.moveTo(v + .5, 0); g.lineTo(v + .5, S); g.moveTo(0, v + .5); g.lineTo(S, v + .5); }
    g.stroke();
    g.globalCompositeOperation = 'destination-in';
    const fadeMask = g.createRadialGradient(m, m, 0, m, m, m);
    fadeMask.addColorStop(0, 'rgba(0,0,0,1)'); fadeMask.addColorStop(.55, 'rgba(0,0,0,.6)'); fadeMask.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fadeMask; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'source-over';
    const r = mark.size * .76;
    g.strokeStyle = 'rgba(183,191,217,.22)';
    g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 72; i++) {           // ticks round the ring, longer every 90°
      const a = i / 72 * Math.PI * 2, l = i % 18 === 0 ? 10 : 4;
      g.beginPath(); g.moveTo(m + Math.cos(a) * r, m + Math.sin(a) * r); g.lineTo(m + Math.cos(a) * (r + l), m + Math.sin(a) * (r + l)); g.stroke();
    }
    art = { c, S };
  }

  function draw(now) {
    const t = start ? (now - start) / 1000 : 0;
    const dt = Math.min(.05, (now - (draw.last || now)) / 1000); draw.last = now;
    const g = reduced ? 1 : clamp((t - .2) / 2.3);         // formation
    const settled = reduced ? 1 : clamp((t - 1.6) / 1.6);  // light effects fade in once formed
    const scroll = reduced ? 0 : clamp((window.scrollY - top) / (H * .85));
    const lift = scroll * mark.size * .35;                 // the mark rises gently as you scroll
    const fade = 1 - scroll * .7;
    const k = mark.k, cx = mark.x, cy = mark.y - lift;
    const toX = lx => cx + (lx - LOGO_C[0]) * k, toY = ly => cy + (ly - LOGO_C[1]) * k;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // soft breathing glow behind the mark
    const breath = .5 + .5 * Math.sin(t * 1.1);
    let gr = ctx.createRadialGradient(cx + 6 * k, cy, 0, cx + 6 * k, cy, mark.size * .85);
    gr.addColorStop(0, `rgba(255,90,60,${(.13 + breath * .05) * fade * (.4 + settled * .6)})`);
    gr.addColorStop(.55, `rgba(255,90,60,${.04 * fade})`);
    gr.addColorStop(1, 'rgba(255,90,60,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = gr;
    ctx.fillRect(cx - mark.size, cy - mark.size, mark.size * 2, mark.size * 2);

    // artwork: grid + ring, a slow dashed inner orbit, and three nodes travelling the outer ring
    const appear = reduced ? 1 : clamp((t - .1) / 1.4);
    ctx.globalAlpha = appear * fade;
    ctx.drawImage(art.c, cx - art.S / 2, cy - art.S / 2, art.S, art.S);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 7]); ctx.lineDashOffset = -t * 6;
    ctx.strokeStyle = 'rgba(183,191,217,.28)';
    ctx.beginPath(); ctx.arc(cx, cy, mark.size * .6, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    const ro = mark.size * .76;
    for (let i = 0; i < 3; i++) {
      const a = (reduced ? 0 : t * .22) + i * Math.PI * 2 / 3 - Math.PI / 2;
      const trail = ctx.createLinearGradient(cx + Math.cos(a - .7) * ro, cy + Math.sin(a - .7) * ro, cx + Math.cos(a) * ro, cy + Math.sin(a) * ro);
      trail.addColorStop(0, 'rgba(255,90,60,0)'); trail.addColorStop(1, 'rgba(255,90,60,.75)');
      ctx.strokeStyle = trail; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, ro, a - .7, a); ctx.stroke();
      const nx = cx + Math.cos(a) * ro, ny = cy + Math.sin(a) * ro;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(GLOW.c, nx - 9, ny - 9, 18, 18);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FF5A3C'; ctx.fillRect(nx - 2.5, ny - 2.5, 5, 5);
    }
    ctx.restore();

    // dots
    const R = 110;
    const sweep = ((t * .24) % 1) * 1.5 - .25;  // light band position along the arrow (0 = base, 1 = peak)
    const lit = [];
    for (const d of dots) {
      let x, y;
      if (d.kind === 'f') {
        x = d.fx * W + Math.sin(t * d.sp + d.ph) * 24;
        y = d.fy * H + Math.cos(t * d.sp * .8 + d.ph) * 18 - scroll * H * .25 * (d.fy + .3);
      } else {
        const f = reduced ? 1 : easeOut(clamp(g * 1.55 - d.delay));
        const sx = d.sx * W + Math.sin(t * d.sp + d.ph) * 30;
        const sy = d.sy * H + Math.cos(t * d.sp + d.ph) * 22;
        const tx = toX(d.lx) + Math.sin(t * .9 + d.ph) * .9;
        const ty = toY(d.ly) + Math.cos(t * .7 + d.ph) * .9;
        x = sx + (tx - sx) * f;
        y = sy + (ty - sy) * f;
      }
      if (finePointer && !reduced) {
        const dx = x - mouse.x, dy = y - mouse.y, dist = Math.hypot(dx, dy);
        let px = 0, py = 0;
        if (dist < R && dist > .01) { const p = (1 - dist / R) * 22; px = dx / dist * p; py = dy / dist * p; }
        d.ox += (px - d.ox) * .1; d.oy += (py - d.oy) * .1;
        x += d.ox; y += d.oy;
      }
      ctx.globalAlpha = d.kind === 'f' ? fade : fade;
      ctx.fillStyle = d.col;
      ctx.fillRect(x - d.size / 2, y - d.size / 2, d.size, d.size);
      if (d.kind !== 'f' && settled > 0) {
        const b = Math.exp(-Math.pow((d.p - sweep) / .07, 2));
        if (b > .04) lit.push(x, y, d.size, b, d.kind === 'c' ? 1 : 0);
      }
    }

    ctx.globalCompositeOperation = 'lighter';

    // light band sweeping up the arrow
    for (let i = 0; i < lit.length; i += 5) {
      const b = lit[i + 3] * settled * fade, s = lit[i + 2] * (1 + lit[i + 3] * .9);
      ctx.globalAlpha = b * .85;
      ctx.fillStyle = lit[i + 4] ? '#FFC2B4' : '#FFFFFF';
      ctx.fillRect(lit[i] - s / 2, lit[i + 1] - s / 2, s, s);
      if (b > .5 && (i / 5) % 4 === 0) { ctx.globalAlpha = b * .18; const r = 7; ctx.drawImage(lit[i + 4] ? GLOW.c : GLOW.w, lit[i] - r, lit[i + 1] - r, r * 2, r * 2); }
    }

    // followers streaming up into the mark
    if (!reduced && settled > 0) {
      const baseY = cy + mark.size * .5;
      for (let i = 0; i < sparks.length; i++) {
        let s = sparks[i];
        s.age += dt;
        if (s.age > s.life) { s = sparks[i] = newSpark(false); }
        const u = s.age / s.life;
        const e = u * u * (3 - 2 * u);
        const x0 = cx + s.bx * mark.size * .42, y0 = baseY + mark.size * .14;
        const x1 = toX(s.lx), y1 = toY(s.ly);
        const x = x0 + (x1 - x0) * e + Math.sin(u * 6 + s.ph) * 6 * s.sway * (1 - u);
        const y = y0 + (y1 - y0) * e;
        const a = Math.sin(Math.PI * u) * settled * fade;
        const r = s.r * (1.4 - u * .6);
        ctx.globalAlpha = a * .55;
        ctx.drawImage(s.kind === 'c' ? GLOW.c : GLOW.w, x - r * 3, y - r * 3, r * 6, r * 6);
        ctx.globalAlpha = a;
        ctx.fillStyle = s.kind === 'c' ? '#FF8A70' : '#FFFFFF';
        ctx.fillRect(x - .9, y - .9, 1.8, 1.8);
      }
    }

    // the peak pulses
    const pulse = .55 + .45 * Math.sin(t * 2.1);
    const pr = mark.size * (.07 + pulse * .035);
    ctx.globalAlpha = (.35 + pulse * .35) * settled * fade;
    ctx.drawImage(GLOW.c, toX(PEAK[0]) - pr, toY(PEAK[1]) - pr, pr * 2, pr * 2);
    ctx.globalAlpha = (.5 + pulse * .5) * settled * fade;
    ctx.drawImage(GLOW.w, toX(PEAK[0]) - pr * .3, toY(PEAK[1]) - pr * .3, pr * .6, pr * .6);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (running) raf = requestAnimationFrame(draw);
  }

  function play() { if (running || reduced) return; running = true; draw.last = 0; raf = requestAnimationFrame(draw); }
  function pause() { running = false; cancelAnimationFrame(raf); }

  layout();
  if (reduced) { start = performance.now(); draw(start); }
  else {
    // the dots gather once the stage is well in view (at once on Home, where it is on the first screen)
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { start = performance.now(); io.disconnect(); } }, { threshold: .35 }).observe(stage);
    new IntersectionObserver(([e]) => (e.isIntersecting ? play() : pause())).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  }

  // fonts and images can move the stage after first paint
  const relayout = () => { layout(); if (reduced) draw(performance.now()); };
  document.fonts?.ready.then(relayout);
  window.addEventListener('load', relayout);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(relayout, 150); });
  if (finePointer) {
    hero.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  }
})();
