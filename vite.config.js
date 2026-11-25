import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Arena previews use a dynamic e2b.app hostname, not localhost.
  server: { host: '0.0.0.0', allowedHosts: ['.e2b.app'] },
});
