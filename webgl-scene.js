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
    const originalPosArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color(0xe8c872); // Premium Gold
    const color2 = new THREE.Color(0xffffff); // White

    for(let i = 0; i < particlesCount * 3; i+=3) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 50;

        posArray[i] = x; posArray[i+1] = y; posArray[i+2] = z;
        originalPosArray[i] = x; originalPosArray[i+1] = y; originalPosArray[i+2] = z;
        velocityArray[i] = 0; velocityArray[i+1] = 0; velocityArray[i+2] = 0;

        const mixedColor = color1.clone().lerp(color2, Math.random());
        colorArray[i] = mixedColor.r;
        colorArray[i+1] = mixedColor.g;
        colorArray[i+2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const material = new THREE.PointsMaterial({
        size: isMobile ? 0.3 : 0.2, // Slightly larger
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Pointer Interaction (replaces separate mouse and touch events)
    // Raycaster for particle repulsion
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);

    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    function onPointerMove(event) {
        // Normalized device coordinates for raycaster
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Reset mouse when leaving screen
    document.addEventListener('pointerout', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

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

        // 1. Raycaster intersection point on a conceptual plane at z=0
        raycaster.setFromCamera(mouse, camera);
        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const targetPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, targetPoint);

        // 2. Repulsion Physics
        const positions = particlesGeometry.attributes.position.array;
        
        // Transform targetPoint from World to Local mesh coordinates
        const localTarget = targetPoint.clone();
        particlesMesh.worldToLocal(localTarget);

        for(let i = 0; i < particlesCount * 3; i+=3) {
            const ox = originalPosArray[i];
            const oy = originalPosArray[i+1];
            const oz = originalPosArray[i+2];

            const px = positions[i];
            const py = positions[i+1];
            const pz = positions[i+2];

            // Distance to mouse (in local space)
            const dx = localTarget.x - px;
            const dy = localTarget.y - py;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Magnetic Repulsion
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = 15; // Radius of effect
            const force = (maxDistance - distance) / maxDistance;
            
            if(distance < maxDistance && mouse.x !== -9999) {
                // Push away
                velocityArray[i] -= forceDirectionX * force * 0.15;
                velocityArray[i+1] -= forceDirectionY * force * 0.15;
            }

            // Spring back to original position
            velocityArray[i] += (ox - px) * 0.02;
            velocityArray[i+1] += (oy - py) * 0.02;
            velocityArray[i+2] += (oz - pz) * 0.02;

            // Friction
            velocityArray[i] *= 0.9;
            velocityArray[i+1] *= 0.9;
            velocityArray[i+2] *= 0.9;

            // Apply velocity
            positions[i] += velocityArray[i];
            positions[i+1] += velocityArray[i+1];
            positions[i+2] += velocityArray[i+2];
        }
        
        particlesGeometry.attributes.position.needsUpdate = true;

        // Base slow rotation for the whole system
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;

        // Scroll interaction - move camera down as we scroll down
        camera.position.y = -scrollY * 0.01;
        
        // Gentle float effect
        particlesMesh.position.y = Math.sin(elapsedTime * 0.3) * 2;

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
