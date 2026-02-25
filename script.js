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
      if (!document.hidden) {
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
      }
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
  var scrollProgress = document.getElementById('scrollProgress');
  var scrollTicking = false;
  var heroVisible = true;

  // Pause heavy canvas animations when hero scrolls off-screen
  if (heroSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(heroSection);
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(function () {
      var sy = window.scrollY;

      // Navbar background
      if (navbar) navbar.classList.toggle('scrolled', sy > 60);

      // Scroll progress line
      if (scrollProgress) {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docH > 0 ? (sy / docH) * 100 : 0;
        scrollProgress.style.width = pct + '%';
      }

      // Active nav link
      var y = sy + 200;
      sections.forEach(function (s) {
        if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
          var id = s.getAttribute('id');
          navLinks.forEach(function (a) {
            var isActive = a.getAttribute('href') === '#' + id;
            a.classList.toggle('active', isActive);
            if (isActive) {
              a.setAttribute('aria-current', 'true');
            } else {
              a.removeAttribute('aria-current');
            }
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
  // Defer to avoid blocking main thread
  var initReveal = function () {
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
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initReveal);
  } else {
    setTimeout(initReveal, 1);
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
      if (!heroVisible || document.hidden) {
        animId = requestAnimationFrame(draw);
        return;
      }
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

  // ─── 3D Golden Wireframe Icosahedron ─────────
  function initGeoShape() {
    var gc = document.getElementById('geoCanvas');
    if (!gc || isMobile()) return;

    var gCtx = gc.getContext('2d');
    var gw, gh;

    function gResize() {
      var rect = gc.parentElement.getBoundingClientRect();
      gw = gc.width = rect.width;
      gh = gc.height = rect.height;
    }
    gResize();
    var geoParentRect = gc.parentElement.getBoundingClientRect();

    // Icosahedron vertices using golden ratio
    var phi = (1 + Math.sqrt(5)) / 2;
    var len = Math.sqrt(1 + phi * phi);
    var rawVerts = [
      [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
      [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
      [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
    ];
    var verts = rawVerts.map(function (v) {
      return [v[0] / len, v[1] / len, v[2] / len];
    });

    // 30 edges of an icosahedron
    var edges = [
      [0,1],[0,4],[0,5],[0,8],[0,9],
      [1,6],[1,7],[1,8],[1,9],
      [2,3],[2,4],[2,5],[2,10],[2,11],
      [3,6],[3,7],[3,10],[3,11],
      [4,5],[4,8],[4,10],
      [5,9],[5,11],
      [6,7],[6,8],[6,10],
      [7,9],[7,11],
      [8,10],[9,11]
    ];

    var autoRotX = 0, autoRotY = 0;
    var mouseInfX = 0, mouseInfY = 0;

    gc.parentElement.addEventListener('mousemove', function (e) {
      mouseInfX = ((e.clientX - geoParentRect.left) / geoParentRect.width - 0.5) * 0.6;
      mouseInfY = ((e.clientY - geoParentRect.top) / geoParentRect.height - 0.5) * 0.6;
    });
    gc.parentElement.addEventListener('mouseleave', function () {
      mouseInfX = 0;
      mouseInfY = 0;
    });

    function rotateP(p, ax, ay) {
      var cosY = Math.cos(ay), sinY = Math.sin(ay);
      var x1 = p[0] * cosY - p[2] * sinY;
      var z1 = p[0] * sinY + p[2] * cosY;
      var cosX = Math.cos(ax), sinX = Math.sin(ax);
      var y2 = p[1] * cosX - z1 * sinX;
      var z2 = p[1] * sinX + z1 * cosX;
      return [x1, y2, z2];
    }

    function project(p) {
      var fov = 1.8;
      var z = p[2] + fov;
      var scale = Math.min(gw, gh) * 0.7;
      return { x: gw / 2 + (p[0] / z) * scale, y: gh / 2 + (p[1] / z) * scale, z: p[2] };
    }

    function drawGeo() {
      if (!heroVisible || document.hidden) {
        requestAnimationFrame(drawGeo);
        return;
      }
      gCtx.clearRect(0, 0, gw, gh);
      autoRotX += 0.003;
      autoRotY += 0.005;

      var ax = autoRotX + mouseInfY;
      var ay = autoRotY + mouseInfX;

      var isLight = root.getAttribute('data-theme') === 'light';
      var goldRGB = isLight ? '140,106,46' : '198,167,94';

      var projected = verts.map(function (v) { return rotateP(v, ax, ay); }).map(project);

      // Draw edges with depth-based alpha
      for (var i = 0; i < edges.length; i++) {
        var a = projected[edges[i][0]];
        var b = projected[edges[i][1]];
        var avgZ = (a.z + b.z) / 2;
        var alpha = 0.12 + (avgZ + 1) * 0.22;

        gCtx.beginPath();
        gCtx.moveTo(a.x, a.y);
        gCtx.lineTo(b.x, b.y);
        gCtx.strokeStyle = 'rgba(' + goldRGB + ',' + alpha + ')';
        gCtx.lineWidth = 1.2;
        gCtx.stroke();
      }

      // Tech labels for vertices
      var techLabels = ['React', 'Next.js', 'Angular', 'Node', 'MongoDB', 'TypeScript', 'JS', 'Tailwind', 'Git', 'HTML', 'CSS', 'Figma'];

      // Draw vertices with glow + tech labels
      for (var j = 0; j < projected.length; j++) {
        var p = projected[j];
        var vAlpha = 0.3 + (p.z + 1) * 0.35;
        var vr = 2.5 + (p.z + 1) * 1.2;

        // Glow
        gCtx.beginPath();
        gCtx.arc(p.x, p.y, vr * 3, 0, Math.PI * 2);
        gCtx.fillStyle = 'rgba(' + goldRGB + ',' + (vAlpha * 0.1) + ')';
        gCtx.fill();

        // Vertex dot
        gCtx.beginPath();
        gCtx.arc(p.x, p.y, vr, 0, Math.PI * 2);
        gCtx.fillStyle = 'rgba(' + goldRGB + ',' + vAlpha + ')';
        gCtx.fill();

        // Tech label
        if (vAlpha > 0.3) {
          gCtx.font = '600 11px Inter, system-ui, sans-serif';
          gCtx.textAlign = 'center';
          gCtx.textBaseline = 'middle';
          gCtx.fillStyle = 'rgba(' + goldRGB + ',' + (vAlpha * 0.85) + ')';
          gCtx.fillText(techLabels[j], p.x, p.y - vr - 10);
        }
      }

      requestAnimationFrame(drawGeo);
    }

    drawGeo();

    window.addEventListener('resize', function () {
      gResize();
      geoParentRect = gc.parentElement.getBoundingClientRect();
    });
  }

  // Defer heavy desktop-only features
  var initDesktopFeatures = function () {
    initParticles();
    initGeoShape();

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

          var rotY = ((x - cx) / cx) * 3;
          var rotX = ((cy - y) / cy) * 2;

          card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-6px)';
        });

        card.addEventListener('mouseleave', function () {
          card.style.transform = '';
        });
      });
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initDesktopFeatures);
  } else {
    setTimeout(initDesktopFeatures, 1);
  }

  // ─── Magnetic Hero Text (Desktop only) ────────
  var magName = document.getElementById('magneticName');
  var magLetters = magName ? magName.querySelectorAll('.mag-letter') : [];

  if (magLetters.length && window.matchMedia('(pointer: fine)').matches) {
    var heroEl = document.querySelector('.hero');

    heroEl.addEventListener('mousemove', function (e) {
      // Batch-read all rects first to avoid forced reflow interleaving
      var rects = [];
      for (var i = 0; i < magLetters.length; i++) {
        rects.push(magLetters[i].getBoundingClientRect());
      }
      // Batch-write all transforms
      for (var i = 0; i < magLetters.length; i++) {
        var lx = rects[i].left + rects[i].width / 2;
        var ly = rects[i].top + rects[i].height / 2;
        var dx = e.clientX - lx;
        var dy = e.clientY - ly;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          var force = (1 - dist / 120) * 30;
          var angle = Math.atan2(dy, dx);
          magLetters[i].style.transform = 'translate(' + (-Math.cos(angle) * force) + 'px, ' + (-Math.sin(angle) * force) + 'px)';
        } else {
          magLetters[i].style.transform = '';
        }
      }
    });

    heroEl.addEventListener('mouseleave', function () {
      for (var i = 0; i < magLetters.length; i++) {
        magLetters[i].style.transform = '';
      }
    });
  }

  // ─── Golden Sparkle Cursor Trail (Desktop only) ──
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var sparkleCanvas = document.createElement('canvas');
    sparkleCanvas.id = 'sparkleCanvas';
    document.body.appendChild(sparkleCanvas);

    var sCtx = sparkleCanvas.getContext('2d');
    var sparkles = [];
    var lastSparkleTime = 0;

    function resizeSparkle() {
      sparkleCanvas.width = window.innerWidth;
      sparkleCanvas.height = window.innerHeight;
    }
    resizeSparkle();
    window.addEventListener('resize', resizeSparkle);

    document.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - lastSparkleTime < 50) return;
      lastSparkleTime = now;

      var isLight = root.getAttribute('data-theme') === 'light';

      for (var i = 0; i < 3; i++) {
        sparkles.push({
          x: e.clientX + (Math.random() * 16 - 8),
          y: e.clientY + (Math.random() * 16 - 8),
          r: Math.random() * 2.5 + 0.8,
          alpha: Math.random() * 0.5 + 0.5,
          dy: Math.random() * 0.8 + 0.3,
          dx: (Math.random() - 0.5) * 0.6,
          decay: Math.random() * 0.015 + 0.015,
          gold: isLight ? [140, 106, 46] : [198, 167, 94]
        });
      }
    });

    var sparkleRunning = false;

    function drawSparkles() {
      sCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

      for (var i = sparkles.length - 1; i >= 0; i--) {
        var s = sparkles[i];
        s.x += s.dx;
        s.y += s.dy;
        s.alpha -= s.decay;
        s.r *= 0.985;

        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sCtx.fillStyle = 'rgba(' + s.gold[0] + ',' + s.gold[1] + ',' + s.gold[2] + ',' + s.alpha + ')';
        sCtx.fill();
      }

      if (sparkles.length > 0) {
        requestAnimationFrame(drawSparkles);
      } else {
        sparkleRunning = false;
      }
    }

    // Start sparkle loop only when there are sparkles
    document.addEventListener('mousemove', function () {
      if (!sparkleRunning && sparkles.length > 0) {
        sparkleRunning = true;
        drawSparkles();
      }
    });
  }

})();
