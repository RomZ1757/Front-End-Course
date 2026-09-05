import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// the base is relative so that the built application can be served
// from any path on the hosting server (e.g. render.com)
export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        outDir: 'dist'
    }
});
