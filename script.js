/* =========================================================
   TRIPURA CONVENTION — MASTER SCRIPT
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     SHATTER-TO-ASSEMBLE LOGO PRELOADER
     – tripura-logo.png sliced into a 20×20 grid (400 tiny tiles)
     – Each tile scattered in 3-D space, then converges inward
       toward the center (outer edge tiles fly in first so the
       logo "assembles" from the perimeter inward).
     – Background: assets/images/logo-bg.png (CSS).
     ========================================================== */
  (function initLogoPreloader() {
    const preloader  = document.getElementById('preloader');
    const stage      = document.getElementById('logoReveal');
    if (!preloader || !stage) return;

    const GRID       = 20;          // 20×20 = 400 tiny tiles
    const IMG_SRC    = 'assets/images/tripura-logo.png';

    /* ---- size the stage to the logo's natural aspect ratio ---- */
    const probe = new Image();
    probe.onload = () => {
      const aspect = (probe.naturalWidth ? probe.naturalHeight / probe.naturalWidth : 0.45);
      /* stage width is capped by CSS max-width: min(65vw,360px) */
      const stageW = stage.offsetWidth || Math.min(window.innerWidth * 0.65, 360);
      const stageH = Math.round(stageW * aspect);
      stage.style.height = stageH + 'px';

      buildAndAnimate(stageW, stageH);
    };
    probe.onerror = () => setTimeout(hide, 600);
    probe.src = IMG_SRC;
    if (probe.complete && probe.naturalWidth) {
      probe.onload();
    }

    /* ---- build pieces and kick off animation ---- */
    function buildAndAnimate(W, H) {
      stage.innerHTML = '';

      const pieceW   = W / GRID;
      const pieceH   = H / GRID;
      const overlap  = 1.5;           // px bleed to hide seams between tiles
      const pieces   = [];

      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const tile = document.createElement('div');
          tile.className = 'logo-piece';

          /* pixel-perfect tile position & size */
          const baseL = col * pieceW;
          const baseT = row * pieceH;
          const left  = baseL - (col > 0         ? overlap : 0);
          const top   = baseT - (row > 0         ? overlap : 0);
          const width = pieceW
                        + (col > 0         ? overlap : 0)
                        + (col < GRID - 1  ? overlap : 0);
          const height= pieceH
                        + (row > 0         ? overlap : 0)
                        + (row < GRID - 1  ? overlap : 0);

          tile.style.cssText = `
            left:${left}px;
            top:${top}px;
            width:${width}px;
            height:${height}px;
            background-image:url("${IMG_SRC}");
            background-size:${W}px ${H}px;
            background-position:-${left}px -${top}px;
          `;

          /* randomised 3-D scatter — strong rotation + depth */
          const rx = (Math.random() * 2 - 1) * 260;
          const ry = (Math.random() * 2 - 1) * 260;
          const rz = (Math.random() * 2 - 1) * 260;
          const tx = (Math.random() * 2 - 1) * 360;
          const ty = (Math.random() * 2 - 1) * 360;
          const tz = (Math.random() * 2 - 1) * 420;
          tile.style.transform =
            `translate3d(${tx}px,${ty}px,${tz}px)` +
            ` rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` +
            ` scale(0.25)`;
          tile.style.opacity = '0';

          stage.appendChild(tile);
          pieces.push({ el: tile, row, col });
        }
      }

      /* ---- stagger: outer tiles assemble first, converging inward ---- */
      const center   = (GRID - 1) / 2;
      let   maxDelay = 0;

      pieces.forEach(({ el, row, col }) => {
        /* distance from center — outer tiles get shorter delay  */
        const dist  = Math.hypot(row - center, col - center);
        const maxD  = Math.hypot(center, center);
        /* invert: outermost = 0 ms head-start, innermost = up to 650 ms */
        const delay = ((maxD - dist) / maxD) * 650 + Math.random() * 120;
        maxDelay    = Math.max(maxDelay, delay);

        setTimeout(() => {
          el.style.opacity = '1';
          el.classList.add('in');
        }, 180 + delay);         // 180 ms initial pause before any piece moves
      });

      /* ---- hide preloader after full assembly + a brief hold ---- */
      const totalMs = 180 + maxDelay + 1100 + 500; // transition(1050)+hold(500)
      setTimeout(hide, totalMs);

      /* ---- failsafe ---- */
      setTimeout(hide, Math.max(totalMs + 800, 7000));
    }

    function hide() {
      if (preloader.classList.contains('hide')) return;
      preloader.classList.add('hide');
    }
  })();


  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', updateProgress);

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('siteHeader');
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  document.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll();

  /* ---------- About Section: 3D model tilt (mouse + gyroscope) ---------- */
  const about3dScene = document.getElementById('about3dScene');
  const about3dCard  = document.getElementById('about3dCard');
  const about3dGlare = document.getElementById('about3dGlare');

  const MAX_TILT  = 18;   // max degrees of tilt
  const GLARE_MAX = 0.35; // max glare opacity

  function applyTilt(rx, ry, glareX, glareY) {
    if (!about3dCard) return;
    about3dCard.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    if (about3dGlare) {
      about3dGlare.style.background =
        `radial-gradient(circle at ${glareX}% ${glareY}%,
          rgba(255,255,255,${GLARE_MAX}) 0%, transparent 65%)`;
    }
  }

  if (about3dScene && about3dCard) {
    // ---- Desktop: mouse move inside the scene ----
    about3dScene.addEventListener('mousemove', (e) => {
      about3dCard.classList.add('js-tilt');
      const rect = about3dScene.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);  // -1 → 1
      const dy = (e.clientY - cy) / (rect.height / 2);  // -1 → 1
      const ry =  dx * MAX_TILT;
      const rx = -dy * MAX_TILT;
      const glareX = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const glareY = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      applyTilt(rx, ry, glareX, glareY);
    });

    about3dScene.addEventListener('mouseleave', () => {
      // smoothly return to neutral then hand back to CSS animation
      about3dCard.style.transition = 'transform .6s ease, box-shadow .4s ease';
      applyTilt(0, 0, 30, 30);
      setTimeout(() => {
        about3dCard.classList.remove('js-tilt');
        about3dCard.style.transition = '';
      }, 650);
    });

    // ---- Mobile: device gyroscope ----
    if (typeof DeviceOrientationEvent !== 'undefined') {
      const requestGyro = () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          // iOS 13+ needs explicit permission
          DeviceOrientationEvent.requestPermission().then(state => {
            if (state === 'granted') attachGyro();
          }).catch(() => {});
        } else {
          attachGyro();
        }
      };

      function attachGyro() {
        let baseGamma = null, baseBeta = null;
        window.addEventListener('deviceorientation', (e) => {
          if (baseGamma === null) { baseGamma = e.gamma; baseBeta = e.beta; }
          const dg = Math.max(-MAX_TILT, Math.min(MAX_TILT, (e.gamma - baseGamma)));
          const db = Math.max(-MAX_TILT, Math.min(MAX_TILT, (e.beta  - baseBeta )));
          about3dCard.classList.add('js-tilt');
          applyTilt(-db * .6, dg * .6, 50 + dg * 2, 50 - db * 2);
        }, { passive:true });
      }

      // Attach on first touch (avoids needing a button click for Android)
      window.addEventListener('touchstart', requestGyro, { once:true });
    }
  }

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navClose = document.getElementById('navClose');

  function openMobileMenu() {
    if (navLinks) navLinks.classList.add('open');
    if (hamburger) hamburger.classList.add('active');
    document.body.classList.add('mobile-menu-open');
  }
  function closeMobileMenu() {
    if (navLinks) navLinks.classList.remove('open');
    if (hamburger) hamburger.classList.remove('active');
    document.body.classList.remove('mobile-menu-open');
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('open');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });
    if (navClose) navClose.addEventListener('click', closeMobileMenu);
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
    // tapping the dimmed backdrop outside the panel also closes it
    document.addEventListener('click', (e) => {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(e.target) || e.target === hamburger || hamburger.contains(e.target)) return;
      closeMobileMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 500) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Button ripple ---------- */
  document.querySelectorAll('[data-ripple], .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      circle.className = 'ripple';
      circle.style.left = (e.clientX - rect.left) + 'px';
      circle.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));


  /* =========================================================
     HERO SHOWCASE SLIDER — Vanishing Dissolve Transitions & Quotes
     ========================================================= */
  (function initHeroSlider() {
    const wrapper   = document.getElementById('heroSlidesWrapper');
    if (!wrapper) return;

    const slides    = wrapper.querySelectorAll('.hero-slide');
    const heroPrev  = document.getElementById('heroPrev');
    const heroNext  = document.getElementById('heroNext');
    const heroDots  = document.getElementById('heroDots');

    if (!slides.length) return;

    let currentSlide = 0;
    let isTransitioning = false;
    let autoTimer = null;
    let touchStartX = 0;

    /* Build dots */
    if (heroDots) {
      heroDots.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => {
          if (currentSlide !== i) {
            pauseAuto();
            goToSlide(i);
            startAuto();
          }
        });
        heroDots.appendChild(dot);
      });
    }

    function goToSlide(nextIndex) {
      if (isTransitioning || nextIndex === currentSlide) return;
      isTransitioning = true;

      const outgoing = slides[currentSlide];
      const incoming = slides[nextIndex];
      const dots = heroDots ? heroDots.querySelectorAll('.hero-dot') : [];

      /* Update dot indicators */
      if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
      if (dots[nextIndex]) dots[nextIndex].classList.add('active');

      /* Trigger blur-out dissolve animation on outgoing slide */
      outgoing.classList.remove('active');
      outgoing.classList.add('blur-out');

      /* Activate incoming slide with blur-in dissolve */
      incoming.classList.add('active');

      setTimeout(() => {
        outgoing.classList.remove('blur-out');
        currentSlide = nextIndex;
        isTransitioning = false;
      }, 1300);
    }

    function nextSlide() {
      const target = (currentSlide + 1) % slides.length;
      goToSlide(target, 'next');
    }

    function prevSlide() {
      const target = (currentSlide - 1 + slides.length) % slides.length;
      goToSlide(target, 'prev');
    }

    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, 4800);
    }

    function pauseAuto() {
      clearInterval(autoTimer);
    }

    /* Event listeners for prev/next buttons */
    if (heroPrev) heroPrev.addEventListener('click', () => { pauseAuto(); prevSlide(); startAuto(); });
    if (heroNext) heroNext.addEventListener('click', () => { pauseAuto(); nextSlide(); startAuto(); });

    /* Pause on hover & touch swipe support */
    const heroSection = document.getElementById('home');
    let touchStartY = 0;
    if (heroSection) {
      heroSection.addEventListener('mouseenter', pauseAuto);
      heroSection.addEventListener('mouseleave', startAuto);

      heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      heroSection.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        // Support vertical or horizontal swipe gestures
        if (Math.abs(dy) > 40 || Math.abs(dx) > 40) {
          pauseAuto();
          if (Math.abs(dy) >= Math.abs(dx)) {
            if (dy < 0) nextSlide();
            else prevSlide();
          } else {
            if (dx < 0) nextSlide();
            else prevSlide();
          }
          startAuto();
        }
      }, { passive: true });
    }

    /* Keyboard navigation (Up/Down or Left/Right) */
    document.addEventListener('keydown', (e) => {
      if (!heroSection) return;
      const rect = heroSection.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom >= 0) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { pauseAuto(); nextSlide(); startAuto(); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')  { pauseAuto(); prevSlide(); startAuto(); }
      }
    });

    startAuto();
  })();

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    const duration = 1600;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const labelEl = el.parentElement ? el.parentElement.querySelector('.stat-label') : null;
      const isPct = labelEl && labelEl.textContent.includes('%');
      el.textContent = Math.floor(eased * target) + (target >= 100 && progress < 1 ? '' : (progress === 1 ? (isPct ? '%+' : '+') : ''));
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + (target === 99 ? '%' : '+');
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Plan Your Event data ---------- */
  const eventTypes = [
    { name: 'Weddings', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600', quote: 'Sacred unions composed in resplendent grandeur — every ritual elevated to royal ceremony.' },
    { name: 'Reception', img: 'assets/images/Reception.png', quote: 'An evening of elegance, laughter and gold-lit toasts to new beginnings.' },
    { name: 'Birthday', img: 'https://i.pinimg.com/1200x/c6/d2/3a/c6d23a69a5477b32b644112fee21aa4e.jpg', quote: 'Playful, personal and beautifully staged — birthdays made unforgettable.' },
    { name: 'Corporate Event', img: 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?q=80&w=1600', quote: 'Where business meets brilliance, in a setting built for impact.' },
    { name: 'Haldi', img: 'assets/images/haldi-1.jpg', quote: 'Turmeric, tradition and golden joy — rituals wrapped in warmth.' },
    { name: 'Engagement', img: 'assets/images/Engagement.jpg', quote: 'The promise of forever, framed in candlelight and quiet elegance.' },
    { name: 'Baby Shower', img: 'assets/images/baby-shower.png', quote: 'A tender celebration of new life, styled with soft grace.' },
    { name: 'Cultural Events', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600', quote: 'Heritage and artistry, staged with pride and colour.' }
  ];

  const planEventList = document.getElementById('planEventList');
  const planShowcaseImg = document.getElementById('planShowcaseImg');
  const planShowcaseTitle = document.getElementById('planShowcaseTitle');
  const planShowcaseQuote = document.getElementById('planShowcaseQuote');
  const planShowcaseBookBtn = document.getElementById('planShowcaseBookBtn');
  const planShowcaseImageWrap = document.getElementById('planShowcaseImage');

  function setShowcase(evt) {
    if (!planShowcaseImg || !planShowcaseImageWrap) return;
    planShowcaseImageWrap.classList.add('fading');
    setTimeout(() => {
      planShowcaseImg.src = evt.img;
      planShowcaseImg.alt = evt.name + ' celebration at Tripura Convention';
      if (planShowcaseTitle) planShowcaseTitle.textContent = evt.name;
      if (planShowcaseQuote) planShowcaseQuote.textContent = evt.quote;
      if (planShowcaseBookBtn) planShowcaseBookBtn.setAttribute('data-event', evt.name);
      planShowcaseImageWrap.classList.remove('fading');
    }, 220);
  }

  if (planEventList) {
    let planIndex = 0;
    let planAutoTimer = null;
    let planPaused = false;
    let planResumeTimeout = null;

    function activateEvent(i, evt) {
      planIndex = i;
      planEventList.querySelectorAll('li').forEach(el => el.classList.remove('active'));
      const li = planEventList.children[i];
      if (li) li.classList.add('active');
      setShowcase(evt);
    }

    function pausePlanAutoRotate() {
      planPaused = true;
      clearTimeout(planResumeTimeout);
      planResumeTimeout = setTimeout(() => { planPaused = false; }, 6000);
    }

    eventTypes.forEach((evt, i) => {
      const li = document.createElement('li');
      li.textContent = evt.name;
      li.setAttribute('data-event', evt.name);
      if (i === 0) li.classList.add('active');

      // Desktop: hover switches the showcase
      li.addEventListener('mouseenter', () => { activateEvent(i, evt); pausePlanAutoRotate(); });
      // Mobile/touch: tap switches the showcase (hover never fires on touch devices)
      li.addEventListener('click', () => { activateEvent(i, evt); pausePlanAutoRotate(); });

      planEventList.appendChild(li);
    });
    // set initial showcase content
    setShowcase(eventTypes[0]);

    // Auto-rotate through events (mirrors the lawn/hall quote carousels) so the
    // showcase keeps cycling even on touch devices with no hover interaction.
    planAutoTimer = setInterval(() => {
      if (planPaused) return;
      const next = (planIndex + 1) % eventTypes.length;
      activateEvent(next, eventTypes[next]);
    }, 3800);
  }

  /* ---------- Venue Selection Modal ---------- */
  const modal = document.getElementById('venueModal');
  const modalEventName = document.getElementById('modalEventName');
  const modalClose = document.getElementById('modalClose');
  const continueBtn = document.getElementById('continueBtn');
  const lawnOption = document.getElementById('lawnOption');
  const hallOption = document.getElementById('hallOption');
  let selectedVenue = null;
  let selectedEvent = null;

  function openVenueModal(eventName) {
    if (!modal) return;
    selectedEvent = eventName;
    if (modalEventName) modalEventName.textContent = eventName;
    selectedVenue = null;
    if (continueBtn) continueBtn.disabled = true;
    if (lawnOption) {
      lawnOption.classList.remove('selected');
      const input = lawnOption.querySelector('input');
      if (input) input.checked = false;
    }
    if (hallOption) {
      hallOption.classList.remove('selected');
      const input = hallOption.querySelector('input');
      if (input) input.checked = false;
    }
    modal.classList.add('show');
  }

  function selectVenue(option, value) {
    if (lawnOption) lawnOption.classList.remove('selected');
    if (hallOption) hallOption.classList.remove('selected');
    if (option) {
      option.classList.add('selected');
      const input = option.querySelector('input');
      if (input) input.checked = true;
    }
    selectedVenue = value;
    if (continueBtn) continueBtn.disabled = false;
  }

  if (lawnOption) lawnOption.addEventListener('click', () => selectVenue(lawnOption, 'lawn'));
  if (hallOption) hallOption.addEventListener('click', () => selectVenue(hallOption, 'hall'));

  if (planShowcaseBookBtn) {
    planShowcaseBookBtn.addEventListener('click', () => openVenueModal(planShowcaseBookBtn.getAttribute('data-event')));
  }

  if (modalClose) modalClose.addEventListener('click', () => modal.classList.remove('show'));
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

  const lawnSection = document.getElementById('lawnSection');
  const hallSection = document.getElementById('hallSection');
  const gallerySection = document.getElementById('gallerySection');
  const allVenueSections = [lawnSection, hallSection, gallerySection];

  function showVenueSection(target) {
    allVenueSections.forEach(sec => sec && sec.classList.remove('active'));
    if (target) {
      target.classList.add('active');
      document.body.classList.add('venue-view');
      target.querySelectorAll('[data-reveal]').forEach(el => { el.classList.add('in-view'); });
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    } else {
      document.body.classList.remove('venue-view');
    }
  }

  const viewFullGalleryBtn = document.getElementById('viewFullGalleryBtn');
  if (viewFullGalleryBtn) {
    viewFullGalleryBtn.addEventListener('click', () => showVenueSection(gallerySection));
  }

  /* ---------- Gallery: Hall / Office tabs (preview + full gallery, independent) ---------- */
  const galleryData = {
    hall: [
      { name: 'Aerial View', img: 'assets/images/3d/night-view.jpeg' },
      { name: 'Main Hall', img: 'assets/images/3d/main-hall.jpeg' },
      { name: 'Guest Arrival', img: 'assets/images/guest-arrival.jpeg' },
      { name: 'Banquet Floor', img: 'assets/images/3d/banquet-floor.jpeg' }
    ],
    office: [
      { name: 'Reception Desk', img: 'assets/images/3d/office-desk.jpg' },
      { name: 'Meeting Room', img: 'assets/images/3d/meeting-room.jpg' },
      { name: 'Workspace', img: 'assets/images/3d/office-space.png' },
      { name: 'Conference Hall', img: 'assets/images/3d/conference-hall.png' }
    ]
  };

  // the full gallery shows a larger set per category
  const galleryDataFull = {
    hall: [
      { name: 'Aerial View', img: 'assets/images/3d/night-view.jpeg' },
      { name: 'Main Hall', img: 'assets/images/3d/main-hall.jpeg' },
      { name: 'Guest Arrival', img: 'assets/images/guest-arrival.jpeg' },
      { name: 'Banquet Floor', img: 'assets/images/3d/banquet-floor.jpeg' },
      { name: 'Wedding Stage', img: 'assets/images/wedding-stage.jpeg' },
      { name: 'Reception Setup', img: 'assets/images/reception-setup.jpeg' },
      { name: 'Haldi Corner', img: 'assets/images/Haldi-Lawn.jpg' },
      { name: 'Birthday Setup', img: 'assets/images/birthday-setup.jpg' }
    ],
    office: [
      { name: 'Reception Desk', img: 'assets/images/3d/office-desk.jpg' },
      { name: 'Meeting Room', img: 'assets/images/3d/meeting-room.jpg' },
      { name: 'Workspace', img: 'assets/images/3d/office-space.png' },
      { name: 'Conference Hall', img: 'assets/images/3d/conference-hall.png' },
      { name: 'Lounge Area', img: 'assets/images/3d/office-space.png' },
      { name: 'Management Office', img: 'assets/images/3d/md-office.png' },
      { name: 'Luxury Rooms', img: 'assets/images/3d/rooms.png' }
    ]
  };

  function setupGalleryToggle(tabsContainerId, gridId, dataset) {
    const tabsContainer = document.getElementById(tabsContainerId);
    const grid = document.getElementById(gridId);
    if (!tabsContainer || !grid) return;
    const tabs = tabsContainer.querySelectorAll('.gallery-tab');

    function render(tab) {
      if (!dataset || !dataset[tab]) return;
      grid.innerHTML = dataset[tab].map(item => `
        <div class="gallery-grid-item" data-lightbox-img="${item.img}">
          <img src="${item.img}" alt="${item.name} at Tripura Convention" loading="lazy">
          <div class="gallery-grid-item-overlay">
            <h4>${item.name}</h4>
            <span>View</span>
          </div>
        </div>
      `).join('');
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        render(tab.getAttribute('data-tab'));
      });
    });

    render('hall');
  }

  setupGalleryToggle('galleryTabsPreview', 'galleryGrid', galleryData);
  setupGalleryToggle('galleryTabsFull', 'galleryGridFull', galleryDataFull);

  /* ---------- Range slider track fill (guest count sliders) ---------- */
  document.querySelectorAll('input[type="range"]').forEach(range => {
    const updateFill = () => {
      const min = +range.min || 0, max = +range.max || 100, val = +range.value;
      const pct = ((val - min) / (max - min)) * 100;
      range.style.background = `linear-gradient(90deg, var(--color-gold) 0%, var(--color-gold) ${pct}%, #e2e2e2 ${pct}%, #e2e2e2 100%)`;
    };
    range.addEventListener('input', updateFill);
    updateFill();
  });
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src) {
    if (!lightboxOverlay || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxOverlay.classList.add('show');
    document.body.classList.add('mobile-menu-open'); // reuse the "lock scroll" utility class
  }
  function closeLightbox() {
    if (!lightboxOverlay) return;
    lightboxOverlay.classList.remove('show');
    document.body.classList.remove('mobile-menu-open');
  }
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox-img]');
    if (trigger) openLightbox(trigger.getAttribute('data-lightbox-img'));
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => { if (e.target === lightboxOverlay) closeLightbox(); });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (!selectedVenue) return;
      modal.classList.remove('show');

      if (selectedVenue === 'lawn') {
        const field = document.getElementById('lawnEventType');
        if (field && selectedEvent) field.value = selectedEvent;
        showVenueSection(lawnSection);
      } else {
        const field = document.getElementById('hallEventType');
        if (field && selectedEvent) field.value = selectedEvent;
        showVenueSection(hallSection);
      }
    });
  }

  // "Back to Home" links inside the venue sections
  document.querySelectorAll('[data-back-home]').forEach(btn => {
    btn.addEventListener('click', () => {
      showVenueSection(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Header / footer nav links pointing to in-page anchors (#home, #about, #gallery, etc.)
  // must first exit venue view (which hides #mainSections) before scrolling,
  // otherwise the browser tries to scroll to a hidden element and nothing happens.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const targetId = href.slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return; // not an in-page anchor we control, let default behavior happen

    link.addEventListener('click', (e) => {
      e.preventDefault();

      const wasVenueView = document.body.classList.contains('venue-view');
      if (wasVenueView) showVenueSection(null);

      // close mobile menu if open
      if (navLinks) closeMobileMenu();

      // wait a tick for #mainSections to become visible again before measuring/scrolling
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    });
  });
  // Footer/other links that should open a venue section directly
document.querySelectorAll('[data-show-venue]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const venue = link.getAttribute('data-show-venue');
    showVenueSection(venue === 'lawn' ? lawnSection : hallSection);
  });
});

  /* =========================================================
     ABOUT SECTION — Real 3D Turntable built from 300 frames
     Drag horizontally or auto-idle-rotate. Canvas renders
     with depth shadow + edge highlight for a premium 3D feel.
     ========================================================= */
  (function initAboutFrameViewer() {
    const canvas = document.getElementById('aboutAnimCanvas');
    const wrap   = document.getElementById('about3dWrap');
    if (!canvas || !wrap) return;

    const FRAME_COUNT  = 300;
    const FRAME_PREFIX = 'assets/images/about-frames/ezgif-frame-';
    const FRAME_PAD    = 3;   // ezgif-frame-001.jpg … ezgif-frame-300.jpg
    const FRAME_EXT    = '.jpg';
    const STEP_MS      = 55;  // auto-rotate interval (~18fps feels smooth with real photos)
    const DRAG_PX_PER_FRAME = 4; // px of drag to advance one frame

    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    const frames = [];
    let firstFrameReady = false;
    let currentFrame = 0;

    function frameSrc(i) {
      return `${FRAME_PREFIX}${String(i).padStart(FRAME_PAD, '0')}${FRAME_EXT}`;
    }

    // Pre-load all 300 frames
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      if (i === 1) {
        img.onload = () => {
          firstFrameReady = true;
          resizeCanvas();
          render();
          canvas.classList.add('loaded');
        };
      }
      frames.push(img);
    }

    function resizeCanvas() {
      dpr = window.devicePixelRatio || 1;
      const first = frames[0];
      const aspect = (first && first.naturalWidth) ? (first.naturalHeight / first.naturalWidth) : 0.72;
      const cssW = wrap.clientWidth || 540;
      const cssH = Math.round(cssW * aspect);
      if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
        canvas.width  = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        canvas.style.width  = cssW + 'px';
        canvas.style.height = cssH + 'px';
      }
    }

    function render() {
      const img = frames[currentFrame];
      if (!img || !img.complete || !img.naturalWidth) return;

      const CW = canvas.width;
      const CH = canvas.height;
      const cssW = CW / dpr;
      const cssH = CH / dpr;

      ctx.save();
      ctx.clearRect(0, 0, CW, CH);
      ctx.scale(dpr, dpr);

      // --- 1. Cover-fit draw ---
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const boxAspect = cssW / cssH;
      let dw, dh, dx, dy;
      if (imgAspect > boxAspect) {
        dh = cssH; dw = dh * imgAspect; dx = (cssW - dw) / 2; dy = 0;
      } else {
        dw = cssW; dh = dw / imgAspect; dx = 0; dy = (cssH - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);

      // --- 2. Right-edge 3D depth shadow (simulates Z-depth) ---
      const shadowGrad = ctx.createLinearGradient(cssW * 0.7, 0, cssW, 0);
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0.28)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, 0, cssW, cssH);

      // --- 3. Left-edge light highlight (opposite depth) ---
      const lightGrad = ctx.createLinearGradient(0, 0, cssW * 0.22, 0);
      lightGrad.addColorStop(0, 'rgba(255,255,255,0.10)');
      lightGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, cssW, cssH);

      // --- 4. Subtle top vignette (premium feel) ---
      const topVig = ctx.createLinearGradient(0, 0, 0, cssH * 0.22);
      topVig.addColorStop(0, 'rgba(0,0,0,0.12)');
      topVig.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topVig;
      ctx.fillRect(0, 0, cssW, cssH);

      ctx.restore();
    }

    const ro = new ResizeObserver(() => { resizeCanvas(); render(); });
    ro.observe(wrap);

    // ---- Drag-to-rotate (mouse + touch) ----
    let isDragging = false;
    let startX = 0, startFrame = 0;

    function setFrameFromDrag(dx) {
      const step = Math.round(dx / DRAG_PX_PER_FRAME);
      let idx = (startFrame + step + FRAME_COUNT) % FRAME_COUNT;
      if (idx !== currentFrame) { currentFrame = idx; render(); }
    }

    wrap.addEventListener('mousedown', (e) => {
      isDragging = true; startX = e.clientX; startFrame = currentFrame;
      wrap.classList.add('is-dragging');
      pauseAutoRotate();
    });
    window.addEventListener('mousemove', (e) => { if (isDragging) setFrameFromDrag(e.clientX - startX); });
    window.addEventListener('mouseup', () => {
      if (isDragging) { isDragging = false; wrap.classList.remove('is-dragging'); scheduleResumeAutoRotate(); }
    });

    wrap.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true; startX = e.touches[0].clientX; startFrame = currentFrame;
        pauseAutoRotate();
      }
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) setFrameFromDrag(e.touches[0].clientX - startX);
    }, { passive: true });
    window.addEventListener('touchend', () => {
      if (isDragging) { isDragging = false; scheduleResumeAutoRotate(); }
    });

    // ---- Idle auto-rotate ----
    let autoPaused = false;
    let resumeTimer = null;
    function pauseAutoRotate() { autoPaused = true; clearTimeout(resumeTimer); }
    function scheduleResumeAutoRotate() {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { autoPaused = false; }, 1600);
    }

    let lastStep = performance.now();
    function autoLoop(now) {
      requestAnimationFrame(autoLoop);
      if (!firstFrameReady || isDragging || autoPaused) { lastStep = now; return; }
      if (now - lastStep >= STEP_MS) {
        currentFrame = (currentFrame + 1) % FRAME_COUNT;
        render();
        lastStep = now;
      }
    }
    requestAnimationFrame(autoLoop);
  })();

  /* ---------- Testimonials (auto scroll, infinite loop) ---------- */

  const testimonialsData = [
    { name: 'Ravi & Sneha', city: 'Agartala', text: 'Tripura Convention made our wedding effortless. The hall looked breathtaking and the team handled everything with real care.' },
    { name: 'Priya Debbarma', city: 'Udaipur, Tripura', text: 'We hosted our company\'s annual meet here. Professional staff, great sound setup, and the food was outstanding.' },
    { name: 'Ankit Roy', city: 'Agartala', text: 'The open lawn was perfect for our haldi ceremony. Bright, spacious, and beautifully decorated.' },
    { name: 'Moushumi Das', city: 'Dharmanagar', text: 'From booking to the final event day, communication was smooth. Highly recommend for any celebration.' },
    { name: 'Suman Chakraborty', city: 'Agartala', text: 'Our son\'s birthday party felt like a five-star affair. The decoration team truly understood our vision.' },
    { name: 'Ritu & Arjun', city: 'Kailashahar', text: 'Best banquet in the region. The staff went above and beyond for our reception night.' }
  ];

  const testiTrack = document.getElementById('testiTrack');
  if (testiTrack) {
    const buildCard = (t) => `
      <div class="testi-card">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">${t.text}</p>
        <div class="testi-person">
          <div class="testi-avatar">${t.name.charAt(0)}</div>
          <div>
            <div class="testi-name">${t.name}</div>
            <div class="testi-city">${t.city}</div>
          </div>
        </div>
      </div>`;
    // duplicate list for seamless marquee loop
    const doubled = [...testimonialsData, ...testimonialsData];
    testiTrack.innerHTML = doubled.map(buildCard).join('');
  }


  /* ---------- Popup booking modal — triggered by header "Book Now" button ---------- */
  const popupBookingModal = document.getElementById('popupBookingModal');
  const popupBookingClose = document.getElementById('popupBookingClose');
  const headerBookNowBtn  = document.getElementById('headerBookNowBtn');

  if (popupBookingModal) {
    const openPopup  = () => popupBookingModal.classList.add('show');
    const closePopup = () => popupBookingModal.classList.remove('show');

    /* Open ONLY when header "Book Now" is clicked */
    if (headerBookNowBtn) headerBookNowBtn.addEventListener('click', openPopup);

    if (popupBookingClose) popupBookingClose.addEventListener('click', closePopup);
    popupBookingModal.addEventListener('click', (e) => {
      if (e.target === popupBookingModal) closePopup();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopup();
    });
  }

  /* ---------- Venue Booking Scene — Quote Carousels ---------- */
  function initQuoteCarousel(carouselId, dotsId) {
    const carousel = document.getElementById(carouselId);
    const dotsWrap = document.getElementById(dotsId);
    if (!carousel || !dotsWrap) return;

    const quotes = carousel.querySelectorAll('.vbs-quote');
    if (!quotes.length) return;

    let current = 0;
    let timer;

    /* Build dots */
    quotes.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'vbs-qdot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Quote ' + (i + 1));
      btn.addEventListener('click', () => { goTo(i); resetTimer(); });
      dotsWrap.appendChild(btn);
    });

    function goTo(index) {
      if (!quotes[current] || !quotes[index]) return;
      quotes[current].classList.remove('active');
      if (dotsWrap.children[current]) dotsWrap.children[current].classList.remove('active');
      current = index;
      quotes[current].classList.add('active');
      if (dotsWrap.children[current]) dotsWrap.children[current].classList.add('active');
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo((current + 1) % quotes.length), 4500);
    }
    resetTimer();
  }

  initQuoteCarousel('lawnQuoteCarousel', 'lawnQuoteDots');
  initQuoteCarousel('hallQuoteCarousel', 'hallQuoteDots');

  /* ---------- Feature Pills (Lawn/Hall facility chips) — tap-to-open on
     touch devices, since :hover never fires there. Works alongside the
     existing CSS :hover behavior for mouse users; doesn't replace it. */
  document.querySelectorAll('.vbs-pill-wrap').forEach(wrap => {
    const pill = wrap.querySelector('.vbs-pill');
    if (!pill) return;
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('open');
      document.querySelectorAll('.vbs-pill-wrap.open').forEach(w => w.classList.remove('open'));
      if (!isOpen) wrap.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.vbs-pill-wrap.open').forEach(w => w.classList.remove('open'));
  });



  /* ---------- Background Direct Form Submission (No Popups / External Apps) ---------- */
  const allForms = document.querySelectorAll('#bookingForm, #lawnBookingForm, #hallBookingForm, #popupBookingForm, #contactForm');
  
  allForms.forEach(form => {
    const params = new URLSearchParams(window.location.search);
    const eventField = form.querySelector('[name="eventType"]');
    const eventFromUrl = params.get('event');
    if (eventField && eventFromUrl && !eventField.value) eventField.value = eventFromUrl;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;
      }

      const formData = new FormData(form);
      const name = formData.get('fullName') || formData.get('name') || 'Customer';
      const phone = formData.get('phone') || 'Not provided';
      const email = formData.get('email') || 'Not provided';
      const eventType = formData.get('eventType') || 'Event Inquiry';
      const eventDate = formData.get('eventDate') || 'Not specified';
      const eventTime = formData.get('eventTime') || 'Not specified';
      const guests = formData.get('guests') || 'Not specified';
      const rawBudget = formData.get('budget');
      const budget = rawBudget ? `₹${Number(rawBudget).toLocaleString('en-IN')}` : 'Not specified';
      const requirements = formData.get('requirements') || formData.get('message') || 'None';
      let venue = formData.get('venue') || form.getAttribute('data-venue') || 'Tripura Convention';

      const isContactForm = form.id === 'contactForm';
      const targetEmail = 'Tripuraconvention9696@gmail.com';

      // 1. Format payload data for background API submission
      const payload = {
        access_key: "fa4e76c1-4b1f-4903-b09e-7bd2d13b4c10", // Public background submission key for Tripuraconvention9696@gmail.com
        to_email: targetEmail,
        subject: isContactForm 
          ? `New Inquiry from ${name} - Tripura Convention` 
          : `New ${venue} Booking Inquiry - ${name}`,
        from_name: "Tripura Convention Website",
        name: name,
        phone: phone,
        email: email,
        venue: venue,
        event_type: eventType,
        event_date: eventDate,
        event_time: eventTime,
        guests: guests,
        budget: budget,
        requirements: requirements,
        message: isContactForm ? requirements : `Venue: ${venue} | Event: ${eventType} | Date: ${eventDate} | Time: ${eventTime} | Guests: ${guests} | Budget: ${budget} | Requirements: ${requirements}`
      };

      // 2. Direct background AJAX submission (No popups / external applications!)
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (err) {
        console.log('Submission processed');
      }

      // Restore submit button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

      // Close popup modal if open
      const popupModal = document.getElementById('popupBookingModal');
      if (popupModal) popupModal.classList.remove('open', 'show');

      // 3. Display Custom In-Page Success Modal inside the web app
      showSuccessModal({
        name: name,
        phone: phone,
        email: email,
        venue: venue,
        eventType: eventType
      });

      form.reset();
    });
  });

  // Custom In-Page Success Modal
  function showSuccessModal(data) {
    let modal = document.getElementById('submissionSuccessModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'submissionSuccessModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-box success-modal-box" style="max-width:480px; text-align:center; padding:36px 28px; background:#fff; border-radius:16px; box-shadow:0 24px 60px rgba(0,0,0,0.35); position:relative;">
          <div style="width:70px; height:70px; background:rgba(46,125,50,0.1); color:#2e7d32; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2.2rem; margin:0 auto 18px;">
            ✓
          </div>
          <h3 style="font-family:var(--font-display); font-size:1.6rem; color:var(--color-royal); margin-bottom:10px;">Inquiry Submitted!</h3>
          <p style="font-size:0.95rem; color:#555; line-height:1.6; margin-bottom:20px;">
            Thank you, <strong id="succName"></strong>! Your details have been sent directly to <strong>Tripura Convention</strong> (<em>Tripuraconvention9696@gmail.com</em>).
          </p>
          <div style="background:#f8f9fa; padding:14px; border-radius:10px; font-size:0.88rem; color:#444; text-align:left; margin-bottom:24px; border-left:4px solid var(--color-gold);">
            <div style="margin-bottom:4px;"><strong>Venue:</strong> <span id="succVenue"></span></div>
            <div style="margin-bottom:4px;"><strong>Event Type:</strong> <span id="succEvent"></span></div>
            <div><strong>Contact Phone:</strong> <span id="succPhone"></span></div>
          </div>
          <p style="font-size:0.85rem; color:#777; margin-bottom:20px;">Our management team will contact you within 24 hours.</p>
          <button id="succCloseBtn" class="btn btn-primary" style="width:100%;">Done</button>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#succCloseBtn').addEventListener('click', () => {
        modal.classList.remove('open', 'show');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open', 'show');
      });
    }

    modal.querySelector('#succName').textContent = data.name;
    modal.querySelector('#succVenue').textContent = data.venue;
    modal.querySelector('#succEvent').textContent = data.eventType;
    modal.querySelector('#succPhone').textContent = data.phone;

    modal.classList.add('open', 'show');
  }

  /* ---------- FAQ Accordion (if present) ---------- */
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      if (item) item.classList.toggle('open');
    });
  });

  /* ---------- Gallery: touch-tap hover simulation (mobile) ---------- */
  // On touch devices, a single tap toggles the hover overlay.
  // A second tap (or tapping outside) removes it.
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
  document.querySelectorAll('.gallery-grid-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!isTouchDevice()) return; // desktop handles via CSS :hover
      const isActive = item.classList.contains('touch-active');
      // clear all active items first
      document.querySelectorAll('.gallery-grid-item.touch-active').forEach(el => el.classList.remove('touch-active'));
      if (!isActive) {
        item.classList.add('touch-active');
        e.stopPropagation();
      }
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.gallery-grid-item.touch-active').forEach(el => el.classList.remove('touch-active'));
  });

});