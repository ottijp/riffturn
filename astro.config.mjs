import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  srcDir: './src/renderer',
  output: 'static',
  integrations: [react()],
  server: {
    host: '127.0.0.1',
  },
})
