import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
  port: 6688
  
},
define: {
    // Định nghĩa global là window để các thư viện cũ không bị lỗi
    global: 'window',
  },
})
