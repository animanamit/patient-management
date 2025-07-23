import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Exclude E2E tests and Playwright files
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/tests/e2e/**',
      '**/tests-examples/**',
      '**/*.spec.ts', // Exclude Playwright spec files
    ],
    // Include only unit tests
    include: [
      '**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname || '.', './src'),
    },
  },
})