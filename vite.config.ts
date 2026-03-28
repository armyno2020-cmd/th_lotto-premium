import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:54321',
          changeOrigin: true,
        },
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://rpqjyffacoxhpjbqaurh.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZXJnZW93dndkbGF1b3FxemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTY5MDAsImV4cCI6MjA5MDE5MjkwMH0.9LtwK_TWeLP5BlkCXbU8_D62qQTtuE-7BkTajipRros'),
    },
  }
})
