import { defineConfig, devices } from "@playwright/test";

import { adminSecret, storePath } from "./e2e/constants";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const externalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    channel: "chrome",
    colorScheme: "dark",
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: externalServer
    ? undefined
    : {
        command: `npm run build && npm run start -- --port ${port}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 300_000,
        env: {
          ADMIN_SECRET: adminSecret,
          IP_HASH_SALT: "e2e-rill-ip-salt",
          WAITLIST_ALLOW_FILE_STORE: "true",
          WAITLIST_FILE_PATH: storePath,
          NEXT_PUBLIC_SITE_URL: baseURL,
          RESEND_API_KEY: "",
          RESEND_FROM_EMAIL: "",
        },
      },
});
