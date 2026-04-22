/* chill-city — 導覽列、行動選單、捲動動畫、分節高亮 */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // 年份
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 捲動時改變導覽樣式
  const nav = $('#nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 16);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // 行動版選單
  const navToggle = $('#navToggle');
  const navLinks  = $('#navLinks');
  if (navToggle && navLinks) {
    const close = () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', '開啟選單');
    };
    const open = () => {
      navToggle.classList.add('open');
      navLinks.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', '關閉選單');
    };
    navToggle.addEventListener('click', () => {
      navLinks.classList.contains('open') ? close() : open();
    });
    // 點任何連結都要收起
    $$('#navLinks a').forEach(a => a.addEventListener('click', close));
    // 視窗放大（離開行動模式）時收起
    const mq = window.matchMedia('(min-width: 961px)');
    mq.addEventListener('change', (e) => { if (e.matches) close(); });
    // Esc 關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) close();
    });
  }

  // Reveal on scroll
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // 導覽列 active 高亮（依捲動位置）
  const sections = ['#about', '#gameplay', '#vehicles', '#clothing', '#newbie', '#team']
    .map(id => $(id))
    .filter(Boolean);
  const navAnchors = $$('#navLinks a[href^="#"]');
  if ('IntersectionObserver' in window && sections.length && navAnchors.length) {
    const setActive = (id) => {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    };
    const spyIO = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(sec => spyIO.observe(sec));
  }
})();
