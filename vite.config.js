import path, { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'
import { Buffer } from 'buffer'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.platform': null,
    'process.version': null,
    'globalThis.Buffer': process.env.NODE_ENV == 'development' ? Buffer : "Buffer",
  },
  base: './',
  clearScreen: false,
  server: {
    host: '0.0.0.0',
    hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
    // 服务配置
    port: 5172, // 类型： number 指定服务器端口;
  },
  plugins: [vue(),
    nodePolyfills(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    ElementPlus({
      // 引入的样式的类型，可以是css、sass、less等，
      importStyle: 'css',
      useSource: true
    }),
  ],resolve: {
    alias: {
      '~': resolve(__dirname, './'),
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs']
  },build: {
    minify: 'terser',
    brotliSize: false,
    // 消除打包大小超过500kb警告
    chunkSizeWarningLimit: 2000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },optimizeDeps: {
      include: ['element-plus/es/locale/lang/zh-cn', 'element-plus/es/locale/lang/en']
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // or "modern", "legacy"
        },
      },
    },
  
})
