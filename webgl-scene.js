// Three.js Interactive Particles Background with Mobile Optimizations
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Detect mobile
    const isMobile = window.innerWidth <= 768;

    // Scene Setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !isMobile // disable antialiasing on mobile for perf
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Limit pixel ratio to 1.5 to save GPU on high-res mobile screens
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Particle System creation
    const particlesGeometry = new THREE.BufferGeometry();
    // LoD: 500 on mobile, 2000 on desktop
    const particlesCount = isMobile ? 500 : 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color(0xe8c872); // Premium Gold
    const color2 = new THREE.Color(0xffffff); // White

    for(let i = 0; i < particlesCount * 3; i+=3) {
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i+1] = (Math.random() - 0.5) * 100;
        posArray[i+2] = (Math.random() - 0.5) * 100;

        const mixedColor = color1.clone().lerp(color2, Math.random());
        colorArray[i] = mixedColor.r;
        colorArray[i+1] = mixedColor.g;
        colorArray[i+2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const material = new THREE.PointsMaterial({
        size: isMobile ? 0.25 : 0.15, // Make particles slightly larger on mobile since there are fewer
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Pointer Interaction (replaces separate mouse and touch events)
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    function onPointerMove(event) {
        pointerX = (event.clientX - windowHalfX);
        pointerY = (event.clientY - windowHalfY);
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerdown', onPointerMove, { passive: true });

    // Scroll Interaction
    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    }, { passive: true });

    // Animation Loop
    const clock = new THREE.Clock();
    let isRendering = true;
    let animationFrameId;

    const animate = () => {
        if (!isRendering) return;

        const elapsedTime = clock.getElapsedTime();

        // Sensitivity is different for mobile (touch covers less screen pixel distance usually)
        const factor = isMobile ? 0.002 : 0.001;
        targetX = pointerX * factor;
        targetY = pointerY * factor;

        // Base rotation
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;

        // Smooth Lerp for pointer interaction
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        // Scroll interaction - move camera down as we scroll down
        camera.position.y = -scrollY * 0.01;
        
        // Gentle float effect
        particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 2;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    // Battery Saver / Performance Optimization
    // Pause Three.js rendering if hero section is not visible
    const heroSection = document.getElementById('hero');
    if (heroSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!isRendering) {
                        isRendering = true;
                        clock.start();
                        animate();
                    }
                } else {
                    isRendering = false;
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                    }
                }
            });
        }, { threshold: 0 }); // trigger as soon as it's fully out

        observer.observe(heroSection);
    }
});
