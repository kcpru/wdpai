import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: { usePolling: true },
    hmr: { clientPort: 5174 },
  },
});
