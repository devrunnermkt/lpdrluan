/* ==========================================================================
   DOC START · Página de vendas
   ========================================================================== */

/* ---------------- CONFIGURAÇÃO ----------------
   Preencha os links finais. Todos os botões [data-checkout] e links
   [data-whatsapp] são atualizados automaticamente.
------------------------------------------------ */
const DOC_START_CONFIG = {
  checkoutUrl: 'LINK_CHECKOUT_DOC_START', // ex.: https://pay.plataforma.com/...
  whatsappUrl: 'WHATSAPP_DOC_START'       // ex.: https://wa.me/55DDDNUMERO
};

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const isPlaceholder = (url) => !/^https?:\/\//i.test(url);

  /* ---------- Links + eventos de conversão ---------- */
  document.querySelectorAll('[data-checkout]').forEach((el) => {
    el.setAttribute('href', DOC_START_CONFIG.checkoutUrl);
    el.addEventListener('click', (ev) => {
      if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout', { value: 1299, currency: 'BRL' });
      if (typeof window.gtag === 'function') window.gtag('event', 'begin_checkout', { value: 1299, currency: 'BRL', cta_origem: el.dataset.cta || 'cta' });
      if (isPlaceholder(DOC_START_CONFIG.checkoutUrl)) {
        ev.preventDefault();
        console.warn('[DOC START] Configure o link de checkout em js/main.js.');
      }
    });
  });

  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    el.setAttribute('href', DOC_START_CONFIG.whatsappUrl);
    el.addEventListener('click', (ev) => {
      if (typeof window.fbq === 'function') window.fbq('track', 'Contact');
      if (isPlaceholder(DOC_START_CONFIG.whatsappUrl)) {
        ev.preventDefault();
        console.warn('[DOC START] Configure o link do WhatsApp em js/main.js.');
      }
    });
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Cabeçalho ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Revelação suave ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (hasIO && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealEls.forEach((el) => {
      const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i * 60, 360) + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Sequências que acendem passo a passo ----------
     Método: acende os 6 passos e mantém acesos.
     Simulador: percorre o fluxo em loop enquanto está visível. */
  const lightUp = (list, { loop }) => {
    const items = Array.from(list.children);
    if (reduceMotion || !hasIO) { items.forEach((li) => li.classList.add('is-on')); return; }
    let timer = null;
    let i = 0;
    const tick = () => {
      if (loop) items.forEach((li, k) => li.classList.toggle('is-on', k === i));
      else items[i].classList.add('is-on');
      i += 1;
      if (i >= items.length) {
        if (!loop) { clearInterval(timer); timer = null; return; }
        i = 0;
      }
    };
    new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !timer && (loop || i < items.length)) { tick(); timer = setInterval(tick, loop ? 1300 : 380); }
      if (!visible && timer && loop) { clearInterval(timer); timer = null; }
    }, { threshold: 0.35 }).observe(list);
  };

  const steps = document.querySelector('[data-cycle]');
  if (steps) lightUp(steps, { loop: false });
  const flow = document.querySelector('[data-flow]');
  if (flow) lightUp(flow, { loop: true });

  /* ---------- CTA fixo (mobile) ---------- */
  const sticky = document.querySelector('[data-sticky-cta]');
  if (sticky && hasIO) {
    const hero = document.querySelector('.hero');
    const zones = [document.querySelector('#oferta'), document.querySelector('.final')].filter(Boolean);
    const zoneOn = new Set();
    let heroOn = true;
    const link = sticky.querySelector('a');
    const render = () => {
      const show = !heroOn && zoneOn.size === 0;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      link.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver((e) => { heroOn = e[0].isIntersecting; render(); }, { threshold: 0.05 }).observe(hero);
    const zio = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? zoneOn.add(e.target) : zoneOn.delete(e.target)));
      render();
    }, { threshold: 0.15 });
    zones.forEach((z) => zio.observe(z));
  }
})();
