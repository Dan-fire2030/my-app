import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost", // WSL環境でもWindows側のブラウザから接続可能に
    port: 3000, // デフォルトポート（変更可能）
    strictPort: true, // ポートが使用中ならエラー
    watch: {
      usePolling: true, // WSLでのファイル変更検出を安定化
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      clientPort: 5173,
    },
  },
});
