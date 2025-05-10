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
  if (
    event.request.url.includes("Icon-192.png") ||
    event.request.url.includes("Icon-512.png")
  ) {
    event.respondWith(caches.match(event.request)); // キャッシュから取得
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // キャッシュが見つかればそれを返す
        if (response) {
          return response;
        }

        // キャッシュにない場合はネットワークリクエスト
        return fetch(event.request).then((response) => {
          // レスポンスが有効かを確認
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // レスポンスをクローンしてキャッシュに追加
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
  }
});
