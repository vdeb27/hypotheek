import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: 'hidden',
    // De rates-cache JSON (628KB) wordt automatisch code-split
    // en async geladen. Dit is een databestand, geen code.
    chunkSizeWarningLimit: 700,
  },
});
