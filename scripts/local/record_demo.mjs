// Drives the read-only demo flow in a recorded Chromium session.
// Invoked by scripts/local/record_demo.sh; expects the demo server running
// at BASE_URL (default http://127.0.0.1:3300) and writes a .webm into VIDEO_DIR.
import { chromium } from 'playwright-core'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:3300'
const VIDEO_DIR = process.env.VIDEO_DIR ?? 'scripts/local/.demo-video'

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 800 } },
})
const page = await context.newPage()

// Login → dashboard
await page.goto(`${BASE_URL}/login`)
await page.waitForLoadState('networkidle')
await pause(1500)
await page.getByRole('button', { name: 'Continue as Demo User' }).click()
await page.waitForURL(/\/dashboard$/)
await page.getByRole('heading', { name: 'Exercise Completion History' }).waitFor()
await page.waitForLoadState('networkidle')
await pause(2500)

// Exercise search
await page.goto(`${BASE_URL}/exercises`)
await page.getByRole('heading', { name: 'EXERCISES' }).waitFor()
await page.waitForLoadState('networkidle')
await pause(1500)
await page.getByPlaceholder('Search exercises...').pressSequentially('push', { delay: 150 })
await pause(600)
await page.getByRole('button', { name: 'Search' }).click()
await page.getByText('Found 1 results.').waitFor()
await pause(2000)

// Exercise detail with demonstration video
await page.getByText('Push-Up').first().click()
await page.waitForLoadState('networkidle')
await pause(3000)

// Workout template with sets
await page.goto(`${BASE_URL}/workouts/1`)
await page.getByLabel('Workout Name').waitFor()
await page.waitForLoadState('networkidle')
await pause(2500)
await page.mouse.wheel(0, 400)
await pause(1500)
await page.mouse.wheel(0, -400)
await pause(1000)

// Attempt a save → server-side read-only guard
await page.getByRole('button', { name: 'Finish' }).click()
await page.getByText(/Error saving workout: Demo mode is read-only/).waitFor()
await pause(3000)

await context.close()
const video = page.video()
if (video) console.log(`video saved: ${await video.path()}`)
await browser.close()
