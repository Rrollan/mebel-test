document.addEventListener('DOMContentLoaded', () => {

    // Native browser scrolling is used for stability and accessibility.

    // --- Hamburger Menu Logic ---
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-nav .btn');

    function toggleMenu() {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);
        
        if (!isExpanded) {
            mobileNav.classList.add('is-open');
            document.body.classList.add('menu-open');
            // Hamburger animation
            gsap.to(hamburger.children[0], { y: 8, rotation: 45, duration: 0.3 });
            gsap.to(hamburger.children[1], { opacity: 0, duration: 0.3 });
            gsap.to(hamburger.children[2], { y: -8, rotation: -45, duration: 0.3 });
        } else {
            mobileNav.classList.remove('is-open');
            document.body.classList.remove('menu-open');
            // Hamburger animation back
            gsap.to(hamburger.children[0], { y: 0, rotation: 0, duration: 0.3 });
            gsap.to(hamburger.children[1], { opacity: 1, duration: 0.3 });
            gsap.to(hamburger.children[2], { y: 0, rotation: 0, duration: 0.3 });
        }
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('is-open')) toggleMenu();
        });
    });

    // --- GSAP MatchMedia (Responsive Animations) ---
    gsap.registerPlugin(ScrollTrigger);

    let mm = gsap.matchMedia();

    // Common Animations (All screens)
    const heroTl = gsap.timeline();
    heroTl.fromTo('.hero-title', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 })
          .fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, "-=0.6")
          .fromTo('.hero-actions', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, "-=0.6");

    // Reveal Up
    gsap.utils.toArray('.gs-reveal-up').forEach(function(elem) {
        gsap.fromTo(elem, 
            { y: 50, opacity: 0 }, 
            {
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: 'power3.out',
                scrollTrigger: { trigger: elem, start: "top 85%" }
            }
        );
    });

    // Stagger Cards
    ScrollTrigger.batch('.gs-stagger', {
        onEnter: batch => gsap.fromTo(batch, { y: 50, opacity: 0 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' }),
        start: "top 85%", once: true
    });

    // Scale in - removed from portfolio items to replace with deck of cards

    mm.add("(min-width: 769px)", () => {
        // --- Desktop Only ---
        // Abstract Spheres Parallax
        const spheres = document.querySelectorAll('.gs-parallax-sphere');
        if(spheres.length) {
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                
                gsap.to(spheres[0], { x: x * 2, y: y * 2, duration: 2, ease: "power2.out" });
                gsap.to(spheres[1], { x: x * -3, y: y * -3, duration: 2.5, ease: "power2.out" });
                gsap.to(spheres[2], { x: x * 1.5, y: y * -1.5, duration: 1.5, ease: "power2.out" });
            });

            gsap.to(spheres[0], { yPercent: 30, ease: "none", scrollTrigger: { trigger: ".about", scrub: true } });
            gsap.to(spheres[1], { yPercent: -50, ease: "none", scrollTrigger: { trigger: ".about", scrub: true } });
            gsap.to(spheres[2], { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".about", scrub: true } });
        }

    // Portfolio uses a stable responsive grid; no pinning or stacked-card transforms.

        // Parallax
        gsap.utils.toArray('.gs-parallax img').forEach(function(img) {
            gsap.to(img, {
                yPercent: -20, ease: "none",
                scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } 
            });
        });

        // Side Reveals
        gsap.fromTo('.gs-reveal-left', { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact-grid', start: "top 80%" } });
        gsap.fromTo('.gs-reveal-right', { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact-grid', start: "top 80%" } });

        // Native cursor and static service cards intentionally replace cursor/tilt effects.
    });

    mm.add("(max-width: 768px)", () => {
        // --- Mobile Only ---
        // Replace parallax with simple fade in up
        gsap.utils.toArray('.gs-parallax').forEach(function(elem) {
            gsap.fromTo(elem, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: elem, start: "top 85%" } });
        });

        // Simple fade in up for sides
        gsap.fromTo('.gs-reveal-left', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact-grid', start: "top 80%" } });
        gsap.fromTo('.gs-reveal-right', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact-grid', start: "top 80%" } });
        
    });

    // --- Sticky Header ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }, { passive: true });

    // --- Form Submission ---
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            setTimeout(() => {
                form.reset(); submitBtn.textContent = originalText; submitBtn.disabled = false;
                formMessage.textContent = 'Спасибо! Ваша заявка успешно отправлена.'; formMessage.classList.add('success');
                setTimeout(() => { formMessage.textContent = ''; formMessage.classList.remove('success'); }, 5000);
            }, 1500);
        });
    }

    // --- Smooth Scroll native ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
});
