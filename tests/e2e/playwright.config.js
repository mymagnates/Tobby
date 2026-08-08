import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:9000'
const allowedHosts = new Set(['127.0.0.1', 'localhost'])
const parsedBaseURL = new URL(baseURL)
const usesApprovedRemoteEnvironment = process.env.E2E_ENV === 'staging'

// Browser E2E must never create or mutate production customer data.
if (!allowedHosts.has(parsedBaseURL.hostname) && !usesApprovedRemoteEnvironment) {
  throw new Error('E2E_BASE_URL must be localhost, or set E2E_ENV=staging for an isolated staging environment.')
}

export default defineConfig({
  testDir: './specs',
  outputDir: '../../test-results/playwright',
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: '../../playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
