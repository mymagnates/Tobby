import { expect, test } from '../fixtures/pm'

const runId = `e2e-${Date.now()}`

test.describe('PM critical path', () => {
  test('PM signs in, creates a property, and retrieves it after reload', async ({ pmPage }) => {
    await pmPage.goto('/create-property')
    await pmPage.getByTestId('property-address-input').locator('input').fill(`E2E ${runId} Main St`)
    await pmPage.getByTestId('property-nickname-input').locator('input').fill(`E2E ${runId}`)
    await pmPage.getByTestId('property-city-input').locator('input').fill('Austin')
    await pmPage.getByTestId('property-state-input').locator('input').fill('TX')
    await pmPage.getByTestId('property-zip-input').locator('input').fill('78701')

    // Quasar selects render their actual input inside the test-id root.
    await pmPage.getByTestId('property-type-select').click()
    await pmPage.getByRole('option').first().click()
    await pmPage.getByTestId('property-status-select').click()
    await pmPage.getByRole('option').first().click()
    await pmPage.getByTestId('property-ownership-mode-select').click()
    await pmPage.getByRole('option').first().click()
    await pmPage.getByTestId('create-property-form').locator('button[type="submit"]').click()

    await pmPage.goto('/my-properties')
    await pmPage.reload()
    await expect(pmPage.getByText(`E2E ${runId}`, { exact: true })).toBeVisible()
  })

  test('PM creates a maintenance record with an emulator or staging fixture file', async ({ pmPage }) => {
    test.skip(!process.env.E2E_PROPERTY_ID, 'Set E2E_PROPERTY_ID from isolated test fixtures.')
    await pmPage.goto(`/create-mxrecord/${process.env.E2E_PROPERTY_ID}`)
    await pmPage.getByTestId('maintenance-record-description').locator('textarea').fill(`E2E maintenance ${runId}`)
    await pmPage.getByTestId('maintenance-record-file-upload').locator('input[type="file"]').setInputFiles({
      name: 'e2e-maintenance.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL1UQAAAABJRU5ErkJggg==',
        'base64',
      ),
    })
    await pmPage.getByTestId('maintenance-record-save').click()
    await expect(pmPage).toHaveURL(/\/mx-records/)
    await expect(pmPage.getByText(`E2E maintenance ${runId}`, { exact: true })).toBeVisible()
  })

  test('PM sees quota information and can open the deletion confirmation flow', async ({ pmPage }) => {
    await pmPage.goto('/user-profile')
    await expect(pmPage.getByTestId('quota-ai-tokens')).toBeVisible()
    await expect(pmPage.getByTestId('quota-storage')).toBeVisible()
    await pmPage.getByTestId('request-account-deletion').click()
    await pmPage.getByTestId('account-deletion-confirm').locator('input').fill('DELETE')
    await expect(pmPage.getByTestId('account-deletion-submit')).toBeEnabled()
    // Do not submit: deletion submission is covered by the isolated API suite.
  })

  test.fixme('PM submits an in-app support ticket', async ({ pmPage }) => {
    // Current /contact-support.html is mailto-only. Enable once the PM web app exposes a ticket form.
    await pmPage.goto('/contact-support.html')
  })

  test('PM-only launch navigation does not expose publish-to-SP or bid actions', async ({ pmPage }) => {
    await pmPage.goto('/mx-records')
    await expect(pmPage.getByText(/publish to sp|republish to sp/i)).toHaveCount(0)
    await expect(pmPage.getByRole('link', { name: /bid/i })).toHaveCount(0)
  })
})
