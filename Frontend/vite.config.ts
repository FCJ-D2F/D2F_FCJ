import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { vitePluginExpress } from './vite-plugin-express'
import { createServer } from './server/index'

export default defineConfig({
  server: { host: '::' },
  plugins: [
    react(),
    vitePluginExpress(createServer),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
