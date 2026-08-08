import { expect, test } from '@playwright/test'

test.describe('staging public smoke @smoke', () => {
  for (const path of ['/landing', '/privacy', '/terms', '/contact-support']) {
    test(`${path} loads without an SPA fallback error`, async ({ page }) => {
      const response = await page.goto(path)

      expect(response?.ok(), `${path} should return a successful response`).toBe(true)
      await expect(page.locator('body')).not.toContainText('404')
    })
  }
})
