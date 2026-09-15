/* «Янтарная Морошка» — интерактив */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Шапка при скролле ---------- */
  const header = $('.header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  const burger = $('.burger');
  const mMenu = $('.mobile-menu');
  if (burger && mMenu) {
    burger.addEventListener('click', () => {
      const open = mMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      $$('.mobile-menu a').forEach((a, i) => (a.style.transitionDelay = open ? 0.06 * i + 's' : '0s'));
    });
    $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
      mMenu.classList.remove('is-open');
      burger.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }));
  }

  /* Кастомный курсор отключён по правке заказчика */

  /* ---------- Scroll Reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- CountUp ---------- */
  const fmt = n => n.toLocaleString('ru-RU');
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, target = +el.dataset.count, dur = 1600, t0 = performance.now();
      const tick = t => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- До / После ---------- */
  const BA_DATA = {
    nails: { before: 'assets/img/before-nails.jpg', after: 'assets/img/after-nails.jpg', caption: 'Маникюр с покрытием гель-лак — работа мастера Анны' },
    hair:  { before: 'assets/img/before-hair.jpg',  after: 'assets/img/after-hair.jpg',  caption: 'Сложное окрашивание AirTouch и уход — работа Марины' },
    brows: { before: 'assets/img/before-brows.jpg', after: 'assets/img/after-brows.jpg', caption: 'Ламинирование бровей и окрашивание — работа Ольги' },
  };
  const ba = $('.ba');
  if (ba) {
    const imgB = $('.ba__before', ba), imgA = $('.ba__after', ba);
    const caption = $('.ba__caption');
    const setPos = p => {
      p = Math.max(2, Math.min(98, p));
      ba.style.setProperty('--pos', p + '%');
    };
    const fromEvent = e => {
      const r = ba.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX);
      setPos(((cx - r.left) / r.width) * 100);
    };
    let dragging = false;
    ba.addEventListener('pointerdown', e => { dragging = true; fromEvent(e); ba.setPointerCapture(e.pointerId); });
    ba.addEventListener('pointermove', e => dragging && fromEvent(e));
    addEventListener('pointerup', () => (dragging = false));
    const range = $('input[type=range]', ba);
    if (range) range.addEventListener('input', () => setPos(+range.value));
    $$('.ba-tab').forEach(tab => tab.addEventListener('click', () => {
      $$('.ba-tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const d = BA_DATA[tab.dataset.ba];
      if (!d) return;
      imgB.src = d.before; imgA.src = d.after;
      if (caption) caption.textContent = d.caption;
    }));
  }

  /* ---------- Карусель отзывов ---------- */
  const track = $('.reviews__track');
  if (track) {
    const cards = $$('.review-card', track);
    const dotsWrap = $('.reviews__dots');
    let idx = 0, perView = 3, timer;
    const maxIdx = () => Math.max(0, cards.length - perView);
    const calcPerView = () => { perView = innerWidth < 640 ? 1 : innerWidth < 1080 ? 2 : 3; };
    const render = () => {
      track.style.transform = `translateX(${-idx * (100 / perView)}%)`;
      $$('.reviews__dot').forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };
    const buildDots = () => {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIdx(); i++) {
        const b = document.createElement('button');
        b.className = 'reviews__dot';
        b.setAttribute('aria-label', 'Отзыв ' + (i + 1));
        b.addEventListener('click', () => { idx = i; render(); restart(); });
        dotsWrap.append(b);
      }
    };
    const step = dir => { idx = (idx + dir + maxIdx() + 1) % (maxIdx() + 1); render(); };
    const restart = () => { clearInterval(timer); timer = setInterval(() => step(1), 5200); };
    $('.reviews__btn--prev').addEventListener('click', () => { step(-1); restart(); });
    $('.reviews__btn--next').addEventListener('click', () => { step(1); restart(); });
    addEventListener('resize', () => { calcPerView(); idx = Math.min(idx, maxIdx()); buildDots(); render(); });
    track.closest('.reviews').addEventListener('mouseenter', () => clearInterval(timer));
    track.closest('.reviews').addEventListener('mouseleave', restart);
    calcPerView(); buildDots(); render(); restart();
  }

  /* ---------- FAQ ---------- */
  $$('.faq-item').forEach(item => {
    const q = $('.faq-item__q', item), a = $('.faq-item__a', item);
    q.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      $$('.faq-item.is-open').forEach(o => {
        o.classList.remove('is-open');
        $('.faq-item__a', o).style.maxHeight = 0;
        $('.faq-item__q', o).setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Модалка записи ---------- */
  const modal = $('#booking-modal');
  const form = $('#booking-form');
  const success = $('.form-success');
  const serviceSelect = $('#f-service');
  let lastFocus = null;

  const openModal = (service) => {
    lastFocus = document.activeElement;
    if (service && serviceSelect) {
      const opt = [...serviceSelect.options].find(o => o.value.toLowerCase().includes(service.toLowerCase()));
      if (opt) serviceSelect.value = opt.value;
    }
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#f-name') && $('#f-name').focus(), 250);
  };
  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
    setTimeout(() => { form.style.display = ''; success.classList.remove('is-shown'); }, 300);
  };

  $$('[data-book]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    openModal(btn.dataset.service || '');
    const master = btn.dataset.master;
    if (master) {
      const c = $('#f-comment');
      if (c) c.value = 'Хочу записаться к мастеру: ' + master;
    }
  }));
  $('.modal__close', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', e => e.target === modal && closeModal());
  addEventListener('keydown', e => e.key === 'Escape' && modal.classList.contains('is-open') && closeModal());

  /* Авто-подстановка услуги из ?service= */
  const qs = new URLSearchParams(location.search).get('service');
  if (qs && serviceSelect) {
    const opt = [...serviceSelect.options].find(o => o.value.toLowerCase().includes(qs.toLowerCase()));
    if (opt) serviceSelect.value = opt.value;
  }

  /* ---------- Маска телефона +7 (___) ___-__-__ ---------- */
  const phone = $('#f-phone');
  if (phone) {
    phone.addEventListener('input', () => {
      let d = phone.value.replace(/\D/g, '');
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (!d.startsWith('7')) d = '7' + d;
      d = d.slice(0, 11);
      let out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 5) out += ') ' + d.slice(4, 7);
      if (d.length >= 8) out += '-' + d.slice(7, 9);
      if (d.length >= 10) out += '-' + d.slice(9, 11);
      phone.value = out;
    });
  }

  /* ---------- Валидация + отправка ---------- */
  const setErr = (id, bad) => {
    const f = $(id).closest('.field');
    f.classList.toggle('has-error', bad);
    return !bad;
  };
  if (form) {
    /* min date = сегодня */
    const date = $('#f-date');
    if (date) date.min = new Date().toISOString().split('T')[0];

    form.addEventListener('submit', e => {
      e.preventDefault();
      const okName = setErr('#f-name', $('#f-name').value.trim().length < 2);
      const okPhone = setErr('#f-phone', phone.value.replace(/\D/g, '').length !== 11);
      const okServ = setErr('#f-service', !serviceSelect.value);
      if (!okName || !okPhone || !okServ) return;

      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      btn.textContent = 'Отправляем…';

      /*
        ИНТЕГРАЦИЯ YClients + Telegram (по ТЗ, п. 4.1–4.2):
        здесь POST на коннектор (ApiMonster) или на endpoint бэкенда,
        который создаёт запись через YClients API (book_record, company_id)
        и дублирует заявку в Telegram-чат администратора.
      */
      const lead = {
        name: $('#f-name').value.trim(),
        phone: phone.value,
        service: serviceSelect.value,
        date: date ? date.value : '',
        time: $('#f-time') ? $('#f-time').value : '',
        comment: $('#f-comment') ? $('#f-comment').value : '',
        ts: new Date().toISOString(),
        source: 'site-moroshka',
      };
      console.info('[lead → YClients + Telegram]', lead);
      try {
        const leads = JSON.parse(localStorage.getItem('moroshka_leads') || '[]');
        leads.push(lead);
        localStorage.setItem('moroshka_leads', JSON.stringify(leads));
      } catch (_) {}

      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('is-shown');
        btn.disabled = false;
        btn.innerHTML = 'Записаться онлайн';
        form.reset();
      }, 1000);
    });
  }

  /* ---------- Политика конфиденциальности ---------- */
  const privModal = $('#privacy-modal');
  if (privModal) {
    $$('[data-privacy]').forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      privModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }));
    const closeP = () => { privModal.classList.remove('is-open'); document.body.style.overflow = ''; };
    $('.modal__close', privModal).addEventListener('click', closeP);
    privModal.addEventListener('click', e => e.target === privModal && closeP());
    addEventListener('keydown', e => e.key === 'Escape' && closeP());
  }

})();
