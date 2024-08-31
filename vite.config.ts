import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/ilahi/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        '16.png', '20.png', '29.png', '32.png', '40.png', '48.png', '50.png', 
        '57.png', '58.png', '60.png', '64.png', '72.png', '76.png', '80.png', 
        '87.png', '96.png', '100.png', '114.png', '120.png', '128.png', '144.png', 
        '152.png', '167.png', '180.png', '192.png', '256.png', '512.png', '1024.png'
      ],
      manifest: {
        name: "ilahi Book App",
        short_name: "Ilahi",
        description: "Collection of Ilahis",
        start_url: "/ilahi/",
        scope: "/ilahi/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#16a34a",
        orientation: "any",
        icons: [
          { src: '/16.png', sizes: '16x16', type: 'image/png' },
          { src: '/20.png', sizes: '20x20', type: 'image/png' },
          { src: '/29.png', sizes: '29x29', type: 'image/png' },
          { src: '/32.png', sizes: '32x32', type: 'image/png' },
          { src: '/40.png', sizes: '40x40', type: 'image/png' },
          { src: '/48.png', sizes: '48x48', type: 'image/png' },
          { src: '/50.png', sizes: '50x50', type: 'image/png' },
          { src: '/57.png', sizes: '57x57', type: 'image/png' },
          { src: '/58.png', sizes: '58x58', type: 'image/png' },
          { src: '/60.png', sizes: '60x60', type: 'image/png' },
          { src: '/64.png', sizes: '64x64', type: 'image/png' },
          { src: '/72.png', sizes: '72x72', type: 'image/png' },
          { src: '/76.png', sizes: '76x76', type: 'image/png' },
          { src: '/80.png', sizes: '80x80', type: 'image/png' },
          { src: '/87.png', sizes: '87x87', type: 'image/png' },
          { src: '/96.png', sizes: '96x96', type: 'image/png' },
          { src: '/100.png', sizes: '100x100', type: 'image/png' },
          { src: '/114.png', sizes: '114x114', type: 'image/png' },
          { src: '/120.png', sizes: '120x120', type: 'image/png' },
          { src: '/128.png', sizes: '128x128', type: 'image/png' },
          { src: '/144.png', sizes: '144x144', type: 'image/png' },
          { src: '/152.png', sizes: '152x152', type: 'image/png' },
          { src: '/167.png', sizes: '167x167', type: 'image/png' },
          { src: '/180.png', sizes: '180x180', type: 'image/png' },
          { src: '/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/256.png', sizes: '256x256', type: 'image/png' },
          { src: '/512.png', sizes: '512x512', type: 'image/png' },
          { src: '/1024.png', sizes: '1024x1024', type: 'image/png' }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'docs', // convention is keep this dist, but we make docs for
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  optimizeDeps: {
    exclude: [
      // '**/*.ignore.ts', 
      // '**/*.ignore.vue',
    ]
  }
})