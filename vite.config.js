/**
 * Vite 配置文件
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

const resolve = (dir) => path.resolve(__dirname, dir)

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [resolve('src/assets/icons')],
      symbolId: '[name]',
    }),
  ],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': resolve('src'),
      '@helper': resolve('src/helper'),
      '@config': resolve('src/config'),
      '@pages': resolve('src/pages'),
      '@assets': resolve('src/assets'),
      '@router': resolve('src/router'),
      '@mixins': resolve('src/mixins'),
      '@components': resolve('src/components'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
  },
})
