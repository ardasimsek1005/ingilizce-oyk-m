import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const realPath = fs.realpathSync(__dirname);
  return {
    root: realPath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(realPath, '.'),
      },
    },
    server: {
      allowedHosts: true as true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/android/**']
      },
    },
  };
});
