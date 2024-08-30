import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', 
      injectRegister: 'auto',
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js, css,html, ico, png, svg, json, vue, txt, woff2}']
      },
      includeAssets: ['https://res.cloudinary-com/famosa-adegbite/image/upload/q_auto,f_auto/v1659647575/myPotfolio/logo4a_eclp2w.png'],
      manifest: { 
        name: 'VuePush',
        short_name: 'VuePush', 
        description: 'Prueba de concepto envío notificaciones Push',
        theme_color: '#52a8f2',
        background_color: '#52a8f2',
        display: 'standalone',
        icons: [
          {
            src: 'img/icons/icon-192x192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/icons/icon-256x256.png', 
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'img/icons/icon-512x512.png', 
            sizes: '512x512',
            type: 'image/png'
          },
        ],
      }
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
