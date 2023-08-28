import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import electron from "vite-react-electron-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), electron()]
})
