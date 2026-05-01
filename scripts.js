// ---- Animate KPIs ----
function counter(id, end, duration, fmt) {
    let el = document.getElementById(id);
    if (!el) return;
    let start = 0,
        t0 = null;
    const step = ts => {
        if (!t0) t0 = ts;
        const p = Math.min(1, (ts - t0) / duration);
        const v = Math.floor(p * end);
        el.textContent = fmt(v);
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
    counter('v1', 6, 700, v => v);
    counter('v2', 97, 900, v => v + '%');
    counter('v3', 28450, 1000, v => '$' + v.toLocaleString());

    // ---- Render chart bars ----
    const chartMini = document.getElementById('chartMini');
    if (chartMini) {
        [62, 75, 83, 91, 97].forEach(h => {
            const b = document.createElement('div');
            b.className = 'chart-bar-mini';
            b.style.height = (h * 0.7) + 'px';
            chartMini.appendChild(b);
        });
    }

    // ---- Render alerts ----
    const alerts = [{
        t: 'High CPU — api-server-01',
        s: 'critical'
    },
    {
        t: 'Memory threshold — db-cluster',
        s: 'critical'
    },
    {
        t: 'Payment gateway latency',
        s: 'warning'
    },
    {
        t: 'Log ingestion rate reduced',
        s: 'info'
    }
    ];
    const al = document.getElementById('alertList');
    if (al) {
        alerts.slice(0, 3).forEach(a => {
            al.innerHTML += `<div class="alert-item">
        <div class="sev ${a.s}"></div>
        <span class="alert-t">${a.t}</span>
        <span class="alert-b b${a.s.charAt(0)}">${a.s}</span>
      </div>`;
        });
    }

    // ---- Logo Loop Logic ----
    initLogoLoop();

    function initLogoLoop() {
        const track = document.getElementById('logoTrack');
        const list = document.getElementById('logoList');
        if (!track || !list) return;

        // Clone list for seamless loop (at least 2 copies)
        const clone = list.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);

        let offset = 0;
        let speed = 60; // pixels per second
        let currentVelocity = speed;
        let isHovered = false;
        let lastTimestamp = null;

        track.addEventListener('mouseenter', () => isHovered = true);
        track.addEventListener('mouseleave', () => isHovered = false);

        function animate(timestamp) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaTime = (timestamp - lastTimestamp) / 1000;
            lastTimestamp = timestamp;

            // Smooth velocity transitions
            const targetVelocity = isHovered ? 0 : speed;
            const SMOOTH_TAU = 0.25;
            const easingFactor = 1 - Math.exp(-deltaTime / SMOOTH_TAU);
            currentVelocity += (targetVelocity - currentVelocity) * easingFactor;

            const seqSize = list.offsetWidth;
            if (seqSize > 0) {
                offset += currentVelocity * deltaTime;
                // Wrap around
                offset = offset % seqSize;
                track.style.transform = `translate3d(${-offset}px, 0, 0)`;
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

        // Initial dimension recalibration on image load
        const images = track.querySelectorAll('img');
        images.forEach(img => {
            if (img.complete) return;
            img.onload = () => { /* triggers offset recalculation implicitly on next frame */ };
        });

        // Start Entrance Animations
        initHeroEntrance();
        // Start Reveal Engine
        initScrollReveal();
        // Start Dynamic Text Loop
        initDynamicTextLoop();
    }

    // 2. HERO ENTRANCE ANIMATION (Zoom-out, Slide-in text, Pop buttons)
    function initHeroEntrance() {
        if (!window.gsap) return;

        const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: {
                trigger: '.hero',
                start: 'top bottom', // Start when the hero starts entering
                onEnter: () => tl.restart(),
                onEnterBack: () => tl.restart()
            }
        });

        tl.to('.hero-bg', {
            scale: 1,
            duration: 2.5,
            ease: 'expo.out'
        })
            .fromTo('.hero-eyebrow',
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 1 },
                '-=1.8'
            )
            .fromTo('.hero h1',
                { x: -70, opacity: 0 },
                { x: 0, opacity: 1, duration: 1.2 },
                '-=1.5'
            )
            .fromTo('.hero p',
                { x: -40, opacity: 0 },
                { x: 0, opacity: 1, duration: 1 },
                '-=1.2'
            )
            .fromTo('.hero-buttons',
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' },
                '-=1'
            );
    }

    // 3. DYNAMIC HERO TEXT LOOP (Refined Typing Effect)
    async function initDynamicTextLoop() {
        const target = document.getElementById('dynamic-text');
        if (!target || !window.gsap) return;

        const words = ["AI", "Algomox"];
        let wordIndex = 0;

        async function typeWord(word) {
            target.innerHTML = '';
            for (let char of word) {
                const span = document.createElement('span');
                span.className = 'typing-char';
                span.innerText = char;
                span.style.opacity = 0;
                target.appendChild(span);

                gsap.fromTo(span,
                    { opacity: 0, y: 5 },
                    { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
                );
                await new Promise(r => setTimeout(r, 120));
            }
        }

        async function deleteWord() {
            const chars = Array.from(target.querySelectorAll('.typing-char'));
            for (let i = chars.length - 1; i >= 0; i--) {
                const span = chars[i];
                gsap.to(span, {
                    opacity: 0,
                    y: -5,
                    duration: 0.15,
                    ease: 'power2.in',
                    onComplete: () => span.remove()
                });
                await new Promise(r => setTimeout(r, 60));
            }
        }

        while (true) {
            const currentWord = words[wordIndex];
            await typeWord(currentWord);
            await new Promise(r => setTimeout(r, 2000));
            await deleteWord();
            await new Promise(r => setTimeout(r, 500));
            wordIndex = (wordIndex + 1) % words.length;
        }
    }

    // 3. GSAP SCROLL REVEAL ENGINE
    function initScrollReveal() {
        if (!window.gsap || !window.ScrollTrigger) return;

        gsap.registerPlugin(ScrollTrigger);

        // A. TEXT REVEAL (Blur, Opacity, Rotation)
        document.querySelectorAll('.js-reveal-text').forEach(el => {
            const text = el.innerText;
            const words = text.split(/(\s+)/).map(word => {
                if (word.match(/^\s+$/)) return word;
                return `<span class="word">${word}</span>`;
            }).join('');

            el.innerHTML = words;
            const wordElements = el.querySelectorAll('.word');

            // 1. Rotation (Container level)
            gsap.fromTo(el,
                { transformOrigin: '0% 50%', rotate: 3 },
                {
                    ease: 'none',
                    rotate: 0,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom center',
                        scrub: true
                    }
                }
            );

            // 2. Opacity & Blur (Word level)
            gsap.fromTo(wordElements,
                { opacity: 0.1, filter: 'blur(8px)' },
                {
                    ease: 'none',
                    opacity: 1,
                    filter: 'blur(0px)',
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom-=10%',
                        end: 'bottom center',
                        scrub: true
                    }
                }
            );
        });

        // B. IMAGE / MOCKUP REVEAL
        document.querySelectorAll('.js-reveal-img, .ui-mockup, .sol-tile, .benefit-item i').forEach(el => {
            gsap.fromTo(el,
                { opacity: 0.6, filter: 'blur(10px)', rotate: 4, scale: 0.9, y: 30 },
                {
                    ease: 'power1.out',
                    opacity: 1,
                    filter: 'blur(0px)',
                    rotate: 0,
                    scale: 1,
                    y: 0,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'top center',
                        scrub: true
                    }
                }
            );
        });

        // C. DIRECTIONAL SLIDE REVEAL (Left)
        document.querySelectorAll('.js-reveal-slide-left').forEach(el => {
            gsap.fromTo(el,
                { x: -120, opacity: 0, filter: 'blur(12px)' },
                {
                    opacity: 1,
                    x: 0,
                    filter: 'blur(0px)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'top 60%',
                        scrub: 1.2
                    }
                }
            );
        });

        // D. DIRECTIONAL SLIDE REVEAL (Right)
        document.querySelectorAll('.js-reveal-slide-right').forEach(el => {
            gsap.fromTo(el,
                { x: 120, opacity: 0, filter: 'blur(12px)' },
                {
                    opacity: 1,
                    x: 0,
                    filter: 'blur(0px)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'top 60%',
                        scrub: 1.2
                    }
                }
            );
        });

        // E. BUTTON REVEAL (Staggered/Sequenced)
        document.querySelectorAll('.js-reveal-btn').forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 30, scale: 0.7, filter: 'blur(8px)' },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom-=2%',
                        end: 'bottom center',
                        scrub: 1.2
                    }
                }
            );
        });

        // F. SCROLL FLOAT (Character-based Animation)
        document.querySelectorAll('.js-scroll-float').forEach(el => {
            // Recursive function to split text nodes while preserving tags
            function splitTextNodes(node) {
                if (node.nodeType === 3) { // Text node
                    const text = node.nodeValue;
                    const frag = document.createDocumentFragment();
                    for (let char of text) {
                        const span = document.createElement('span');
                        span.className = 'char';
                        span.innerHTML = char === ' ' ? '&nbsp;' : char;
                        frag.appendChild(span);
                    }
                    node.parentNode.replaceChild(frag, node);
                } else if (node.nodeType === 1 && node.className !== 'char') {
                    // Element node, and not already a .char
                    const children = Array.from(node.childNodes);
                    children.forEach(child => splitTextNodes(child));
                }
            }

            splitTextNodes(el);
            const charElements = el.querySelectorAll('.char');

            gsap.fromTo(charElements,
                {
                    opacity: 0,
                    yPercent: 120,
                    scaleY: 2.3,
                    scaleX: 0.7,
                    transformOrigin: '50% 0%'
                },
                {
                    opacity: 1,
                    yPercent: 0,
                    scaleY: 1,
                    scaleX: 1,
                    stagger: 0.03,
                    ease: 'back.inOut(2)',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: '+=450',
                        scrub: true
                    }
                }
            );
        });

        // G. POP REVEAL (Scale + Opacity)
        document.querySelectorAll('.js-reveal-pop').forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom-=5%',
                        end: 'top center',
                        scrub: 1
                    }
                }
            );
        });

        // H. SCROLL WORDS (Word-based Animation)
        document.querySelectorAll('.js-scroll-words').forEach(el => {
            // Function to split text nodes into words while preserving tags
            function splitTextIntoWords(node) {
                if (node.nodeType === 3) { // Text node
                    const text = node.nodeValue;
                    const frag = document.createDocumentFragment();
                    const words = text.split(/(\s+)/);
                    words.forEach(word => {
                        if (word.match(/^\s+$/)) {
                            frag.appendChild(document.createTextNode(word));
                        } else if (word !== '') {
                            const span = document.createElement('span');
                            span.className = 'word-v';
                            span.style.display = 'inline-block';
                            span.style.whiteSpace = 'pre';
                            span.innerText = word;
                            frag.appendChild(span);
                        }
                    });
                    node.parentNode.replaceChild(frag, node);
                } else if (node.nodeType === 1 && node.className !== 'word-v') {
                    const children = Array.from(node.childNodes);
                    children.forEach(child => splitTextIntoWords(child));
                }
            }

            splitTextIntoWords(el);
            const wordElements = el.querySelectorAll('.word-v');

            gsap.fromTo(wordElements,
                {
                    opacity: 0,
                    yPercent: 100,
                    scaleY: 1.5,
                    scaleX: 0.9,
                    transformOrigin: '50% 0%'
                },
                {
                    opacity: 1,
                    yPercent: 0,
                    scaleY: 1,
                    scaleX: 1,
                    stagger: 0.1,
                    ease: 'back.out(1.5)',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom-=10%',
                        end: '+=400',
                        scrub: true
                    }
                }
            );
        });
    }
});
