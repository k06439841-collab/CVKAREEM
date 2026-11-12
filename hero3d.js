/* =========================================================
   HERO 3D SCENE (index.html only)
   A soft glowing particle halo drifting behind the hero
   text — matches the site's existing star-particle motif
   instead of a harsh geometric shape.

   Bug fix: the canvas used to measure 0x0 because it sits
   inside #content, which is display:none until the splash
   finishes — so the renderer was born broken and never
   recovered. It now waits for the "kh:content-visible"
   event (dispatched from java.js) before sizing itself.

   Fails silently if three.js didn't load or WebGL is
   unavailable.
========================================================= */

(function () {

    let renderer, camera, scene, points;
    let ready = false;
    let targetX = 0;
    let targetY = 0;

    function createDotTexture() {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        const gradient = ctx.createRadialGradient(
            size / 2, size / 2, 0,
            size / 2, size / 2, size / 2
        );
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.4, "rgba(255,255,255,0.5)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        return new THREE.CanvasTexture(canvas);
    }

    function buildScene(canvas) {

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 7;

        try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        } catch (e) {
            return false; // WebGL unavailable
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const COUNT = 850;
        const positions = new Float32Array(COUNT * 3);

        for (let i = 0; i < COUNT; i++) {
            const r = 2.4 + Math.random() * 1.3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75;
            positions[i * 3 + 2] = r * Math.cos(phi);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            map: createDotTexture(),
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: 0xffffff
        });

        points = new THREE.Points(geometry, material);
        scene.add(points);

        return true;
    }

    function resize(canvas) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h) return false;

        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        return true;
    }

    function animate() {
        if (!ready) return;

        points.rotation.y += 0.0016;
        points.rotation.x += 0.0004;

        camera.position.x += (targetX * 0.9 - camera.position.x) * 0.02;
        camera.position.y += (-targetY * 0.6 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    function init() {

        const canvas = document.getElementById("hero3d");
        if (!canvas || typeof THREE === "undefined") return;

        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        if (!buildScene(canvas)) return;

        document.addEventListener("mousemove", (e) => {
            targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener("resize", () => resize(canvas));

        // Try sizing immediately (covers the "intro already shown" case,
        // where #content is already visible by the time this runs).
        if (resize(canvas)) {
            ready = true;
            animate();
        }

        // Also size (or start) once the splash actually reveals #content.
        document.addEventListener("kh:content-visible", () => {
            if (resize(canvas) && !ready) {
                ready = true;
                animate();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
