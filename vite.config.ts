import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Configuração de dev-server com proxies úteis para desenvolvimento local.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: false,
    proxy: {
      // Proxy para o CDN usado por extensões (evita CORS no dev)
      '/cuponomia': {
        target: 'https://ext-cdn.cuponomia.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cuponomia/, ''),
        secure: true,
      },
      // Proxy para o backend local (opcional: evita CORS entre frontend e backend)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
