import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This makes paths relative. For example, 
  // https://apps.facebook.com/assets/index-S8pLizL7.js will not be loaded properly if this is not present
})
