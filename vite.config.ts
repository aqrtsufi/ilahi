// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  base: '/ilahi/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', // important: auto update when a new SW is available
      devOptions: { enabled: false },
      workbox: {
        // clientsClaim: true,
        // this comment is backwards: `false` means "don't force", but
  // with registerType: 'autoUpdate' the plugin will set it to true anyway
 
        // skipWaiting: false, 
        cleanupOutdatedCaches: true, // Remove old caches
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//, /\.[^/]+$/],
        runtimeCaching: [
          {
      // GitHub API for songs: always try network first, but keep a cache

            urlPattern: ({ url }) => url.origin === 'https://api.github.com' && /\/repos\/yashineonline\/ilahiRepository\/contents\//.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-content',
              networkTimeoutSeconds: 5, // if network is too slow, fall back to cache
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
      },     
      includeAssets: [
'512.png', '1024.png', '180.png', '167.png', '152.png', '120.png'
      ],
      manifest: {
        name: "ilahi Book App",
        short_name: "ilahi",
        description: "Collection of ilahis",
        start_url: "/ilahi/",
        scope: "/ilahi/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#16a34a",
        orientation: "any",
        icons: [
          { src: '512.png', sizes: '512x512', type: 'image/png' },
          { src: '1024.png', sizes: '1024x1024', type: 'image/png' },
          { src: '120.png', sizes: '120x120', type: 'image/png' },
          { src: '152.png', sizes: '152x152', type: 'image/png' },
          { src: '167.png', sizes: '167x167', type: 'image/png' },
          { src: '180.png', sizes: '180x180', type: 'image/png' },
        ]
      }
    }),

// 🔹 Add virtual module plugin here
{
  name: 'virtual-build-info',
  resolveId(id) {
    if (id === 'virtual:build-info') return '\0virtual:build-info';
  },
  load(id) {
    if (id === '\0virtual:build-info') {
      const buildDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
      return `export const buildDate = ${JSON.stringify(buildDate)};
              export const version = ${JSON.stringify(pkg.version)};`;
    }
  }
}
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'docs', // convention is keep this dist, but we make docs for
    chunkSizeWarningLimit: 1500, // optional: only changes the warning threshold

    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/analytics'],
          pdf: ['pdf-lib'],
          fa: [
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/free-regular-svg-icons',
            '@fortawesome/free-brands-svg-icons',
            '@fortawesome/vue-fontawesome'
          ]
        }
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