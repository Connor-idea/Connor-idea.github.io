// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 用户主页仓库 + 自定义域名 connor.zone → 部署在域名根路径
  site: 'https://connor.zone',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
