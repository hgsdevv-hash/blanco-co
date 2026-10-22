(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Abertura: tesoura corta, máquina passa, cabelos caem */
  const intro = $('#intro');
  const endIntro = () => {
    intro.classList.add('is-done');
    document.body.classList.remove('is-loading');
    setTimeout(() => intro.remove(), 1000);
  };
  if (reduce || sessionStorage.getItem('blanco-intro')) {
    intro.remove();
    document.body.classList.remove('is-loading');
  } else {
    try { sessionStorage.setItem('blanco-intro', '1'); } catch (e) {}
    const hairs = $('.intro__hairs');
    const drop = (n, xFrom, xTo, yPct) => {
      for (let i = 0; i < n; i++) {
        const h = document.createElement('span');
        h.className = 'hair';
        h.style.left = (xFrom + Math.random() * (xTo - xFrom)) + '%';
        h.style.top = yPct + '%';
        h.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
        h.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
        h.style.animationDelay = (Math.random() * 300) + 'ms';
        hairs.appendChild(h);
      }
    };
    setTimeout(() => drop(18, 30, 70, 46), 900);   // tesoura
    setTimeout(() => drop(30, 35, 65, 62), 1800);  // máquina
    setTimeout(endIntro, 2900);
    intro.addEventListener('click', endIntro, { once: true });
  }

  /* Navegação some ao descer, volta ao subir */
  const nav = $('.nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-hidden', y > lastY && y > 200);
    lastY = y;
  }, { passive: true });

  /* Entradas por seção, em cascata */
  $$('.letter__col > *, .services__list > h2, .services__intro, .svc li, .work__head > *, .look__card, .slip-sec__text > *, .slip, .space__text > *, .ba, .space__strip img, .contact > *, .foot__menu nav a')
    .forEach(el => el.classList.add('rv'));
  const groups = new Map();
  $$('.rv').forEach(el => {
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i * 70, 420) + 'ms');
    groups.set(p, i + 1);
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* Nome do hero pesa ao rolar */
  const word = $('.hero__word');
  const tick = () => { if (!reduce) word.style.transform = `scale(${1 - Math.min(scrollY / innerHeight, 1) * 0.07})`; };
  addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });

  /* Cortes: carrossel com setas, arrastar e barra de progresso */
  const look = $('#look'), bar = $('#lookBar');
  const arrows = $$('.look__arrow');
  const step = () => look.querySelector('.look__card').offsetWidth + 16;
  const sync = () => {
    const max = look.scrollWidth - look.clientWidth;
    const p = max > 0 ? look.scrollLeft / max : 0;
    const w = look.clientWidth / look.scrollWidth;
    bar.style.width = (w * 100) + '%';
    bar.style.transform = `translateX(${p * (1 / w - 1) * 100}%)`;
    arrows[0].disabled = look.scrollLeft < 4;
    arrows[1].disabled = look.scrollLeft > max - 4;
  };
  arrows.forEach(b => b.addEventListener('click', () => look.scrollBy({ left: step() * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' })));
  look.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  look.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); arrows[1].click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); arrows[0].click(); }
  });
  // arrastar com o mouse (no toque o navegador já faz)
  let dragX = null, startLeft = 0;
  look.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    dragX = e.clientX; startLeft = look.scrollLeft;
  });
  addEventListener('pointermove', e => {
    if (dragX === null) return;
    if (Math.abs(e.clientX - dragX) > 4) look.classList.add('is-drag');
    look.scrollLeft = startLeft - (e.clientX - dragX);
  });
  addEventListener('pointerup', () => {
    if (dragX === null) return;
    dragX = null;
    if (!look.classList.contains('is-drag')) return;
    const left = look.scrollLeft;
    look.classList.remove('is-drag');
    look.scrollLeft = left;
    look.scrollTo({ left: Math.round(left / step()) * step(), behavior: 'smooth' });
  });
  addEventListener('resize', sync);
  sync();

  /* Serviços: linha ativa troca a foto; toque soma tempo e valor */
  const img = $('#servImg');
  const rows = $$('.svc__row');
  const setActive = row => {
    $$('.svc li').forEach(li => li.classList.toggle('is-active', li === row.parentElement));
    const src = row.dataset.img;
    if (img.getAttribute('src') === src) return;
    img.classList.add('is-swap');
    setTimeout(() => { img.src = src; img.alt = row.querySelector('.svc__name').textContent; img.classList.remove('is-swap'); }, 220);
  };
  const tMin = $('#tMin'), tPrice = $('#tPrice'), tBtn = $('#tBtn');
  const bump = el => { el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 180); };
  const update = () => {
    const on = rows.filter(r => r.getAttribute('aria-pressed') === 'true');
    const min = on.reduce((a, r) => a + +r.dataset.min, 0);
    const price = on.reduce((a, r) => a + +r.dataset.price, 0);
    const h = Math.floor(min / 60), m = min % 60;
    tMin.textContent = h ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${min} min`;
    tPrice.textContent = `R$ ${price}`;
    bump(tMin); bump(tPrice);
    tBtn.textContent = on.length ? `Agendar ${on.length > 1 ? on.length + ' serviços' : on[0].querySelector('.svc__name').textContent.toLowerCase()}` : 'Escolher um serviço';
  };
  rows.forEach(r => {
    r.addEventListener('mouseenter', () => setActive(r));
    r.addEventListener('focus', () => setActive(r));
    r.addEventListener('click', () => {
      r.setAttribute('aria-pressed', r.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      setActive(r);
      update();
    });
  });
  setActive(rows[0]);

  /* Antes e depois */
  const ba = $('#ba'), range = $('#baRange');
  range.addEventListener('input', () => ba.style.setProperty('--x', range.value + '%'));
})();
