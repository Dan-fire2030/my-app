// キャッシュの名前とバージョン
const CACHE_NAME = "budget-app-v1";

// キャッシュするファイル
const urlsToCache = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/manifest.json",
  "/favicon.ico",
  "/Icon-192.png",
  "/Icon-512.png",
];

// インストール時のキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// キャッシュの使用とフォールバック
self.addEventListener("fetch", (event) => {
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
