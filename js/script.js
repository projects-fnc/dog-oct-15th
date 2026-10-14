/* ============================================================
   DEORE & FREOND   INTERACTIONS
   Requires: Lenis, GSAP, ScrollTrigger (loaded via CDN in index.html)
   ============================================================ */
(function () {
  'use strict';

  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = typeof window.ScrollTrigger !== 'undefined';
  const hasLenis = typeof window.Lenis !== 'undefined';
  const useGSAP = hasGSAP && hasST && !reduced;

  document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
       1. LENIS SMOOTH SCROLL
       ========================================================== */
    let lenis = null;
    if (hasLenis && !reduced) {
      lenis = new Lenis({
        duration: 1.05,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.6,
        wheelMultiplier: 1
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        const tgt = document.querySelector(id);
        if (!tgt) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(tgt, { offset: -70, duration: 1.25 });
        } else {
          tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    if (lenis && !useGSAP) {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    /* ==========================================================
       2. MOBILE MENU
       ========================================================== */
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navToggle && mobileMenu) {
      const setOpen = (open) => {
        navToggle.classList.toggle('open', open);
        mobileMenu.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
        if (lenis) { open ? lenis.stop() : lenis.start(); }
      };

      navToggle.addEventListener('click', () => {
        setOpen(!mobileMenu.classList.contains('open'));
      });

      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => setOpen(false));
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) setOpen(false);
      });

      const mq = window.matchMedia('(min-width: 901px)');
      const mqHandler = (e) => { if (e.matches) setOpen(false); };
      mq.addEventListener ? mq.addEventListener('change', mqHandler) : mq.addListener(mqHandler);
    }

    /* ==========================================================
       3. FOOTER CURTAIN REVEAL — sync spacer to footer height
       ========================================================== */
    const footer = document.querySelector('.footer');
    const spacer = document.getElementById('footerSpacer');
    const syncFooterSpacer = () => {
      if (!footer || !spacer) return;
      if (window.matchMedia('(max-width: 900px)').matches) {
        spacer.style.height = '0px';
        return;
      }
      spacer.style.height = footer.offsetHeight + 'px';
    };

    syncFooterSpacer();
    window.addEventListener('load', syncFooterSpacer);
    window.addEventListener('resize', syncFooterSpacer);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncFooterSpacer);
    }

    /* ==========================================================
       4. GSAP SETUP
       ========================================================== */
    if (useGSAP) {
      gsap.registerPlugin(ScrollTrigger);

      if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0, 0);
      }

      /* ----------------------------------------------
         HERO INTRO
         ---------------------------------------------- */
      window.playHero = function () {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.fromTo('.hero-eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 })
          .fromTo('.hero-title .w', { y: '110%' }, { y: '0%', duration: 1.2, stagger: 0.08 }, '-=0.5')
          .fromTo('.hero-desc', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.6')
          .fromTo('.hero-cta', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
          .fromTo('.hero-explore', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.55')
          .fromTo('.hero-img-main', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4 }, '-=1.2')
          .fromTo('.hero-img-side', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4 }, '-=1.2')
          .fromTo('.hero-badge', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'back.out(1.6)' }, '-=1.1')
          .fromTo('.hero-strip > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, '-=0.7');
      };

      requestAnimationFrame(() => {
        window.playHero();
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });

      /* ----------------------------------------------
         HERO PARALLAX
         ---------------------------------------------- */
      gsap.to('.hero-img-main img', {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to('.hero-img-side img', {
        yPercent: -12, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to('.hero-badge', {
        y: -120, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to('.hero-copy', {
        y: -60, opacity: 0.4, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });

      /* ----------------------------------------------
         GENERIC REVEALS
         ---------------------------------------------- */
      gsap.utils.toArray('[data-reveal]').forEach(el => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
          });
      });

      gsap.utils.toArray('[data-reveal-img]').forEach(el => {
        const img = el.querySelector('img');
        gsap.set(el, { clipPath: 'inset(0 0 100% 0)', opacity: 1 });
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.4, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' }
        });
        if (img) {
          gsap.fromTo(img,
            { scale: 1.25 },
            {
              scale: 1, duration: 1.8, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' }
            });
        }
      });

      /* ----------------------------------------------
         PHILOSOPHY QUOTE — word reveal
         ---------------------------------------------- */
      const quote = document.getElementById('philQuote');
      if (quote) {
        const html = quote.innerHTML;
        quote.innerHTML = html.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
        gsap.to('#philQuote .w', {
          y: 0, opacity: 1,
          duration: 0.9, ease: 'power3.out',
          stagger: 0.03,
          scrollTrigger: { trigger: '#philQuote', start: 'top 82%', toggleActions: 'play none none reverse' }
        });
      }

      /* ----------------------------------------------
         PRINCIPLES — Progress bar for horizontal rail (Mobile)
         ---------------------------------------------- */
      const prTrack = document.getElementById('principlesTrack');
      const prBar = document.getElementById('principlesBar');

      if (prTrack) {
        const updatePrinciplesProgress = () => {
          const max = prTrack.scrollWidth - prTrack.clientWidth;
          if (max <= 0) {
            if (prBar) prBar.style.width = '100%';
            return;
          }
          const p = Math.min(1, Math.max(0, prTrack.scrollLeft / max));
          if (prBar) prBar.style.width = (p * 100) + '%';
        };

        prTrack.addEventListener('scroll', updatePrinciplesProgress, { passive: true });
        window.addEventListener('resize', updatePrinciplesProgress);
        requestAnimationFrame(updatePrinciplesProgress);
      }

      /* ----------------------------------------------
         BREEDS — pinned horizontal (unchanged)
         ---------------------------------------------- */
      const bTrack = document.getElementById('breedsTrack');
      const bBar = document.getElementById('breedsBar');
      const bNow = document.getElementById('breedNow');

      if (bTrack && !isTouch) {
        const dist = () => Math.max(0, bTrack.scrollWidth - window.innerWidth + 80);
        gsap.to(bTrack, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.breeds',
            start: 'top top',
            end: () => '+=' + (dist() + 300),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: self => {
              if (bBar) bBar.style.width = (self.progress * 100) + '%';
              if (bNow) {
                const idx = Math.min(8, Math.max(1, Math.round(self.progress * 7) + 1));
                bNow.textContent = String(idx).padStart(2, '0');
              }
            }
          }
        });
      } else if (bTrack) {
  // Mobile layout is handled entirely by CSS media queries
}

      /* ----------------------------------------------
         JOURNEY — crystal-glass rail (native scroll, no GSAP)
         ---------------------------------------------- */

      /* ----------------------------------------------
         SERVICES — head opacity reveal
         ---------------------------------------------- */
      const svcHead = document.getElementById('servicesHead');
      if (svcHead) {
        gsap.fromTo(svcHead.children,
          { opacity: 0, y: 26 },
          {
            opacity: 1, y: 0,
            duration: 1.2,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: svcHead,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          });
      }

      /* ----------------------------------------------
         SERVICES — scroll-driven stage (STICKY, not pin)
         ---------------------------------------------- */
      const svcStage = document.getElementById('servicesStage');
      const svcItems = gsap.utils.toArray('.service-item');
      const svcImgs = gsap.utils.toArray('.svc-img');
      const svcBar = document.getElementById('servicesBar');
      const svcNow = document.getElementById('svcNow');

      if (svcStage && svcItems.length) {
        const total = svcItems.length;
        let current = -1;

        const setActive = (i, force) => {
          if (!force && i === current) return;
          current = i;
          svcItems.forEach((el, k) => el.classList.toggle('is-active', k === i));
          svcImgs.forEach((el, k) => el.classList.toggle('is-active', k === i));
          if (svcNow) svcNow.textContent = String(i + 1).padStart(2, '0');
        };

        setActive(0, true);
        if (svcBar) svcBar.style.width = (1 / total * 100) + '%';

        const desktopPin = !isTouch && window.matchMedia('(min-width: 901px)').matches;

        if (desktopPin) {
          svcStage.style.setProperty('--svc-scroll', (total * 420) + 'px');
          ScrollTrigger.create({
            trigger: svcStage,
            start: 'top top',
            end: 'bottom bottom',
            invalidateOnRefresh: true,
            onUpdate: self => {
              const p = self.progress;
              let i = Math.floor(p * total);
              if (i < 0) i = 0;
              if (i > total - 1) i = total - 1;
              setActive(i);
              if (svcBar) svcBar.style.width = ((i + 1) / total * 100) + '%';
            },
            onEnter: () => {
              setActive(0, true);
              if (svcBar) svcBar.style.width = (1 / total * 100) + '%';
            },
            onEnterBack: () => {
              setActive(total - 1, true);
              if (svcBar) svcBar.style.width = '100%';
            },
            onLeave: () => {
              setActive(total - 1, true);
              if (svcBar) svcBar.style.width = '100%';
            },
            onLeaveBack: () => {
              setActive(0, true);
              if (svcBar) svcBar.style.width = (1 / total * 100) + '%';
            },
            onRefresh: () => {
              setActive(0, true);
              if (svcBar) svcBar.style.width = (1 / total * 100) + '%';
            }
          });

          svcItems.forEach((el, i) => {
            el.addEventListener('click', () => {
              const stageTop = svcStage.getBoundingClientRect().top + window.scrollY;
              const runway = svcStage.offsetHeight - window.innerHeight;
              const targetY = stageTop + runway * ((i + 0.5) / total);
              if (lenis) lenis.scrollTo(targetY, { duration: 1.1 });
              else window.scrollTo({ top: targetY, behavior: 'smooth' });
            });
          });
        } else {
          svcItems.forEach(el => el.classList.add('is-active'));
          svcImgs.forEach(el => el.classList.add('is-active'));
        }
      }

      /* ----------------------------------------------
         FOOTER — subtle parallax reveal
         ---------------------------------------------- */
      const footerEl = document.querySelector('.footer');
      if (footerEl && !isTouch) {
        gsap.fromTo(footerEl,
          { y: 60 },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: '#footerSpacer',
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 1
            }
          }
        );
      }

      /* ----------------------------------------------
         REFRESH on font load / window load
         ---------------------------------------------- */
      ScrollTrigger.sort();
      window.addEventListener('load', () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });
      }

    } else {
      /* ----------------------------------------------
         FALLBACK — GSAP unavailable / reduced motion
         ---------------------------------------------- */
      document.documentElement.classList.add('no-gsap');
      document.querySelectorAll('[data-reveal], [data-reveal-img]').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
        el.style.clipPath = 'none';
      });
      document.querySelectorAll('.hero-title .w').forEach(el => {
        el.style.transform = 'none';
      });
      document.querySelectorAll(
        '.hero-eyebrow, .hero-desc, .hero-cta, .hero-explore, .hero-img-main, .hero-img-side, .hero-badge, .hero-strip > *'
      ).forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      document.querySelectorAll('.service-item').forEach(el => el.classList.add('is-active'));
      document.querySelectorAll('.svc-img').forEach(el => el.classList.add('is-active'));
      window.playHero = function () { };
    }

    /* ==========================================================
       5. NAV / SIDE DOTS / SCROLL PROGRESS
       ========================================================== */
    const topNav = document.getElementById('topNav');
    const sideDots = document.getElementById('sideDots');
    const scrollBar = document.getElementById('scrollBar');
    const barSpan = scrollBar ? scrollBar.querySelector('span') : null;

    // Dynamic active indicator
    const navLinksList = topNav ? topNav.querySelector('.nav-links') : null;
    let navIndicator = null;

    if (navLinksList) {
      navIndicator = document.createElement('div');
      navIndicator.classList.add('nav-active-indicator');
      navLinksList.appendChild(navIndicator);
    }

    function updateScrollUI() {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight) || 0;
      if (barSpan) barSpan.style.width = (scrolled * 100) + '%';
    }

    const sectionIds = ['hero', 'about', 'philosophy', 'principles', 'breeds', 'journey', 'services', 'enquiry'];
    const dotMap = {
      hero: 'hero',
      about: 'about',
      philosophy: 'philosophy',
      principles: 'philosophy',
      breeds: 'breeds',
      journey: 'journey',
      services: 'services',
      enquiry: 'enquiry'
    };

    function updateActive() {
      const mid = window.innerHeight * 0.35;
      let current = 'hero';

      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= mid) current = id;
      });

      const activeDotTarget = dotMap[current] || current;

      document.querySelectorAll('.side-dots a').forEach(a => {
        a.classList.toggle('active', a.dataset.target === activeDotTarget);
      });
      document.querySelectorAll('.top-nav a[data-link]').forEach(a => {
        a.classList.toggle('active', a.dataset.link === activeDotTarget);
      });

      // Move the active indicator (CSS handles the slow transition)
      if (navIndicator && navLinksList) {
        const activeLink = navLinksList.querySelector('a.active');
        if (activeLink) {
          navIndicator.style.width = `${activeLink.offsetWidth}px`;
          navIndicator.style.height = `${activeLink.offsetHeight}px`;
          navIndicator.style.transform = `translate(${activeLink.offsetLeft}px, ${activeLink.offsetTop}px)`;
          navIndicator.style.opacity = '1';
        } else {
          navIndicator.style.opacity = '0';
        }
      }

      const el = document.getElementById(current);
      let isDark = !!(el && el.dataset.theme === 'dark');
      const spacerEl = document.getElementById('footerSpacer');
      if (spacerEl) {
        const sr = spacerEl.getBoundingClientRect();
        if (sr.top < window.innerHeight * 0.9) isDark = true;
      }
      if (sideDots) sideDots.classList.toggle('on-dark', isDark);
      if (scrollBar) scrollBar.classList.toggle('on-dark', isDark);
    }

    window.addEventListener('scroll', updateScrollUI, { passive: true });
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);

    updateScrollUI();
    updateActive();

    /* ==========================================================
       6. CURSOR
       ========================================================== */
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (dot && ring && !isTouch && !reduced) {
      let mx = 0, my = 0, rx = 0, ry = 0;

      window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      });

      const animate = () => {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(animate);
      };
      animate();

      document.querySelectorAll('a, button, .service-item, .principle, .breed, .step').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
      });

      document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
      document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
    } else {
      if (dot) dot.style.display = 'none';
      if (ring) ring.style.display = 'none';
    }

    /* ==========================================================
       7. CONTACT FORM — WHATSAPP INTEGRATION
       ========================================================== */
    const form = document.getElementById('contactForm');
    const note = document.getElementById('formNote');

    if (form && note) {
      form.addEventListener('submit', e => {
        e.preventDefault();

        const req = ['fname', 'lname', 'email', 'msg'];
        const missing = req.filter(id => {
          const el = document.getElementById(id);
          return !el || !el.value.trim();
        });

        if (missing.length) {
          note.textContent = 'Please complete the required fields.';
          note.classList.add('show');
          const first = document.getElementById(missing[0]);
          if (first) first.focus();
          return;
        }

        const fname = document.getElementById('fname').value.trim();
        const lname = document.getElementById('lname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        const interestEl = document.getElementById('interest');
        const interest = interestEl.options[interestEl.selectedIndex]?.text || 'Not specified';

        const msg = document.getElementById('msg').value.trim();

        const messageLines = [
          "Hello Deore & Freond,",
          "",
          "I would like to enquire.",
          "",
          `*Name:* ${fname} ${lname}`,
          `*Email:* ${email}`,
          `*Phone:* ${phone || 'Not provided'}`,
          `*Interest:* ${interest}`,
          `*Message:* ${msg}`
        ];

        const encodedText = encodeURIComponent(messageLines.join('\n'));
        const whatsappNumber = '919074643641';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

        window.open(whatsappUrl, '_blank');

        note.textContent = 'Redirecting to WhatsApp...';
        note.classList.add('show');
        form.reset();

        setTimeout(() => {
          note.classList.remove('show');
        }, 6000);
      });
    }

    /* ==========================================================
       8. TOP NAV — subtle scroll shadow
       ========================================================== */
    const onScrollNav = () => {
      if (!topNav) return;
      topNav.style.boxShadow = window.scrollY > 60
        ? '0 12px 40px rgba(46,58,68,.16), inset 0 1px 0 rgba(255,255,255,.65)'
        : '0 8px 32px rgba(46,58,68,.10), inset 0 1px 0 rgba(255,255,255,.65)';
    };
    window.addEventListener('scroll', onScrollNav, { passive: true });

  });
})();