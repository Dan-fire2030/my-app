// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 8080,
    },
    watch: {
      usePolling: true,
    },
  },
  define: {
    global: 'globalThis',
    // ブラウザ互換性のための定義
    'process.env': {},
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
    exclude: ['cross-fetch', 'whatwg-fetch']
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
