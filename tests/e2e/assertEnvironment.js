import { URL } from 'node:url'

const mode = process.argv[2]
const allowedLocalHosts = new Set(['127.0.0.1', 'localhost'])
const baseURL = process.env.E2E_BASE_URL || process.env.STAGING_BASE_URL || 'http://127.0.0.1:9000'
const parsedBaseURL = new URL(baseURL)
const isLocal = allowedLocalHosts.has(parsedBaseURL.hostname)
const needsAuthenticatedFixture = mode === 'full'

if (!['full', 'smoke', 'lighthouse'].includes(mode)) {
  throw new Error('Usage: node tests/e2e/assertEnvironment.js <full|smoke|lighthouse>')
}

if (!isLocal) {
  if (process.env.E2E_ENV !== 'staging' || process.env.E2E_STAGING_CONFIRMATION !== 'isolated') {
    throw new Error(
      'Remote tests require E2E_ENV=staging and E2E_STAGING_CONFIRMATION=isolated. Never run against production.',
    )
  }
}

if (needsAuthenticatedFixture) {
  const missing = ['E2E_PM_EMAIL', 'E2E_PM_PASSWORD', 'E2E_PROPERTY_ID'].filter(
    (name) => !process.env[name],
  )

  if (missing.length > 0) {
    throw new Error(`PM E2E requires isolated fixtures: ${missing.join(', ')}`)
  }
}

process.stdout.write(`Validated ${mode} test target: ${parsedBaseURL.origin}\n`)
