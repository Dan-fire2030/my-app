// Service Workerを登録する関数
export function register() {
  if ("serviceWorker" in navigator) {
    const swUrl = `${window.location.origin}/service-worker.js`;

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("Service Worker registered:", registration.scope);

        // 定期的に更新をチェック
        setInterval(() => {
          registration.update();
        }, 60000); // 1分ごと

        // 新しいService Workerが見つかった場合
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // 新しいバージョンが利用可能
                  console.log("New content is available; please refresh.");
                  
                  // ユーザーに更新を通知する場合はここに処理を追加
                  if (window.confirm("新しいバージョンが利用可能です。更新しますか？")) {
                    window.location.reload();
                  }
                } else {
                  // コンテンツがオフラインで利用可能
                  console.log("Content is cached for offline use.");
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }
}

// Service Workerを解除する関数
export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log("Service Worker解除成功:", registration.scope);
        }
      })
      .catch((error) => {
        console.error("Service Worker解除失敗:", error);
      });
  }
}

// WebSocket接続を防止する (必要に応じて)
export function preventWebSocketConnection() {
  if (window.WebSocket) {
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function (url, protocols) {
      // WebSocketの接続をブロックまたは制御
      if (url.includes("ws://localhost:5173/")) {
        console.log("WebSocket接続をブロックしました:", url);
        // 開発環境のWebSocket接続を別のポートに変更
        url = url.replace("ws://localhost:5173/", "ws://localhost:8080/");
      }
      return new originalWebSocket(url, protocols);
    };
  }
}
