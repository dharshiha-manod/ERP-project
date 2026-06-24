 
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
 
export default defineConfig({
  plugins: [react()],
 
  server: {
    port: 5173,
    proxy: {
      // Every request starting with /api is forwarded to the backend
      "/api": {
        target: "http://localhost:5000",  // ← your Express backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})


