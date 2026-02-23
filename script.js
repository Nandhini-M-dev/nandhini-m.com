/* ============================================
   script.js — Premium interactions
   Gold particles · 3D tilt · Scroll reveal
   Deferred, non-blocking, mobile-aware
   ============================================ */

(function () {
  'use strict';

  // ─── Custom Cursor (pointer: fine only) ─────
  var dot = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');

  if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
    var mx = 0, my = 0;   // mouse position
    var rx = 0, ry = 0;   // ring position (lerped)

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    // Smooth ring follow
    (function lerpRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(lerpRing);
    })();

    // ─── Cursor: gold default, black on button hover ──
    function setCursorBlack() {
      dot.style.background = '#111111';
      ring.style.borderColor = '#111111';
    }

    function resetCursorGold() {
      dot.style.background = '';
      ring.style.borderColor = '';
    }

    // Grow ring + turn black on interactive elements
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, input, textarea, select, .skill-tag, .cert-chip, .project-card')) {
        ring.classList.add('hover');
        setCursorBlack();
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, input, textarea, select, .skill-tag, .cert-chip, .project-card')) {
        ring.classList.remove('hover');
        resetCursorGold();
      }
    });
  }

  // ─── Theme Toggle ───────────────────────────
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var stored = localStorage.getItem('theme');

  if (stored) {
    root.setAttribute('data-theme', stored);
  } else {
    root.setAttribute('data-theme', 'dark');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = (root.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      // Update particle color on theme change
      if (particles.length) {
        var gold = next === 'light' ? 'rgba(140, 106, 46,' : 'rgba(198, 167, 94,';
        particles.forEach(function (p) { p.goldBase = gold; });
      }
    });
  }

  // ─── Combined Scroll Handler (single listener) ──
  var navbar = document.getElementById('navbar');
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  var scrollTopBtn = document.getElementById('scrollTop');
  var heroSection = document.getElementById('hero');
  var scrollTicking = false;

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(function () {
      var sy = window.scrollY;

      // Navbar background
      if (navbar) navbar.classList.toggle('scrolled', sy > 60);

      // Active nav link
      var y = sy + 200;
      sections.forEach(function (s) {
        if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
          var id = s.getAttribute('id');
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });

      // Scroll-to-top visibility
      if (scrollTopBtn && heroSection) {
        scrollTopBtn.classList.toggle('visible', sy > heroSection.offsetHeight);
      }

      scrollTicking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Mobile Menu ────────────────────────────
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.classList.toggle('active');
      menuBtn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Contact Form (Web3Forms AJAX) ──────────
  var form = document.getElementById('contactForm');
  var formBtn = document.getElementById('formBtn');
  var formBtnText = document.getElementById('formBtnText');
  var formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      formBtn.disabled = true;
      formBtnText.textContent = 'Sending...';
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      var data = new FormData(form);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (result.success) {
          formStatus.textContent = 'Message sent successfully!';
          formStatus.classList.add('success');
          form.reset();
        } else {
          formStatus.textContent = 'Something went wrong. Please try again.';
          formStatus.classList.add('error');
        }
      })
      .catch(function () {
        formStatus.textContent = 'Network error. Please try again.';
        formStatus.classList.add('error');
      })
      .finally(function () {
        formBtn.disabled = false;
        formBtnText.textContent = 'Send Message';
      });
    });
  }

  // ─── Scroll Reveal (Intersection Observer) ──
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObs.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ─── Gold Particle Canvas (Desktop only) ────
  var canvas = document.getElementById('heroCanvas');
  var particles = [];
  var animId = null;

  function isMobile() {
    return window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initParticles() {
    if (!canvas || isMobile()) {
      if (canvas) canvas.style.display = 'none';
      return;
    }

    canvas.style.display = '';
    var ctx = canvas.getContext('2d');
    var w, h;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    }

    resize();

    var isLight = root.getAttribute('data-theme') === 'light';
    var count = Math.min(Math.floor(w * h / 4000), 50); // dense particles, cap at 200

    particles = [];
    for (var i = 0; i < count; i++) {
      var twinkleSpeed = Math.random() * 0.02 + 0.005;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.0 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.3 - 0.1,
        alpha: Math.random() * 0.5 + 0.15,
        alphaBase: Math.random() * 0.5 + 0.15,
        twinkleSpeed: twinkleSpeed,
        twinkleOffset: Math.random() * Math.PI * 2,
        goldBase: isLight ? 'rgba(140, 106, 46,' : 'rgba(198, 167, 94,'
      });
    }

    var frameCount = 0;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      frameCount++;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.dx;
        p.y += p.dy;

        // Twinkle: oscillate alpha
        p.alpha = p.alphaBase + Math.sin(frameCount * p.twinkleSpeed + p.twinkleOffset) * 0.2;
        if (p.alpha < 0.05) p.alpha = 0.05;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.goldBase + p.alpha + ')';
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    draw();

    // Resize handler
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (isMobile()) {
          cancelAnimationFrame(animId);
          canvas.style.display = 'none';
          particles = [];
        } else {
          resize();
        }
      }, 200);
    });
  }

  initParticles();

  // ─── 3D Tilt on Project Cards (Desktop) ─────
  if (!isMobile()) {
    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card) {
      card.classList.add('tilt-hover');

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;

        var rotY = ((x - cx) / cx) * 3;  // max 3deg
        var rotX = ((cy - y) / cy) * 2;  // max 2deg

        card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-6px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

})();
