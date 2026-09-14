import { describe, it, expect } from 'vitest'
import {
  applyInventoryCommand,
  createInventoryWorkflow,
} from '../../../backend/inventoryWorkflow.js'
const now = '2026-09-08T12:00:00.000Z'
const context = { property_id: 'p1', lease_id: 'l1', pm_user_id: 'pm1', tenant_user_id: 'tt1' }
const pm = { id: 'pm1', email: 'pm@example.test' },
  tenant = { id: 'tt1', email: 'tenant@example.test' }
const signature = [
  [
    [0.1, 0.2],
    [0.4, 0.5],
    [0.8, 0.3],
  ],
]
let sequence = 0
const change = (state, command, actor = pm) =>
  applyInventoryCommand(
    state,
    { expected_revision: state.revision, ...command },
    actor,
    now,
    `id-${++sequence}`,
  )
function draft() {
  let state = createInventoryWorkflow(null, context, now)
  state = change(state, { type: 'start', stage: 'move_in' })
  return change(state, {
    type: 'save_item',
    new_item_id: 'fridge',
    entry: { name: 'Fridge', area: 'Kitchen', condition: 'good', photos: [] },
  })
}
function sign(state, actor) {
  return change(state, { type: 'sign', batch_version: state.batch.version, signature }, actor)
}
function confirmed() {
  return sign(sign(draft(), pm), tenant)
}
describe('lease inventory bilateral workflow', () => {
  it('does not treat migrated legacy records as signed evidence', () => {
    const state = createInventoryWorkflow(
      { custom_items: [{ item: 'Fridge', move_in_comment: 'Good' }] },
      context,
      now,
    )
    expect(state.items[0].baseline).toBeNull()
    expect(state.items[0].legacy.move_in_comment).toBe('Good')
  })
  it('requires different participants and one signature from each', () => {
    const first = sign(draft(), pm)
    expect(first.batch.status).toBe('awaiting_confirmation')
    expect(first.items[0].latest).toBeNull()
    const second = sign(first, tenant)
    expect(second.batch.status).toBe('confirmed')
    expect(second.items[0].baseline.batch_id).toBe(second.batch.id)
    expect(second.batch.signatures.pm.digest).toBe(second.batch.signatures.tenant.digest)
  })
  it('rejects a co-tenant or unrelated manager', () => {
    expect(() => change(draft(), { type: 'save_item', entry: {} }, { id: 'other' })).toThrow(
      'Only the assigned PM',
    )
  })
  it('rejects stale saves instead of overwriting concurrent edits', () => {
    expect(() => change(draft(), { type: 'save_item', expected_revision: 0 })).toThrow(
      'This list changed',
    )
  })
  it('allows either participant to edit before agreement and invalidates the old signature', () => {
    const first = sign(draft(), pm)
    const edited = change(
      first,
      {
        type: 'save_item',
        item_id: 'fridge',
        entry: { name: 'Fridge', condition: 'damaged', photos: [] },
      },
      tenant,
    )
    expect(edited.batch.version).toBe(2)
    expect(edited.batch.signatures).toEqual({})
    expect(first.batch.signatures.pm).toBeDefined()
    expect(edited.batch.entries[0].condition).toBe('damaged')
  })
  it('keeps a closure request active until BOTH sign the same version', () => {
    let state = change(
      draft(),
      { type: 'request_close', item_id: 'fridge', reason: 'Duplicate' },
      tenant,
    )
    expect(state.items[0].closed).toBe(false)
    state = sign(state, tenant)
    expect(state.items[0].closed).toBe(false)
    state = sign(state, pm)
    expect(state.items[0].closed).toBe(true)
    expect(state.items[0].closed_batch_id).toBe(state.batch.id)
  })
  it('allows the other party to decline closure and retains the item', () => {
    let state = change(draft(), { type: 'request_close', item_id: 'fridge', reason: 'Duplicate' })
    state = sign(state, pm)
    state = change(state, { type: 'reject_close', item_id: 'fridge' }, tenant)
    expect(state.items[0].closed).toBe(false)
    expect(state.batch.entries[0].action).toBe('record')
    expect(state.batch.signatures).toEqual({})
  })
  it('only lets the requester withdraw their closure request', () => {
    const state = change(draft(), { type: 'request_close', item_id: 'fridge', reason: 'Duplicate' })
    expect(() => change(state, { type: 'withdraw_close', item_id: 'fridge' }, tenant)).toThrow(
      'Only the requester',
    )
    expect(
      change(state, { type: 'withdraw_close', item_id: 'fridge' }).batch.entries[0].action,
    ).toBe('record')
  })
  it('locks confirmed records and preserves the move-in baseline at move-out', () => {
    const initial = confirmed()
    expect(() => change(initial, { type: 'save_item', item_id: 'fridge', entry: {} })).toThrow(
      'Start a new check',
    )
    let state = change(initial, { type: 'start', stage: 'move_out' })
    expect(state.batch.entries[0].checked).toBe(false)
    expect(() => sign(state, pm)).toThrow('Review every item')
    state = change(state, {
      type: 'save_item',
      item_id: 'fridge',
      entry: { condition: 'damaged', note: 'Dent', photos: [] },
    })
    state = sign(sign(state, tenant), pm)
    expect(state.items[0].baseline.condition).toBe('good')
    expect(state.items[0].latest.condition).toBe('damaged')
    expect(initial.items[0].latest.condition).toBe('good')
  })
  it('includes inspection additions in the move-out check', () => {
    let state = change(confirmed(), { type: 'start', stage: 'inspection' })
    expect(state.batch.entries).toEqual([])
    state = change(state, {
      type: 'save_item',
      new_item_id: 'lamp',
      entry: { name: 'Lamp', condition: 'good', photos: [] },
    })
    state = sign(sign(state, pm), tenant)
    state = change(state, { type: 'start', stage: 'move_out' })
    expect(state.batch.entries.map((item) => item.item_id)).toEqual(['fridge', 'lamp'])
  })
  it('permits additional move-out items without inventing move-in evidence', () => {
    let state = change(confirmed(), { type: 'start', stage: 'move_out' })
    state = change(state, {
      type: 'save_item',
      new_item_id: 'desk',
      entry: { name: 'Desk', condition: 'good', photos: [] },
    })
    expect(state.items.find((item) => item.id === 'desk').baseline).toBeNull()
  })
  it('allows explicit batch selection of unchanged items, but not unsigned items', () => {
    let state = change(confirmed(), { type: 'start', stage: 'move_out' })
    state = change(state, { type: 'unchanged', item_ids: ['fridge'] })
    expect(state.batch.entries[0].checked).toBe(true)
    expect(state.batch.entries[0].unchanged_from).toBeTruthy()
    expect(() => change(draft(), { type: 'unchanged', item_ids: ['fridge'] })).toThrow(
      'previously confirmed',
    )
  })
  it('rejects missing tenant, forged image association and invalid signature', () => {
    const state = draft()
    state.context.tenant_user_id = ''
    expect(() => sign(state, pm)).toThrow('Assign the primary tenant')
    expect(() =>
      change(draft(), {
        type: 'save_item',
        item_id: 'fridge',
        entry: {
          condition: 'good',
          photos: [{ path: 'properties/other/photo', url: 'https://example.test/photo' }],
        },
      }),
    ).toThrow('Photo does not belong')
    expect(() =>
      change(draft(), { type: 'sign', batch_version: 1, signature: [[[2, 0]]] }),
    ).toThrow('Invalid signature')
  })
  it('does not allow signed content changes under an old batch version', () => {
    const state = sign(draft(), pm)
    expect(() => change(state, { type: 'sign', batch_version: 99, signature }, tenant)).toThrow(
      'batch version changed',
    )
  })
})
