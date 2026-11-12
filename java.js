/* =========================================================
   KAREEM HESHAM PORTFOLIO — MAIN SCRIPT
   Fixes applied:
   - Null checks for every element (no more crashes on pages
     that don't have #laserText / .cursor-dot / .cursor-ring)
   - Batman splash intro now plays ONCE per browser session
     (sessionStorage), not on every page navigation
   - Custom cursor now works on every page and reacts with the
     background star particles
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initSplash();
    initParticles();
    initCursor();
    initScrollReveal();
    initMagnetic();
    initTilt();
    initGlowToggle();
    initSoundToggle();
    initEasterEgg();
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    });
}

/* =========================
   SPLASH / INTRO (runs once per session)
========================= */

function initSplash() {

    const splash = document.querySelector(".splash");
    const content = document.getElementById("content");
    const flash = document.querySelector(".flash");

    // Pages other than index.html don't have a splash screen at all
    if (!splash || !content) return;

    const alreadyShown = sessionStorage.getItem("kh_intro_shown");

    if (alreadyShown) {
        // Skip the intro completely, show the real page immediately
        splash.style.display = "none";
        if (flash) flash.style.display = "none";
        content.style.display = "block";
        initScramble();
        document.dispatchEvent(new CustomEvent("kh:content-visible"));
        return;
    }

    sessionStorage.setItem("kh_intro_shown", "1");

    const laserText = document.getElementById("laserText");
    if (laserText) {
        typeLaser(laserText, "KAREEM HESHAM");
    }

    const progressEl = document.getElementById("splashProgress");

    const MIN_TIME = 1800; // aesthetic minimum so the intro isn't a blink
    const MAX_TIME = 4500; // hard cap so a slow connection never hangs forever
    const start = performance.now();

    let pageLoaded = document.readyState === "complete";
    window.addEventListener("load", () => { pageLoaded = true; });

    const finishIntro = () => {
        splash.style.display = "none";
        if (flash) flash.style.display = "none";
        content.style.display = "block";
        initScramble();
        document.dispatchEvent(new CustomEvent("kh:content-visible"));
    };

    let finished = false;
    const doFinish = () => {
        if (finished) return;
        finished = true;
        finishIntro();
    };

    function tick() {
        if (finished) return;

        const elapsed = performance.now() - start;
        let percent = Math.min(96, (elapsed / MIN_TIME) * 96);

        if (pageLoaded && elapsed >= MIN_TIME) percent = 100;
        if (elapsed >= MAX_TIME) percent = 100;

        if (progressEl) progressEl.textContent = Math.floor(percent) + "%";

        if (percent >= 100) {
            setTimeout(doFinish, 250);
            return;
        }

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    const skipBtn = document.getElementById("skipIntro");
    if (skipBtn) {
        skipBtn.addEventListener("click", doFinish);
    }
}

function typeLaser(el, text) {
    let i = 0;

    function step() {
        if (i < text.length) {
            el.innerHTML += text.charAt(i);
            i++;
            setTimeout(step, 120);
        }
    }

    setTimeout(step, 1000);
}

/* =========================
   BACKGROUND STAR PARTICLES
   (reacts to the cursor position)
========================= */

function initParticles() {

    const canvas = document.getElementById("particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const PARTICLE_COUNT = 110;
    const REACT_RADIUS = 130;

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.6 + 0.4,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5
        });
    }

    // Shared mouse position (also used by initCursor)
    window.__mouse = { x: -9999, y: -9999 };

    document.addEventListener("mousemove", (e) => {
        window.__mouse.x = e.clientX;
        window.__mouse.y = e.clientY;
    });

    document.addEventListener("mouseleave", () => {
        window.__mouse.x = -9999;
        window.__mouse.y = -9999;
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const mx = window.__mouse.x;
        const my = window.__mouse.y;

        particles.forEach(p => {

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

            const distX = p.x - mx;
            const distY = p.y - my;
            const dist = Math.sqrt(distX * distX + distY * distY);

            let drawX = p.x;
            let drawY = p.y;
            let drawR = p.r;
            let glow = 0.55;

            if (dist < REACT_RADIUS) {
                const force = (REACT_RADIUS - dist) / REACT_RADIUS;
                const safeDist = dist || 1;

                // stars gently drift away from the cursor, like a soft field
                drawX += (distX / safeDist) * force * 22;
                drawY += (distY / safeDist) * force * 22;
                drawR = p.r + force * 1.8;
                glow = 0.55 + force * 0.45;
            }

            ctx.beginPath();
            ctx.arc(drawX, drawY, drawR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${glow})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* =========================
   CUSTOM CURSOR
   (dot follows instantly, ring trails smoothly,
   grows near clickable elements)
========================= */

function initCursor() {

    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    // Hide the custom cursor on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
        dot.style.display = "none";
        ring.style.display = "none";
        return;
    }

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;

    document.addEventListener("mousemove", (e) => {
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
    });

    function trailRing() {
        const target = window.__mouse || { x: ringX, y: ringY };
        ringX += (target.x - ringX) * 0.16;
        ringY += (target.y - ringY) * 0.16;

        ring.style.left = ringX + "px";
        ring.style.top = ringY + "px";

        requestAnimationFrame(trailRing);
    }
    trailRing();

    const hoverTargets = document.querySelectorAll(
        "a, button, .btn-glow, .btn-view, .work-card, .nav-link, input, textarea"
    );

    hoverTargets.forEach(el => {
        el.addEventListener("mouseenter", () => {
            ring.classList.add("cursor-hover");
            dot.classList.add("cursor-hover");
        });
        el.addEventListener("mouseleave", () => {
            ring.classList.remove("cursor-hover");
            dot.classList.remove("cursor-hover");
        });
    });

    document.addEventListener("mousedown", () => ring.classList.add("cursor-click"));
    document.addEventListener("mouseup", () => ring.classList.remove("cursor-click"));
}

/* =========================
   SCROLL REVEAL
   (fade + slide up elements as they enter the viewport)
========================= */

function initScrollReveal() {

    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    items.forEach((el, i) => {
        el.style.transitionDelay = (i % 3) * 0.12 + "s";
        observer.observe(el);
    });
}

/* =========================
   MAGNETIC BUTTONS
   (buttons/links pull slightly toward the cursor)
========================= */

function initMagnetic() {

    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch devices

    const targets = document.querySelectorAll(".btn-glow, .btn-cinematic, .btn-view");

    targets.forEach(el => {

        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;

            el.style.transition = "transform 0s";
            el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
        });

        el.addEventListener("mouseleave", () => {
            el.style.transition = "transform .35s ease";
            el.style.transform = "translate(0,0)";
        });
    });
}

/* =========================
   TEXT SCRAMBLE
   (classic decrypt-style text reveal for the hero title)
========================= */

class TextScramble {

    constructor(el) {
        this.el = el;
        this.chars = "!<>-_\\/[]{}—=+*^?#";
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => (this.resolve = resolve));

        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || "";
            const to = newText[i] || "";
            const start = Math.floor(Math.random() * 20);
            const end = start + Math.floor(Math.random() * 20);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = "";
        let complete = 0;

        for (let i = 0; i < this.queue.length; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

function initScramble() {

    const el = document.getElementById("scrambleTitle");
    if (!el) return;
    if (el.dataset.scrambled === "1") return; // don't replay if already run

    const text = el.getAttribute("data-text") || el.textContent.trim();
    el.dataset.scrambled = "1";
    el.textContent = "";

    const fx = new TextScramble(el);
    setTimeout(() => fx.setText(text), 250);
}

/* =========================
   3D TILT
   (cards subtly rotate in 3D toward the cursor)
========================= */

function initTilt() {

    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch

    const selector = ".glass-card, .work-card, .tech-pill, .timeline-box, .story-box, .about-box";
    const items = document.querySelectorAll(selector);

    items.forEach(el => {

        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;

            const rotateX = (-py * 10).toFixed(2);
            const rotateY = (px * 10).toFixed(2);

            el.style.transition = "transform 0s";
            el.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        el.addEventListener("mouseleave", () => {
            el.style.transition = "transform .45s ease";
            el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)";
        });
    });
}

/* =========================
   GLOW INTENSITY TOGGLE
   (softer shadows/contrast, saved in localStorage)
========================= */

function initGlowToggle() {

    const btn = document.getElementById("glowToggle");
    if (!btn) return;

    let low = localStorage.getItem("kh_low_glow") === "1";

    function apply() {
        document.body.classList.toggle("low-glow", low);
        btn.innerHTML = low
            ? '<i class="bi bi-brightness-low"></i>'
            : '<i class="bi bi-brightness-high"></i>';
        btn.classList.toggle("active-toggle", low);
        btn.title = low ? "Switch to full glow" : "Switch to soft glow";
    }
    apply();

    btn.addEventListener("click", () => {
        low = !low;
        localStorage.setItem("kh_low_glow", low ? "1" : "0");
        apply();
    });
}

/* =========================
   CLICK SOUND TOGGLE
   (off by default — generates a soft tone via Web Audio,
   no external audio file needed)
========================= */

function initSoundToggle() {

    const btn = document.getElementById("soundToggle");
    if (!btn) return;

    let enabled = localStorage.getItem("kh_sound") === "1";
    let audioCtx;

    function apply() {
        btn.innerHTML = enabled
            ? '<i class="bi bi-volume-up"></i>'
            : '<i class="bi bi-volume-mute"></i>';
        btn.classList.toggle("active-toggle", enabled);
        btn.title = enabled ? "Mute click sound" : "Enable click sound";
    }
    apply();

    function playClick() {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(680, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.13);
        } catch (e) {
            // Web Audio unavailable — fail silently
        }
    }

    btn.addEventListener("click", () => {
        enabled = !enabled;
        localStorage.setItem("kh_sound", enabled ? "1" : "0");
        apply();
        if (enabled) playClick();
    });

    document.addEventListener("click", (e) => {
        if (!enabled) return;
        const target = e.target.closest("a, button");
        if (target) playClick();
    });
}

/* =========================
   KONAMI CODE EASTER EGG
   (↑ ↑ ↓ ↓ ← → ← → b a → bat-signal)
========================= */

function initEasterEgg() {

    const signal = document.getElementById("batSignal");
    if (!signal) return;

    const sequence = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let pos = 0;

    document.addEventListener("keydown", (e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

        if (key === sequence[pos]) {
            pos++;
            if (pos === sequence.length) {
                pos = 0;
                triggerSignal();
            }
        } else {
            pos = (key === sequence[0]) ? 1 : 0;
        }
    });

    function triggerSignal() {
        signal.classList.add("show");
        setTimeout(() => signal.classList.remove("show"), 3200);
    }
}
