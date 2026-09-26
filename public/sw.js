const CACHE_NAME = "forma-pwa-v2";
const OFFLINE_ASSETS = [
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response("Forma este offline acum. Revino cand ai conexiune.", {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            status: 503,
          }),
      ),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseCopy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  );
});

self.addEventListener("push", (event) => {
  const fallback = {
    body: "Deschide Forma pentru urmatorul pas.",
    title: "Forma",
    url: "/dashboard",
  };
  const data = event.data ? event.data.json() : fallback;
  const title = data.title || fallback.title;

  event.waitUntil(
    self.registration.showNotification(title, {
      badge: "/icon-192.png",
      body: data.body || fallback.body,
      icon: "/icon-192.png",
      tag: data.tag || "forma-reminder",
      data: {
        url: data.url || fallback.url,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => {
        const existingClient = clients.find((client) => client.url.includes(targetUrl));
        if (existingClient) return existingClient.focus();
        return self.clients.openWindow(targetUrl);
      }),
  );
});
