// @vitest-environment node
import { expect, it } from 'vitest'
import { readInventory, storeInventory } from '../../../backend/inventoryStorage.js'

it('round trips signature coordinates and audit evidence without mutating the signed state', () => {
  const state = { revision: 3, batch: { version: 1, digest: 'same-digest', signatures: {
    tenant: { name: 'Tenant', captured_by: 'pm', capture_method: 'in_person', digest: 'same-digest', strokes: [[[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]] },
  } } }
  const original = structuredClone(state)
  const stored = storeInventory(state)
  expect(typeof stored.batch.signatures.tenant.strokes_json).toBe('string')
  expect(readInventory(stored)).toEqual(original)
  expect(state).toEqual(original)
  expect(readInventory(original)).toEqual(original)
})

it('preserves drafts without a batch and fails closed for damaged stored signatures', () => {
  expect(readInventory(storeInventory({ batch: null }))).toEqual({ batch: null })
  expect(() => readInventory({ batch: { signatures: { pm: { strokes_json: 'corrupted' } } } })).toThrow()
})
