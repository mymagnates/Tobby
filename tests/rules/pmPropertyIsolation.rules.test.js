// @vitest-environment node
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  emulatorPropertyFixture,
  seedPropertyAccessFixture,
} from '../fixtures/emulatorPropertyAccess.js'

const projectId = 'handout-ci'
let testEnv

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8') },
    storage: {
      rules: readFileSync(resolve(process.cwd(), 'storage.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 9199,
    },
  })
})

afterEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.clearStorage()
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('PM property isolation', () => {
  it('allows PM A to read and write only PM A property data', async () => {
    await seedPropertyAccessFixture(testEnv)
    const { users, properties } = emulatorPropertyFixture
    const pmA = testEnv.authenticatedContext(users.pmA).firestore()

    await assertSucceeds(getDoc(doc(pmA, 'properties', properties.pmA)))
    await assertSucceeds(
      setDoc(doc(pmA, 'properties', properties.pmA, 'mxrecords', 'record-a'), {
        description: 'PM A maintenance record',
      }),
    )
    await assertFails(getDoc(doc(pmA, 'properties', properties.pmB)))
    await assertFails(
      setDoc(doc(pmA, 'properties', properties.pmB, 'mxrecords', 'record-b'), {
        description: 'PM A must not write PM B data',
      }),
    )
  })

  it('denies PM A attempts to alter PM B or promote itself on Property A', async () => {
    await seedPropertyAccessFixture(testEnv)
    const { users, properties } = emulatorPropertyFixture
    const pmA = testEnv.authenticatedContext(users.pmA).firestore()

    await assertFails(
      setDoc(doc(pmA, 'properties', properties.pmB), { nickname: 'compromised' }, { merge: true }),
    )
    await assertFails(
      setDoc(
        doc(pmA, 'properties', properties.pmA),
        {
          owner_user_ids: [users.pmA],
          primary_owner_user_id: users.pmA,
        },
        { merge: true },
      ),
    )
  })

  it('allows a view-only member to read but not change property records', async () => {
    await seedPropertyAccessFixture(testEnv)
    const { users, properties } = emulatorPropertyFixture
    const viewer = testEnv.authenticatedContext(users.viewer).firestore()

    await assertSucceeds(getDoc(doc(viewer, 'properties', properties.pmA)))
    await assertFails(
      setDoc(doc(viewer, 'properties', properties.pmA, 'mxrecords', 'viewer-write'), {
        description: 'A view-only member cannot write.',
      }),
    )
    await assertFails(getDoc(doc(viewer, 'properties', properties.pmB)))
  })

  it('requires server-signed uploads for property Storage paths', async () => {
    await seedPropertyAccessFixture(testEnv)
    const { users, properties } = emulatorPropertyFixture
    const storage = testEnv.authenticatedContext(users.pmA).storage()
    const ownedFile = storage.ref(`properties/${properties.pmA}/documents/pm-a.txt`)
    const foreignFile = storage.ref(`properties/${properties.pmB}/documents/pm-b.txt`)

    await assertFails(ownedFile.putString('PM A document'))
    await assertFails(foreignFile.putString('PM A must not write PM B data'))
  })
})
