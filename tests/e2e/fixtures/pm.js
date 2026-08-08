import { expect, test as base } from '@playwright/test'

const required = ['E2E_PM_EMAIL', 'E2E_PM_PASSWORD']

export const hasPmCredentials = () => required.every((name) => Boolean(process.env[name]))

export const test = base.extend({
  pmPage: async ({ page }, use) => {
    test.skip(!hasPmCredentials(), 'Set E2E_PM_EMAIL and E2E_PM_PASSWORD for an emulator or isolated staging PM.')

    await page.goto('/public/login')
    await page.getByTestId('pm-login-email').locator('input').fill(process.env.E2E_PM_EMAIL)
    await page.getByTestId('pm-login-password').locator('input').fill(process.env.E2E_PM_PASSWORD)
    await page.getByTestId('pm-login-submit').click()
    await expect(page).not.toHaveURL(/\/public\/login/)
    await use(page)
  },
})

export { expect }
