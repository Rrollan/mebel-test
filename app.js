document.addEventListener('DOMContentLoaded', () => {

    // --- Hamburger Menu Logic ---
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-nav .btn');

    function toggleMenu() {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);
        
        if (!isExpanded) {
            mobileNav.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            // Hamburger animation
            gsap.to(hamburger.children[0], { y: 8, rotation: 45, duration: 0.3 });
            gsap.to(hamburger.children[1], { opacity: 0, duration: 0.3 });
            gsap.to(hamburger.children[2], { y: -8, rotation: -45, duration: 0.3 });
        } else {
            mobileNav.classList.remove('is-open');
            document.body.style.overflow = '';
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

    // Scale in
    ScrollTrigger.batch('.gs-scale', {
        onEnter: batch => gsap.fromTo(batch, { scale: 0.95, opacity: 0 }, { opacity: 1, scale: 1, stagger: 0.15, duration: 1, ease: 'power3.out' }),
        start: "top 85%", once: true
    });

    mm.add("(min-width: 769px)", () => {
        // --- Desktop Only ---
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

        // Initialize VanillaTilt
        VanillaTilt.init(document.querySelectorAll(".js-tilt"), {
            max: 10, speed: 400, glare: true, "max-glare": 0.2
        });

        // Mouse Cursor & Glow (if pointer fine)
        if (window.matchMedia("(pointer: fine)").matches) {
            const cursor = document.querySelector('.cursor');
            const follower = document.querySelector('.cursor-follower');
            let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX; mouseY = e.clientY;
                cursor.style.left = `${mouseX}px`; cursor.style.top = `${mouseY}px`;
            }, { passive: true });

            function renderCursor() {
                followerX += (mouseX - followerX) * 0.15; followerY += (mouseY - followerY) * 0.15;
                follower.style.left = `${followerX}px`; follower.style.top = `${followerY}px`;
                requestAnimationFrame(renderCursor);
            }
            renderCursor();

            document.querySelectorAll('a, button, .logo').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    const text = el.getAttribute('data-cursor-text');
                    if (text) { cursor.classList.add('text-mode'); cursor.setAttribute('data-text', text); follower.classList.add('hover'); } 
                    else { cursor.classList.add('hover'); follower.classList.add('hover'); }
                });
                el.addEventListener('mouseleave', () => {
                    cursor.classList.remove('hover', 'text-mode'); follower.classList.remove('hover'); cursor.removeAttribute('data-text');
                });
            });

            document.querySelectorAll('.portfolio-img-container').forEach(el => {
                el.addEventListener('mouseenter', () => { cursor.classList.add('text-mode'); cursor.setAttribute('data-text', el.getAttribute('data-cursor-text')); follower.classList.add('hover'); });
                el.addEventListener('mouseleave', () => { cursor.classList.remove('text-mode'); follower.classList.remove('hover'); cursor.removeAttribute('data-text'); });
            });

            // Card glow
            document.querySelectorAll('.service-card').forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const glow = card.querySelector('.card-glow');
                    if (glow) { glow.style.left = `${e.clientX - rect.left}px`; glow.style.top = `${e.clientY - rect.top}px`; }
                }, { passive: true });
            });
        }
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
        
        // Tilt is removed automatically because VanillaTilt is not initialized here.
        // Destroy existing tilt instances if resizing from desktop to mobile
        document.querySelectorAll(".js-tilt").forEach(el => {
            if (el.vanillaTilt) el.vanillaTilt.destroy();
        });
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
