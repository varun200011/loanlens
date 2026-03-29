import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = `qa_${Date.now()}@loanlens-test.com`
const TEST_PASS = 'TestPass123!'

test.describe('LoanLens E2E — Full User Journey', () => {

  test('Registration flow — new user can register and land on dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`)
    await page.fill('[placeholder="Varun Nataraj"]', 'QA Test User')
    await page.fill('[type="email"]', TEST_EMAIL)
    await page.fill('[type="password"]', TEST_PASS)
    await page.fill('[placeholder="75000"]', '80000')
    await page.fill('[placeholder="30000"]', '25000')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(`${BASE_URL}/`, { timeout: 5000 })
    await expect(page.locator('.page-title')).toContainText('Welcome back')
  })

  test('Add loan — user can add a home loan and see it in list', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('[type="email"]', TEST_EMAIL)
    await page.fill('[type="password"]', TEST_PASS)
    await page.click('button[type="submit"]')
    await page.goto(`${BASE_URL}/loans`)

    await page.click('button:has-text("Add Loan")')
    await page.selectOption('select', 'HOME')
    await page.fill('[placeholder="500000"]', '3000000')
    await page.fill('[placeholder="8.5"]', '8.5')
    await page.fill('[placeholder="240"]', '240')
    await page.fill('[type="date"]', '2023-01-01')
    await page.fill('[placeholder="HDFC Bank"]', 'SBI')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=HOME')).toBeVisible({ timeout: 5000 })
  })

  test('Stress test — run income drop simulation and see result', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('[type="email"]', TEST_EMAIL)
    await page.fill('[type="password"]', TEST_PASS)
    await page.click('button[type="submit"]')
    await page.goto(`${BASE_URL}/stress`)

    await page.click('button:has-text("Income Drop")')
    await page.click('button:has-text("Run Simulation")')

    await expect(page.locator('text=Simulation Result')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('.badge')).toBeVisible()
  })

  test('Affordability page — score and insights are visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('[type="email"]', TEST_EMAIL)
    await page.fill('[type="password"]', TEST_PASS)
    await page.click('button[type="submit"]')
    await page.goto(`${BASE_URL}/affordability`)

    await expect(page.locator('text=Affordability Score')).toBeVisible()
  })

  test('Logout — user is redirected to login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('[type="email"]', TEST_EMAIL)
    await page.fill('[type="password"]', TEST_PASS)
    await page.click('button[type="submit"]')
    await page.click('button:has-text("Sign out")')
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })
})
