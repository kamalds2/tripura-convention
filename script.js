/* =========================================================
   TRIPURA CONVENTION — MASTER SCRIPT
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader && preloader.classList.add('hide'), 400);
  });
  // fallback in case load already fired
  setTimeout(() => preloader && preloader.classList.add('hide'), 1800);

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scroll-progress');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if(progressBar) progressBar.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', updateProgress);

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('siteHeader');
  function handleHeaderScroll(){
    if(!header) return;
    if(window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  document.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll();

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if(hamburger){
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  if(backToTop){
    document.addEventListener('scroll', () => {
      if(window.scrollY > 500) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    });
    backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  /* ---------- Button ripple ---------- */
  document.querySelectorAll('[data-ripple], .btn').forEach(btn => {
    btn.addEventListener('click', function(e){
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
      if(entry.isIntersecting){
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

  if(slides.length && dotsWrap){
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i+1));
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function goToSlide(index){
      slides[currentSlide].classList.remove('active');
      dotsWrap.children[currentSlide].classList.remove('active');
      currentSlide = index;
      slides[currentSlide].classList.add('active');
      dotsWrap.children[currentSlide].classList.add('active');
      resetTimer();
    }

    function nextSlide(){
      const next = (currentSlide + 1) % slides.length;
      goToSlide(next);
    }

    function resetTimer(){
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 4000);
    }
    resetTimer();
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el){
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1600;
    const startTime = performance.now();
    function tick(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + (target >= 100 && progress < 1 ? '' : (progress === 1 ? (el.parentElement.querySelector('.stat-label').textContent.includes('%') ? '%+' : '+') : ''));
      if(progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + (target === 99 ? '%' : '+');
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Plan Your Event data + cards ---------- */
  const eventTypes = [
    { name:'Wedding', img:'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800' },
    { name:'Reception', img:'https://www.caratlane.com/blog/wp-content/uploads/2023/08/2281A.jpg' },
    { name:'Birthday', img:'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800' },
    { name:'Corporate Event', img:'https://images.unsplash.com/photo-1560523160-754a9e25c68f?q=80&w=800' },
    { name:'Haldi', img:'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?q=80&w=800' },
    { name:'Mehendi', img:'https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=800' },
    { name:'Engagement', img:'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800' },
    { name:'Baby Shower', img:'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800' },
    { name:'Anniversary', img:'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800' },
    { name:'Farewell', img:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800' },
    { name:'Cultural Event', img:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800' },
    { name:'Seminar', img:'https://images.unsplash.com/photo-1560523160-754a9e25c68f?q=80&w=800' },
    { name:'Workshop', img:'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800' },
    { name:'College Fest', img:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800' },
    { name:'Private Party', img:'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800' }
  ];

  const eventsGrid = document.getElementById('eventsGrid');
  if(eventsGrid){
    eventTypes.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.setAttribute('data-reveal', '');
      card.innerHTML = `
        <img src="${evt.img}" alt="${evt.name} celebration at Tripura Convention" loading="lazy">
        <div class="event-overlay">
          <h3>${evt.name}</h3>
          <button class="event-book-btn" data-event="${evt.name}">Book Now</button>
        </div>`;
      eventsGrid.appendChild(card);
    });
    // re-observe newly injected reveal elements
    eventsGrid.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
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

  if(eventsGrid){
    eventsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.event-book-btn');
      if(!btn) return;
      selectedEvent = btn.getAttribute('data-event');
      modalEventName.textContent = selectedEvent;
      selectedVenue = null;
      continueBtn.disabled = true;
      lawnOption.classList.remove('selected');
      hallOption.classList.remove('selected');
      lawnOption.querySelector('input').checked = false;
      hallOption.querySelector('input').checked = false;
      modal.classList.add('show');
    });
  }

  function selectVenue(option, value){
    lawnOption.classList.remove('selected');
    hallOption.classList.remove('selected');
    option.classList.add('selected');
    option.querySelector('input').checked = true;
    selectedVenue = value;
    continueBtn.disabled = false;
  }

  if(lawnOption) lawnOption.addEventListener('click', () => selectVenue(lawnOption, 'lawn'));
  if(hallOption) hallOption.addEventListener('click', () => selectVenue(hallOption, 'hall'));

  if(modalClose) modalClose.addEventListener('click', () => modal.classList.remove('show'));
  if(modal) modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('show'); });

  const lawnSection = document.getElementById('lawnSection');
  const hallSection = document.getElementById('hallSection');

  function showVenueSection(target){
    [lawnSection, hallSection].forEach(sec => sec && sec.classList.remove('active'));
    if(target){
      target.classList.add('active');
      document.body.classList.add('venue-view');
      target.querySelectorAll('[data-reveal]').forEach(el => { el.classList.add('in-view'); });
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    } else {
      document.body.classList.remove('venue-view');
    }
  }

  if(continueBtn){
    continueBtn.addEventListener('click', () => {
      if(!selectedVenue) return;
      modal.classList.remove('show');

      if(selectedVenue === 'lawn'){
        const field = document.getElementById('lawnEventType');
        if(field && selectedEvent) field.value = selectedEvent;
        showVenueSection(lawnSection);
      } else {
        const field = document.getElementById('hallEventType');
        if(field && selectedEvent) field.value = selectedEvent;
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

  // Header / footer nav links pointing to in-page anchors (#about, #gallery, etc.)
  // should first exit venue view (which hides #mainSections) before scrolling.
  document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const hashIndex = href.indexOf('#');
      if(hashIndex === -1) return;
      const targetId = href.slice(hashIndex + 1);
      if(!targetId) return;
      const targetEl = document.getElementById(targetId);
      if(!targetEl) return; // let the browser handle it normally (e.g. links to other pages)

      e.preventDefault();
      const wasVenueView = document.body.classList.contains('venue-view');
      if(wasVenueView) showVenueSection(null);

      // wait a tick for #mainSections to become visible again before measuring/scrolling
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    });
  });

  /* ---------- Testimonials (auto scroll, infinite loop) ---------- */
  const testimonialsData = [
    { name:'Ravi & Sneha', city:'Agartala', text:'Tripura Convention made our wedding effortless. The hall looked breathtaking and the team handled everything with real care.' },
    { name:'Priya Debbarma', city:'Udaipur, Tripura', text:'We hosted our company\u2019s annual meet here. Professional staff, great sound setup, and the food was outstanding.' },
    { name:'Ankit Roy', city:'Agartala', text:'The open lawn was perfect for our haldi ceremony. Bright, spacious, and beautifully decorated.' },
    { name:'Moushumi Das', city:'Dharmanagar', text:'From booking to the final event day, communication was smooth. Highly recommend for any celebration.' },
    { name:'Suman Chakraborty', city:'Agartala', text:'Our son\u2019s birthday party felt like a five-star affair. The decoration team truly understood our vision.' },
    { name:'Ritu & Arjun', city:'Kailashahar', text:'Best banquet in the region. The staff went above and beyond for our reception night.' }
  ];

  const testiTrack = document.getElementById('testiTrack');
  if(testiTrack){
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

  /* ---------- Booking forms (standalone pages + inline index sections) ---------- */
  const bookingForms = document.querySelectorAll('#bookingForm, #lawnBookingForm, #hallBookingForm');
  bookingForms.forEach(form => {
    // pre-fill event name from query string (used on standalone lawn.html / hall.html)
    const params = new URLSearchParams(window.location.search);
    const eventField = form.querySelector('[name="eventType"]');
    const eventFromUrl = params.get('event');
    if(eventField && eventFromUrl && !eventField.value) eventField.value = eventFromUrl;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const query = new URLSearchParams();
      for(const [key, value] of data.entries()) query.append(key, value);
      query.append('venue', form.getAttribute('data-venue') || '');
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

});