// @vitest-environment node
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'

const projectId = 'handout-ci'
let testEnv

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    storage: {
      rules: readFileSync(resolve(process.cwd(), 'tests/rules/storageEmulatorBaseline.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 9199,
    },
  })
})

afterEach(async () => {
  await testEnv.clearStorage()
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('Storage Emulator baseline', () => {
  it('accepts an authenticated upload with a permissive rule', async () => {
    const storage = testEnv.authenticatedContext('baseline-user').storage()
    await expect(assertSucceeds(storage.ref('baseline/check.txt').putString('Storage rules baseline'))).resolves.toBeDefined()
  })
})
