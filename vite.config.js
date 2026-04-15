import { defineConfig } from 'vite'
// Force restart: 2026-02-10 14:36
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        wasm(),
        topLevelAwait(),
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
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}'],
                maximumFileSizeToCacheInBytes: 6000000
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@nexa": path.resolve(__dirname, "./src/packages"),
        },
        dedupe: ['react', 'react-dom']
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
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
            '/ollama-api': {
                target: 'http://localhost:11434',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ollama-api/, ''),
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
        chunkSizeWarningLimit: 2500,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'zustand'],
                    three: ['three', '@react-three/fiber', '@react-three/drei'],
                    supabase: ['@supabase/supabase-js'],
                    icons: ['lucide-react', '@phosphor-icons/react'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot', '@radix-ui/react-toast', 'clsx', 'tailwind-merge', 'class-variance-authority']
                }
            }
        }
    }
})
