// playwright.config.js - UPDATED FILE
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 30000,
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5003',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'retain-on-failure',
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'test-mode',
      testMatch: '**/captcha.test.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5003/?testMode=true',
        launchOptions: {
          args: ['--disable-web-security'] // For local testing only
        }
      },
    },
    {
      name: 'production-mode',
      testMatch: '**/production-mode.test.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5003',
      },
    },
  ],
  
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'node server.js',
    url: 'http://localhost:5003',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});