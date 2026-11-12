const CACHE_NAME = "kh-portfolio-v1";

const CORE_ASSETS = [
    "./",
    "./index.html",
    "./about.html",
    "./story.html",
    "./skills.html",
    "./myworks.html",
    "./media.htm",
    "./style.css",
    "./about.css",
    "./java.js",
    "./i18n.js",
    "./hero3d.js",
    "./manifest.json",
    "./cv.pdf",
    "./favicon.svg",
    "./batman-logo.svg",
    "./profile.png",
    "./work-portfolio.jpeg",
    "./work-dashboard.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    // Only handle same-origin GET requests; let CDN/CDN scripts pass through normally
    if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
                    return networkResponse;
                })
                .catch(() => cached);

            return cached || fetchPromise;
        })
    );
});
