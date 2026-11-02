// polish.js — শুধু দেখতে সুন্দর করার ছোট কোড (ডেটা বা হিসাবে কিছু বদলায় না)
(function () {
  'use strict';

  // বাংলা: ১. মোবাইলে মেনু বাটন
  function setupMobileMenu() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar || document.querySelector('.hms-menu-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'hms-menu-btn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.textContent = 'Menu';
    var back = document.createElement('div');
    back.className = 'hms-backdrop';
    function toggle(open) {
      sidebar.classList.toggle('open', open);
      back.classList.toggle('show', open);
    }
    btn.addEventListener('click', function () { toggle(!sidebar.classList.contains('open')); });
    back.addEventListener('click', function () { toggle(false); });
    document.body.appendChild(btn);
    document.body.appendChild(back);
  }

  // বাংলা: ২. ড্যাশবোর্ডে শুভেচ্ছা ও আজকের তারিখ
  function setupGreeting() {
    var title = document.querySelector('.page-header .page-title');
    if (!title || !/Dashboard/i.test(title.textContent) || document.querySelector('.hms-greeting')) return;
    var h = new Date().getHours();
    var greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    var date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var el = document.createElement('div');
    el.className = 'hms-greeting';
    el.textContent = greet + ' · ' + date;
    title.parentNode.appendChild(el);
  }

  // বাংলা: ৩. স্ট্যাট সংখ্যা গুনে গুনে ওঠার অ্যানিমেশন (যেমন Tk 18,400)
  function animateValue(el) {
    var text = el.textContent;
    var m = text.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m || el._hmsAnim) return;
    var target = parseInt(m[2].replace(/,/g, ''), 10);
    if (!isFinite(target) || target === 0) return;
    var start = null, dur = 700;
    el._hmsAnim = true;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + Math.round(target * eased).toLocaleString('en-US') + m[3];
      if (p < 1) requestAnimationFrame(step);
      else { el.textContent = text; el._hmsAnim = false; } // বাংলা: শেষে হুবহু আসল লেখা ফিরিয়ে দেয়
    }
    requestAnimationFrame(step);
  }
  function setupCountUp() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    document.querySelectorAll('.stat-value').forEach(function (el) {
      var last = '';
      new MutationObserver(function () {
        if (el._hmsAnim || el.textContent === last) return;
        last = el.textContent;
        animateValue(el);
      }).observe(el, { childList: true, characterData: true, subtree: true });
      animateValue(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupGreeting();
    setupCountUp();
  });
})();
