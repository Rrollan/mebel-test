document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Cursor Logic ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    // Only enable if pointer is fine (not a touch screen)
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });

        // Smooth follower animation using GSAP ticker if available, or requestAnimationFrame
        function renderCursor() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            follower.style.left = `${followerX}px`;
            follower.style.top = `${followerY}px`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        // Hover effects
        document.querySelectorAll('a, button, .logo').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const text = el.getAttribute('data-cursor-text');
                if (text) {
                    cursor.classList.add('text-mode');
                    cursor.setAttribute('data-text', text);
                    follower.classList.add('hover');
                } else {
                    cursor.classList.add('hover');
                    follower.classList.add('hover');
                }
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover', 'text-mode');
                follower.classList.remove('hover');
                cursor.removeAttribute('data-text');
            });
        });
        
        // Portfolio items special hover
        document.querySelectorAll('.portfolio-img-container').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('text-mode');
                cursor.setAttribute('data-text', el.getAttribute('data-cursor-text'));
                follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('text-mode');
                follower.classList.remove('hover');
                cursor.removeAttribute('data-text');
            });
        });
    }

    // --- Dynamic Glow on Cards ---
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.left = `${x}px`;
                glow.style.top = `${y}px`;
            }
        });
    });

    // --- Sticky Header ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- GSAP Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Hero Reveals
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
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                }
            }
        );
    });

    // Parallax Images
    gsap.utils.toArray('.gs-parallax img').forEach(function(img) {
        gsap.to(img, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            } 
        });
    });

    // Stagger Cards
    ScrollTrigger.batch('.gs-stagger', {
        onEnter: batch => gsap.fromTo(batch, { y: 50, opacity: 0 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' }),
        start: "top 85%",
        once: true
    });

    // Scale in
    ScrollTrigger.batch('.gs-scale', {
        onEnter: batch => gsap.fromTo(batch, { scale: 0.95, opacity: 0 }, { opacity: 1, scale: 1, stagger: 0.15, duration: 1, ease: 'power3.out' }),
        start: "top 85%",
        once: true
    });

    // Side Reveals
    gsap.fromTo('.gs-reveal-left', 
        { x: -50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact-grid', start: "top 80%" } }
    );
    gsap.fromTo('.gs-reveal-right', 
        { x: 50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact-grid', start: "top 80%" } }
    );

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
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                formMessage.textContent = 'Спасибо! Ваша заявка успешно отправлена.';
                formMessage.classList.add('success');
                
                setTimeout(() => {
                    formMessage.textContent = '';
                    formMessage.classList.remove('success');
                }, 5000);
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
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
