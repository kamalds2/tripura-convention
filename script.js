/* =========================================================
   TRIPURA CONVENTION — MASTER SCRIPT
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Shatter-to-Assemble Logo (Preloader) ---------- */
  function buildLogoReveal(container, src, grid = 7) {
    if (!container) return 0;
    container.innerHTML = '';

    // Use real pixel geometry (not percentages) so rounding never leaves
    // hairline / "+" shaped seams between adjacent tiles.
    const rect = container.getBoundingClientRect();
    const W = Math.round(rect.width);
    const H = Math.round(rect.height);
    const pieceW = W / grid;
    const pieceH = H / grid;
    const overlap = 1.5; // px of overlap on shared edges to guarantee no gap

    const pieces = [];

    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        const piece = document.createElement('div');
        piece.className = 'logo-piece';

        const baseLeft = col * pieceW;
        const baseTop = row * pieceH;
        const left = baseLeft - (col > 0 ? overlap : 0);
        const top = baseTop - (row > 0 ? overlap : 0);
        const width = pieceW + (col > 0 ? overlap : 0) + (col < grid - 1 ? overlap : 0);
        const height = pieceH + (row > 0 ? overlap : 0) + (row < grid - 1 ? overlap : 0);

        piece.style.left = left + 'px';
        piece.style.top = top + 'px';
        piece.style.width = width + 'px';
        piece.style.height = height + 'px';
        // background is sized to the FULL container in px, and every piece
        // shares the same absolute coordinate space, so overlap never distorts the image.
        piece.style.backgroundImage = `url("${encodeURI(src)}")`;
        piece.style.backgroundSize = `${W}px ${H}px`;
        piece.style.backgroundPosition = `-${left}px -${top}px`;

        // scattered random starting position (the "broken pieces")
        const randX = (Math.random() * 2 - 1) * 280;
        const randY = (Math.random() * 2 - 1) * 280;
        const randZ = (Math.random() * 2 - 1) * 320;
        const randRotX = (Math.random() * 2 - 1) * 200;
        const randRotY = (Math.random() * 2 - 1) * 200;
        const randRotZ = (Math.random() * 2 - 1) * 200;

        piece.style.transform = `translate3d(${randX}px, ${randY}px, ${randZ}px) rotateX(${randRotX}deg) rotateY(${randRotY}deg) rotateZ(${randRotZ}deg) scale(0.3)`;

        container.appendChild(piece);
        pieces.push({ el: piece, row, col });
      }
    }

    // stagger the assembly outward-in so it "converges" toward the center
    const center = (grid - 1) / 2;
    let maxDelay = 0;
    pieces.forEach(({ el, row, col }) => {
      const dist = Math.hypot(row - center, col - center);
      const delay = dist * 90 + Math.random() * 150;
      maxDelay = Math.max(maxDelay, delay);
      setTimeout(() => el.classList.add('in'), 250 + delay);
    });

    return 250 + maxDelay + 1100; // total ms until fully assembled
  }

  /* ---------- Preloader Initialization ---------- */
  const preloader = document.getElementById('preloader');
  const logoRevealEl = document.getElementById('logoReveal');
  let assembleTime = 1800;

  if (logoRevealEl) {
    assembleTime = buildLogoReveal(logoRevealEl, 'assets/images/tripura-logo.png', 7);
  }

  // Hide preloader once fully loaded AND assembly is finished
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (preloader) preloader.classList.add('hide');
    }, assembleTime + 400);
  });

  // Fallback failsafe in case 'load' event fires too quickly or fails
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('hide')) {
      preloader.classList.add('hide');
    }
  }, Math.max(assembleTime + 1200, 5000));


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

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navClose = document.getElementById('navClose');

  function openMobileMenu() {
    navLinks.classList.add('open');
    hamburger.classList.add('active');
    document.body.classList.add('mobile-menu-open');
  }
  function closeMobileMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
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

  /* ---------- Hero vertical slider ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  const dotsWrap = document.getElementById('heroDots');
  let currentSlide = 0;
  let slideTimer;

  if (slides.length && dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      dotsWrap.children[currentSlide].classList.remove('active');
      currentSlide = index;
      slides[currentSlide].classList.add('active');
      dotsWrap.children[currentSlide].classList.add('active');
      resetTimer();
    }

    function nextSlide() {
      const next = (currentSlide + 1) % slides.length;
      goToSlide(next);
    }

    function resetTimer() {
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 4000);
    }
    resetTimer();
  }

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
    const duration = 1600;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + (target >= 100 && progress < 1 ? '' : (progress === 1 ? (el.parentElement.querySelector('.stat-label').textContent.includes('%') ? '%+' : '+') : ''));
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + (target === 99 ? '%' : '+');
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Plan Your Event data ---------- */
  const eventTypes = [
    { name: 'Weddings', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600', quote: 'Sacred unions composed in resplendent grandeur — every ritual elevated to royal ceremony.' },
    { name: 'Reception', img: 'assets/images/Reception.jpeg', quote: 'An evening of elegance, laughter and gold-lit toasts to new beginnings.' },
    { name: 'Birthday', img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1600', quote: 'Playful, personal and beautifully staged — birthdays made unforgettable.' },
    { name: 'Corporate Event', img: 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?q=80&w=1600', quote: 'Where business meets brilliance, in a setting built for impact.' },
    { name: 'Haldi', img: 'assets/images/haldi.webp', quote: 'Turmeric, tradition and golden joy — rituals wrapped in warmth.' },
    { name: 'Engagement', img: 'assets/images/Engagement.jpg', quote: 'The promise of forever, framed in candlelight and quiet elegance.' },
    { name: 'Baby Shower', img: 'assets/images/baby-shower.jpg', quote: 'A tender celebration of new life, styled with soft grace.' },
    { name: 'Cultural Events', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600', quote: 'Heritage and artistry, staged with pride and colour.' }
  ];

  const planEventList = document.getElementById('planEventList');
  const planShowcaseImg = document.getElementById('planShowcaseImg');
  const planShowcaseTitle = document.getElementById('planShowcaseTitle');
  const planShowcaseQuote = document.getElementById('planShowcaseQuote');
  const planShowcaseBookBtn = document.getElementById('planShowcaseBookBtn');
  const planShowcaseImageWrap = document.getElementById('planShowcaseImage');

  function setShowcase(evt) {
    if (!planShowcaseImg) return;
    planShowcaseImageWrap.classList.add('fading');
    setTimeout(() => {
      planShowcaseImg.src = evt.img;
      planShowcaseImg.alt = evt.name + ' celebration at Tripura Convention';
      planShowcaseTitle.textContent = evt.name;
      planShowcaseQuote.textContent = evt.quote;
      planShowcaseBookBtn.setAttribute('data-event', evt.name);
      planShowcaseImageWrap.classList.remove('fading');
    }, 220);
  }

  if (planEventList) {
    eventTypes.forEach((evt, i) => {
      const li = document.createElement('li');
      li.textContent = evt.name;
      li.setAttribute('data-event', evt.name);
      if (i === 0) li.classList.add('active');
      li.addEventListener('mouseenter', () => {
        planEventList.querySelectorAll('li').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        setShowcase(evt);
      });
      
      planEventList.appendChild(li);
    });
    // set initial showcase content
    setShowcase(eventTypes[0]);
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
    selectedEvent = eventName;
    modalEventName.textContent = eventName;
    selectedVenue = null;
    continueBtn.disabled = true;
    lawnOption.classList.remove('selected');
    hallOption.classList.remove('selected');
    lawnOption.querySelector('input').checked = false;
    hallOption.querySelector('input').checked = false;
    modal.classList.add('show');
  }

  function selectVenue(option, value) {
    lawnOption.classList.remove('selected');
    hallOption.classList.remove('selected');
    option.classList.add('selected');
    option.querySelector('input').checked = true;
    selectedVenue = value;
    continueBtn.disabled = false;
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
      { name: 'Aerial View', img: 'assets/images/slider-1.jpeg' },
      { name: 'Main Hall', img: 'assets/images/about-2.jpeg' },
      { name: 'Guest Lounge', img: 'assets/images/about-3.jpeg' },
      { name: 'Banquet Floor', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200' }
    ],
    office: [
      { name: 'Reception Desk', img: 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?q=80&w=1200' },
      { name: 'Meeting Room', img: 'https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=1200' },
      { name: 'Workspace', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200' },
      { name: 'Conference Hall', img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200' }
    ]
  };

  // the full gallery shows a larger set per category
  const galleryDataFull = {
    hall: [
      { name: 'Aerial View', img: 'assets/images/slider-1.jpeg' },
      { name: 'Main Hall', img: 'assets/images/about-2.jpeg' },
      { name: 'Guest Lounge', img: 'assets/images/about-3.jpeg' },
      { name: 'Banquet Floor', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200' },
      { name: 'Wedding Stage', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200' },
      { name: 'Reception Setup', img: 'https://images.unsplash.com/photo-1519671482749-fd09be6ccd85?q=80&w=1200' },
      { name: 'Haldi Corner', img: 'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?q=80&w=1200' },
      { name: 'Birthday Setup', img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1200' }
    ],
    office: [
      { name: 'Reception Desk', img: 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?q=80&w=1200' },
      { name: 'Meeting Room', img: 'https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=1200' },
      { name: 'Workspace', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200' },
      { name: 'Conference Hall', img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200' },
      { name: 'Lounge Area', img: 'assets/images/about-3.jpeg' },
      { name: 'Management Office', img: 'assets/images/about-2.jpeg' },
      { name: 'Front Desk', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200' },
      { name: 'Records Room', img: 'assets/images/slider-1.jpeg' }
    ]
  };

  function setupGalleryToggle(tabsContainerId, gridId, dataset) {
    const tabsContainer = document.getElementById(tabsContainerId);
    const grid = document.getElementById(gridId);
    if (!tabsContainer || !grid) return;
    const tabs = tabsContainer.querySelectorAll('.gallery-tab');

    function render(tab) {
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
  /* ---------- Testimonials (auto scroll, infinite loop) ---------- */
  const testimonialsData = [
    { name: 'Ravi & Sneha', city: 'Agartala', text: 'Tripura Convention made our wedding effortless. The hall looked breathtaking and the team handled everything with real care.' },
    { name: 'Priya Debbarma', city: 'Udaipur, Tripura', text: 'We hosted our company’s annual meet here. Professional staff, great sound setup, and the food was outstanding.' },
    { name: 'Ankit Roy', city: 'Agartala', text: 'The open lawn was perfect for our haldi ceremony. Bright, spacious, and beautifully decorated.' },
    { name: 'Moushumi Das', city: 'Dharmanagar', text: 'From booking to the final event day, communication was smooth. Highly recommend for any celebration.' },
    { name: 'Suman Chakraborty', city: 'Agartala', text: 'Our son’s birthday party felt like a five-star affair. The decoration team truly understood our vision.' },
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

  /* ---------- Auto-popup booking modal (opens ~2.5s after page load) ---------- */
  const popupBookingModal = document.getElementById('popupBookingModal');
  const popupBookingClose = document.getElementById('popupBookingClose');

  if (popupBookingModal) {
    const POPUP_SESSION_KEY = 'tc_popup_shown';
    const alreadyShown = sessionStorage.getItem(POPUP_SESSION_KEY);

    if (!alreadyShown) {
      setTimeout(() => {
        // don't interrupt someone already filling out a venue booking form
        if (document.body.classList.contains('venue-view')) return;
        popupBookingModal.classList.add('show');
        sessionStorage.setItem(POPUP_SESSION_KEY, '1');
      }, 2500);
    }

    const closePopupBooking = () => popupBookingModal.classList.remove('show');
    if (popupBookingClose) popupBookingClose.addEventListener('click', closePopupBooking);
    popupBookingModal.addEventListener('click', (e) => {
      if (e.target === popupBookingModal) closePopupBooking();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopupBooking();
    });
  }

  /* ---------- Booking forms (standalone pages + inline index sections + popup) ---------- */
  const bookingForms = document.querySelectorAll('#bookingForm, #lawnBookingForm, #hallBookingForm, #popupBookingForm');
  bookingForms.forEach(form => {
    // pre-fill event name from query string (used on standalone lawn.html / hall.html)
    const params = new URLSearchParams(window.location.search);
    const eventField = form.querySelector('[name="eventType"]');
    const eventFromUrl = params.get('event');
    if (eventField && eventFromUrl && !eventField.value) eventField.value = eventFromUrl;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const query = new URLSearchParams();
      for (const [key, value] of data.entries()) query.append(key, value);
      // only force a venue param from the element's data-venue attribute if the
      // form doesn't already collect its own "venue" field (the popup form does)
      if (form.hasAttribute('data-venue') && !data.has('venue')) {
        query.append('venue', form.getAttribute('data-venue') || '');
      }
      window.location.href = `payment.html?${query.toString()}`;
    });
  });

  /* ---------- FAQ Accordion (if present) ---------- */
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      item.classList.toggle('open');
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