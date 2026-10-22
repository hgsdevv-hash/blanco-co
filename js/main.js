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
  $$('.letter__col > *, .services__list > h2, .services__intro, .svc li, .slip-sec__text > *, .slip, .space__text > *, .ba, .space__strip img, .contact > *, .foot__menu nav a')
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

  /* Scroll: nome do hero pesa, costura dos cortes rasga */
  const word = $('.hero__word');
  const seams = $$('[data-seam]');
  const tick = () => {
    const vh = innerHeight;
    if (!reduce) {
      const p = Math.min(scrollY / vh, 1);
      word.style.transform = `scale(${1 - p * 0.07})`;
      seams.forEach(s => {
        const r = s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        // 0 quando o projeto está centrado; -1 entrando, +1 saindo
        const t = Math.max(-1, Math.min(1, (-r.top - (r.height - vh) / 2) / (r.height / 2)));
        const st = s.style;
        st.setProperty('--pl', (-t * 10) + 'svh');
        st.setProperty('--pr', (t * 10) + 'svh');
        st.setProperty('--tl', (-t * 30) + 'svh');
        st.setProperty('--tr', (t * 30) + 'svh');
      });
    }
  };
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); }, { passive: true });
  addEventListener('resize', tick);
  tick();

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
