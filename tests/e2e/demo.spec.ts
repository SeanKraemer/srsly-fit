import { expect, test } from '@playwright/test'

async function loginAsDemoUser(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Continue as Demo User' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test('demo login reaches dashboard', async ({ page }) => {
  await loginAsDemoUser(page)

  await expect(page.getByRole('heading', { name: /Hello, Demo!/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Exercise Completion History' })).toBeVisible()
})

test('demo exercise search loads fixture results', async ({ page }) => {
  await loginAsDemoUser(page)
  await page.goto('/exercises')

  await expect(page.getByRole('heading', { name: 'EXERCISES' })).toBeVisible()
  await page.getByPlaceholder('Search exercises...').fill('push')
  await page.getByRole('button', { name: 'Search' }).click()

  await expect(page).toHaveURL(/\/exercises\?search=push/)
  await expect(page.getByText('Found 1 results.')).toBeVisible()
  await expect(page.getByText('Push-Up')).toBeVisible()
})

test('demo workout detail loads and blocks saves', async ({ page }) => {
  await loginAsDemoUser(page)
  await page.goto('/workouts/1')

  await expect(page.getByLabel('Workout Name')).toHaveValue('Upper Body Strength')
  await expect(page.getByText('Push-Up')).toBeVisible()

  await page.getByRole('button', { name: 'Finish' }).click()
  await expect(page.getByText(/Error saving workout: Demo mode is read-only/)).toBeVisible()
})

test('demo workout creation is read-only', async ({ page }) => {
  await loginAsDemoUser(page)
  await page.goto('/workouts')

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Demo mode is read-only')
    await dialog.accept()
  })

  await page.getByRole('button', { name: 'Start An Empty Workout' }).click()
})
