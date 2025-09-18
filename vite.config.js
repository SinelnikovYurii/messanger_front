import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // или другой порт, если 5173 занят
  },
  build: {
    outDir: 'dist',
  }
});