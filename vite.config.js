import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // 开发环境使用根路径 '/',生产环境使用 '/gym-roi-tracker/'
  base: mode === 'production' ? '/gym-roi-tracker/' : '/',
  build: {
    rollupOptions: {
      input: {
        // 只构建 public 前端页面用于 GitHub Pages
        main: resolve(__dirname, 'public.html'),
      },
    },
    outDir: 'docs',  // 构建到 docs/ 用于 GitHub Pages
  },
  // 使用 public-static 作为静态资源目录
  // - 开发时: Vite 直接从这里提供静态文件
  // - 构建时: Vite 会自动复制 public-static/ 的内容到 dist/
  publicDir: 'public-static',

  // 开发服务器配置
  server: {
    port: 5173,
    open: '/index.html', // 开发时默认打开管理端
  },
}))
