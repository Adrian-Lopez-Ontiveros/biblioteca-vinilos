import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'logo-vinilos-edu.png',
        'favicon-32.png',
        'favicon-48.png',
        'apple-touch-icon.png',
        'icon-192x192.png',
        'icon-512x512.png',
        'icon-maskable-512.png',
      ],
      manifest: {
        name: 'Los vinilos de Edu',
        short_name: 'Vinilos Edu',
        description: 'Colección personal de vinilos',
        theme_color: '#23170F',
        background_color: '#E8D5B5',
        display: 'standalone',
        lang: 'es',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
