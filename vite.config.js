import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "/csp-sudoku-visualizer/",  // <--- REPLACE "sudoku-solver" WITH YOUR EXACT REPO NAME
})