// キャッシュの名前とバージョン
const CACHE_NAME = "budget-app-v2"; // バージョン番号を更新

// キャッシュするファイル
const urlsToCache = [
  "/",
  "/index.html",
  "/assets/index.js", // Viteのビルドパスに合わせて修正
  "/assets/index.css", // Viteのビルドパスに合わせて修正
  "/manifest.json",
  "/favicon.ico",
  "/Icon-192.png",
  "/Icon-512.png",
];

// Service Workerのインストール時
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
  // 直ちにアクティベートする（古いSWの待機をスキップ）
  self.skipWaiting();
});

// Service Workerのアクティベート時
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  // 古いキャッシュを削除
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 制御していないクライアントも制御する
  self.clients.claim();
});

// フェッチイベント処理
self.addEventListener("fetch", (event) => {
  // WebSocketリクエストを無視
  if (event.request.url.includes("ws:") || event.request.url.includes("wss:")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュにあればそれを返す
      if (response) {
        return response;
      }

      // キャッシュになければネットワークから取得
      return fetch(event.request)
        .then((networkResponse) => {
          // レスポンスが有効か確認
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // レスポンスをキャッシュに保存 (アイコン以外)
          if (
            !event.request.url.includes("Icon-192.png") &&
            !event.request.url.includes("Icon-512.png")
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          // エラー発生時の処理 (例: オフラインページを表示)
          return new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/html" },
          });
        });
    })
  );
});
