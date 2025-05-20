// Service Workerを登録する関数
export function register() {
  if ("serviceWorker" in navigator) {
    // 既存のService Workerを解除してから登録
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }

      // 古いService Workerがアンロードされるのを待つ
      setTimeout(() => {
        const swUrl = `${window.location.origin}/service-worker.js`;

        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log("Service Worker登録成功:", registration);

            // 更新を確認
            registration.update();

            // 新しいService Workerが見つかった場合
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      console.log("新しいService Workerが利用可能です");
                    } else {
                      console.log("Service Workerがオフラインで使用できます");
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error("Service Worker登録失敗:", error);
          });
      }, 1000); // 1秒待ってから再登録
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
