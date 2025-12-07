// vite.config.ts 完整示例片段

import { fileURLToPath, URL } from 'node:url'; // <-- 确保这一行存在且正确

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // <--- 关键！必须添加这一行，告诉 Vite 从哪个目录开始解析路径
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    // 确保 resolve.alias 这一段使用了正确的导入
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) 
    }
  }
});