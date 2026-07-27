// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@miguelvivar/sunat-fe-core': path.resolve('./packages/core/src/index.ts'),
        'sunat-fe-core': path.resolve('./packages/core/src/index.ts')
      }
    }
  }
});