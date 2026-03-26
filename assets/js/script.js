/* ================================================
   M.Tech Study Portal — Main JavaScript
   Navigation, Themes, Animations, Subject Routing
   ================================================ */

(function () {
  'use strict';

  // ── CONSTANTS ──
  const SUBJECTS = {
    maths: { name: 'Mathematical Foundations', code: 'MTCT1101', path: 'subjects/maths.html' },
    dsa: { name: 'Advanced DSA', code: 'MTCS1102', path: 'subjects/dsa.html' },
    cloud: { name: 'Cloud Computing', code: 'MTCS1103', path: 'subjects/cloud.html' },
    ml: { name: 'Machine Learning', code: 'MTCS1104', path: 'subjects/ml.html' }
  };

  const THEME_KEY = 'studyportal-theme';
  const RECENT_KEY = 'studyportal-recent';

  // ── DOM ELEMENTS ──
  const html = document.documentElement;
  const navbar = document.getElementById('navbar');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const scrollTopBtn = document.getElementById('scrollTop');

  // ── THEME MANAGEMENT ──
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Initialize theme
  setTheme(getTheme());
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // ── NAVIGATION ──
  // Scroll effects
  let lastScroll = 0;
  function handleScroll() {
    const scrollY = window.scrollY;

    // Navbar background
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 50);
    }

    // Scroll-to-top button
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', scrollY > 500);
    }

    // Active nav link based on section
    if (navLinks) {
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        const bottom = top + section.offsetHeight;
        const link = navLinks.querySelector(`a[href="#${section.id}"]`);
        if (link) {
          link.classList.toggle('active', scrollY >= top && scrollY < bottom);
        }
      });
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Scroll to top
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Hamburger menu
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      const isOpen = navLinks.classList.contains('open');
      spans[0].style.transform = isOpen ? 'rotate(45deg) translate(6px, 6px)' : '';
      spans[1].style.opacity = isOpen ? '0' : '1';
      spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(6px, -6px)' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
      });
    });
  }

  // ── SUBJECT NAVIGATION ──
  window.openSubject = function (subject) {
    const subj = SUBJECTS[subject];
    if (!subj) return;

    // Save to recent
    localStorage.setItem(RECENT_KEY, JSON.stringify({
      key: subject,
      name: subj.name,
      timestamp: Date.now()
    }));

    // Navigate
    window.location.href = subj.path;
  };

  // ── RECENTLY OPENED ──
  function loadRecent() {
    const recentSection = document.getElementById('recent');
    const recentName = document.getElementById('recentSubjectName');
    const recentBtn = document.getElementById('recentBtn');

    if (!recentSection) return;

    try {
      const data = JSON.parse(localStorage.getItem(RECENT_KEY));
      if (data && data.key && SUBJECTS[data.key]) {
        recentSection.style.display = 'block';
        if (recentName) recentName.textContent = data.name;
        if (recentBtn) {
          recentBtn.href = SUBJECTS[data.key].path;
          recentBtn.onclick = function (e) {
            e.preventDefault();
            openSubject(data.key);
          };
        }
      }
    } catch (e) { /* ignore */ }
  }

  // ── SCROLL REVEAL ANIMATIONS ──
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation
          const delay = Array.from(reveals).indexOf(entry.target) % 4;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay * 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  // ── COUNTER ANIMATION ──
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(eased * target);
      el.textContent = current + (target > 50 ? '+' : '');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + (target > 50 ? '+' : '');
    }

    requestAnimationFrame(update);
  }

  // ── SMOOTH SCROLL FOR ANCHOR LINKS ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── CARD HOVER GLOW EFFECT ──
  function initCardGlow() {
    document.querySelectorAll('.subject-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const glow = card.querySelector('.card-glow');
        if (glow) {
          glow.style.left = `${x - rect.width}px`;
          glow.style.top = `${y - rect.height}px`;
        }
      });
    });
  }

  // ── KEYBOARD NAVIGATION ──
  document.addEventListener('keydown', (e) => {
    // Press 1-4 to open subjects
    if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const keys = ['maths', 'dsa', 'cloud', 'ml'];
      const target = e.target;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        // Only if not typing in an input
        // openSubject(keys[parseInt(e.key) - 1]); // Uncomment to enable
      }
    }

    // Escape to close mobile menu
    if (e.key === 'Escape' && navLinks) {
      navLinks.classList.remove('open');
    }
  });

  // ── INITIALIZE ──
  function init() {
    handleScroll();
    loadRecent();
    initRevealAnimations();
    initCounters();
    initCardGlow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
