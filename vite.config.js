import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import dsv from '@rollup/plugin-dsv'

export default {
  build: {
    sourcemap: true,
  },
  plugins: [
    vue(),
    dsv(), 
  ]
}
