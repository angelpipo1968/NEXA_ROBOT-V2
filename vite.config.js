import { defineConfig } from 'vite'
// Force restart: 2026-02-10 14:36
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [react()],
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
        }
    }
})
