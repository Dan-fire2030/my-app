// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080, // ポート番号を5173から8080に変更
    strictPort: true, // ポートが使用中の場合はエラーを表示
    hmr: {
      // HMR (Hot Module Replacement) の設定
      protocol: "ws",
      host: "localhost",
      port: 8080, // WebSocketも同じポートを使用
    },
    watch: {
      // ファイル監視の設定
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
});
