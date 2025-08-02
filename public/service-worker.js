// キャッシュの名前とバージョン
const CACHE_NAME = "wealth-tracker-v1";
const DYNAMIC_CACHE = "wealth-tracker-dynamic-v1";

// キャッシュするファイル（重要なアセットのみ）
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/Icon-192.png",
  "/Icon-512.png"
];

// Service Workerのインストール時
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Failed to cache:", error);
      });
    })
  );
  self.skipWaiting();
});

// Service Workerのアクティベート時
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチイベント処理（ネットワークファースト戦略）
self.addEventListener("fetch", (event) => {
  // WebSocketやデータAPIリクエストをキャッシュから除外
  if (
    event.request.url.includes("ws:") || 
    event.request.url.includes("wss:") ||
    event.request.url.includes("supabase") ||
    event.request.url.includes("firebase") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワークからの取得に成功した場合
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // 静的アセットをダイナミックキャッシュに保存
        const responseToCache = response.clone();
        
        if (
          event.request.url.includes(".js") ||
          event.request.url.includes(".css") ||
          event.request.url.includes(".png") ||
          event.request.url.includes(".jpg") ||
          event.request.url.includes(".ico")
        ) {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから取得
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          // HTMLリクエストの場合はindex.htmlを返す
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }
        });
      })
  );
});
