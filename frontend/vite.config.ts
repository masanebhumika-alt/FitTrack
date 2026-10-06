import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // local dev only: forward /api calls to the backend (in Docker, nginx does this)
  server: { proxy: { '/api': 'http://localhost:4000' } },
  test: { environment: 'jsdom', setupFiles: ['./src/setup-tests.ts'] },
});
