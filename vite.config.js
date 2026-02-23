import { defineConfig } from 'vite'
// Force restart: 2026-02-10 14:36
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: {
                name: 'Nexa OS',
                short_name: 'Nexa',
                description: 'Nexa AI - Your Intelligent Operating System',
                theme_color: '#0a0a0a',
                background_color: '#0a0a0a',
                display: 'standalone',
                orientation: 'portrait-primary',
                icons: [
                    {
                        src: '/nexa-logo.jpg',
                        sizes: '512x512',
                        type: 'image/jpeg',
                        purpose: 'any'
                    },
                    {
                        src: '/nexa-logo.jpg',
                        sizes: '512x512',
                        type: 'image/jpeg',
                        purpose: 'maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}']
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@nexa": path.resolve(__dirname, "./src/packages"),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            '/anthropic-api': {
                target: 'https://api.anthropic.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/anthropic-api/, ''),
            },
            '/openai-api': {
                target: 'https://api.openai.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/openai-api/, ''),
            },
            '/deepseek-api': {
                target: 'https://api.deepseek.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/deepseek-api/, ''),
            },
            '/tavily-api': {
                target: 'https://api.tavily.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/tavily-api/, ''),
            },
            '/groq-api': {
                target: 'https://api.groq.com/openai',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/groq-api/, ''),
            },
        },
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        }
    },
    preview: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        }
    },
    build: {
        chunkSizeWarningLimit: 600
    }
})
