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
function accessDraft(quantity = 2) {
  let state = createInventoryWorkflow(null, context, now)
  state = change(state, { type: 'start', stage: 'move_in' })
  return change(state, { type: 'save_item', new_item_id: 'keys', entry: { name: 'Door keys', kind: 'access', quantity, condition: 'good' } })
}
function accessMoveOut(scope = 'move_out') {
  return change(sign(sign(accessDraft(), pm), tenant), { type: 'start', stage: 'move_out', scope })
}
describe('lease inventory bilateral workflow', () => {
  it.each([0, 1, 999])('preserves valid access quantity %s in bilateral snapshots', quantity => {
    const state = sign(sign(accessDraft(quantity), pm), tenant)
    expect(state.items[0]).toMatchObject({ kind: 'access', latest: { kind: 'access', quantity }, baseline: { kind: 'access', quantity } })
    expect(state.batch.entries[0]).toMatchObject({ kind: 'access', quantity })
    const list = change(state, { type: 'start', stage: 'inspection', scope: 'list' })
    expect(list.batch.entries[0]).toMatchObject({ kind: 'access', quantity })
    const inspection = change(state, { type: 'start', stage: 'inspection' })
    expect(change(inspection, { type: 'prepare_list' }).batch.entries[0]).toMatchObject({ kind: 'access', quantity })
  })

  it.each([undefined, null, -1, 1000, 1.5, '2', '', true, NaN, Infinity])('rejects invalid access quantity %s on save', quantity => {
    expect(() => accessDraft(quantity === undefined ? null : quantity)).toThrow('quantity')
    const state = accessDraft()
    expect(() => change(state, { type: 'save_item', item_id: 'keys', entry: { condition: 'good', quantity } })).toThrow('quantity')
  })

  it('defaults ordinary items and rejects unknown kinds or access downgrades', () => {
    expect(draft().batch.entries[0].kind).toBe('item')
    expect(() => change(draft(), { type: 'save_item', item_id: 'fridge', entry: { kind: 'key', condition: 'good' } })).toThrow('kind')
    for (const state of [accessDraft(), accessMoveOut()]) {
      expect(() => change(state, { type: 'save_item', item_id: 'keys', entry: { kind: 'item', condition: 'good' } })).toThrow('cannot be changed')
      expect(change(state, { type: 'save_item', item_id: 'keys', entry: { quantity: 0, condition: 'good' } }).batch.entries[0]).toMatchObject({ kind: 'access', quantity: 0 })
    }
  })

  it('retains access kind from a reference even when older item metadata omits it', () => {
    const state = accessMoveOut()
    delete state.items[0].kind
    delete state.items[0].latest.kind
    delete state.items[0].baseline.kind
    delete state.batch.entries[0].kind
    expect(change(state, { type: 'save_item', item_id: 'keys', entry: { condition: 'good' } }).batch.entries[0]).toMatchObject({ kind: 'access', quantity: null })
    expect(() => change(state, { type: 'save_item', item_id: 'keys', entry: { kind: 'item', condition: 'good', quantity: 1 } })).toThrow('cannot be changed')
    expect(change(state, { type: 'save_item', item_id: 'keys', entry: { condition: 'good', quantity: 1 } }).batch.entries[0].kind).toBe('access')
  })

  it('keeps reference quantities immutable and requires independently entered actual quantities', () => {
    let state = accessMoveOut()
    const original = structuredClone(state)
    expect(state.batch.entries[0]).toMatchObject({ kind: 'access', quantity: null, reference: { kind: 'access', quantity: 2 }, move_in: { kind: 'access', quantity: 2 } })
    state = change(state, { type: 'use_reference', item_id: 'keys' })
    expect(state.batch.entries[0].quantity).toBeNull()
    expect(() => change(state, { type: 'review_item', item_id: 'keys' })).toThrow('quantity')
    state = change(state, { type: 'save_item', item_id: 'keys', entry: { condition: 'good', quantity: 0, reference: { quantity: 99 }, move_in: { quantity: 99 }, checked: true } })
    expect(state.batch.entries[0].checked).toBe(false)
    expect(state.batch.entries[0].reference).toEqual(original.batch.entries[0].reference)
    expect(state.batch.entries[0].move_in).toEqual(original.batch.entries[0].move_in)
    expect(() => sign(state, pm)).toThrow('Review every item')
    state = change(state, { type: 'review_item', item_id: 'keys' })
    state = sign(sign(state, pm), tenant)
    expect(state.items[0].latest).toMatchObject({ kind: 'access', quantity: 0 })
    expect(state.items[0].baseline).toEqual(original.items[0].baseline)
    state = change(state, { type: 'start', stage: 'move_out', scope: 'move_out' })
    expect(state.batch.entries[0]).toMatchObject({ quantity: null, reference: { quantity: 2 }, move_in: { quantity: 2 } })
  })

  it.each([null, 'ignored', -1])('ignores ordinary item quantity %s sent by the frontend', quantity => {
    for (const state of [draft(), change(confirmed(), { type: 'start', stage: 'move_out', scope: 'move_out' })]) {
      const saved = change(state, { type: 'save_item', item_id: 'fridge', entry: { kind: 'item', condition: 'good', quantity } })
      expect(saved.batch.entries[0].kind).toBe('item')
      expect(saved.batch.entries[0]).not.toHaveProperty('quantity')
    }
  })

  it.each([null, undefined])('allows condition-first move-out access drafts with quantity %s', quantity => {
    for (const scope of ['move_out', 'check']) {
      let state = accessMoveOut(scope)
      state = change(state, { type: 'save_item', item_id: 'keys', entry: { condition: 'good', quantity } })
      expect(state.batch.entries[0]).toMatchObject({ kind: 'access', quantity: null, reference: { quantity: 2 } })
      if (scope === 'move_out') {
        expect(() => change(state, { type: 'review_item', item_id: 'keys' })).toThrow('quantity')
        state.batch.entries[0].checked = true
      }
      expect(() => sign(state, pm)).toThrow('quantity')
      state = change(state, { type: 'save_item', item_id: 'keys', entry: { condition: 'good', quantity: 0 } })
      if (scope === 'move_out') state = change(state, { type: 'review_item', item_id: 'keys' })
      expect(sign(sign(state, pm), tenant).items[0].latest.quantity).toBe(0)
    }
  })

  it.each([-1, 1000, 0.5, '0', '', false, NaN, Infinity])('rejects non-null invalid move-out draft quantity %s', quantity => {
    expect(() => change(accessMoveOut(), { type: 'save_item', item_id: 'keys', entry: { condition: 'good', quantity } })).toThrow('quantity')
  })

  it.each([undefined, null, -1, 1000, 0.5, '0'])('revalidates actual quantity %s at review and signing', quantity => {
    const state = accessMoveOut()
    Object.assign(state.batch.entries[0], { condition: 'good', checked: true, quantity })
    expect(() => change(state, { type: 'review_item', item_id: 'keys' })).toThrow('quantity')
    expect(() => sign(state, pm)).toThrow('quantity')
    expect(change(state, { type: 'review_item', item_id: 'keys', checked: false }).batch.entries[0].checked).toBe(false)
  })

  it('requires quantities when signing lists and prevents older move-out paths from bypassing actual input', () => {
    let state = accessDraft()
    state.batch.scope = 'list'
    delete state.batch.entries[0].quantity
    expect(() => sign(state, pm)).toThrow('quantity')
    state = accessMoveOut('check')
    expect(state.batch.entries[0].quantity).toBeNull()
    expect(() => change(state, { type: 'unchanged', item_ids: ['keys'] })).toThrow('actual move-out')
    expect(() => change(state, { type: 'prepare_list' })).toThrow('move-out')
    expect(() => change(state, { type: 'request_close', item_id: 'keys', reason: 'Missing' })).toThrow('move-out')
    expect(() => change(confirmed(), { type: 'start', stage: 'move_out', scope: 'list' })).toThrow('item checks')
    state = change(state, { type: 'save_item', item_id: 'keys', entry: { condition: 'missing', quantity: 0 } })
    expect(sign(sign(state, pm), tenant).batch.status).toBe('confirmed')
  })

  it('keeps legacy keys reference-only and supports new access items without a signed baseline', () => {
    const legacy = { ktcs_items: { front_door: { keys: 2 } } }
    let state = createInventoryWorkflow(legacy, context, now)
    expect(state.items).toEqual([])
    state = change(state, { type: 'start', stage: 'move_out', scope: 'move_out' })
    expect(state.batch.entries).toEqual([])
    state = change(state, { type: 'save_item', new_item_id: 'remote', entry: { name: 'Remote', kind: 'access', quantity: 1, condition: 'good' } })
    expect(state.batch.entries[0]).toMatchObject({ kind: 'access', quantity: 1, reference: null, move_in: null, checked: false })
    state = change(state, { type: 'review_item', item_id: 'remote' })
    state = sign(sign(state, pm), tenant)
    expect(state.items[0].baseline).toBeNull()
    expect(state.move_in_confirmed).toBeUndefined()
    expect(state.legacy_keys).toEqual(legacy.ktcs_items)
  })

  it('clears replacement links on explicit null rather than preserving the previous link', () => {
    let state = change(confirmed(), { type: 'start', stage: 'move_out', scope: 'move_out' })
    state = change(state, { type: 'save_item', new_item_id: 'replacement', entry: { name: 'New fridge', condition: 'good', replaces_item_id: 'fridge' } })
    const linked = state
    state = change(state, { type: 'save_item', item_id: 'replacement', entry: { condition: 'good', replaces_item_id: null } })
    expect(state.batch.entries[1]).not.toHaveProperty('replaces_item_id')
    expect(linked.batch.entries[1].replaces_item_id).toBe('fridge')
    state = change(state, { type: 'save_item', item_id: 'replacement', entry: { condition: 'good', note: 'Still unlinked' } })
    expect(state.batch.entries[1]).not.toHaveProperty('replaces_item_id')
  })

  it('preserves omitted replacement links and clears checking metadata on uncheck', () => {
    let state = change(confirmed(), { type: 'start', stage: 'move_out', scope: 'move_out' })
    state = change(state, { type: 'save_item', new_item_id: 'replacement', entry: { name: 'New fridge', condition: 'good', replaces_item_id: 'fridge' } })
    state = change(state, { type: 'save_item', item_id: 'replacement', entry: { condition: 'good', note: 'Updated' } })
    expect(state.batch.entries[1].replaces_item_id).toBe('fridge')
    state = change(state, { type: 'review_item', item_id: 'replacement' })
    state = change(state, { type: 'review_item', item_id: 'replacement', checked: false })
    expect(state.batch.entries[1].checked_by).toBeUndefined()
    expect(state.batch.entries[1].checked_at).toBeUndefined()
  })

  it('starts a move-out comparison with immutable references, blank evidence and explicit checks', () => {
    const initial = confirmed()
    let state = change(initial, { type: 'start', stage: 'move_out', scope: 'move_out' })
    const entry = state.batch.entries[0]
    expect(entry).toMatchObject({ reference: { condition: 'good' }, move_in: { condition: 'good' }, condition: 'not_checked', photos: [], note: '', checked: false, added_at_move_out: false })
    expect(() => sign(state, pm)).toThrow('Review every item')
    state = change(state, { type: 'use_reference', item_id: 'fridge' })
    expect(state.batch.entries[0].checked).toBe(false)
    expect(() => sign(state, pm)).toThrow('Review every item')
    expect(() => change(state, { type: 'prepare_list' })).toThrow('move-out')
    expect(() => change(state, { type: 'unchanged', item_ids: ['fridge'] })).toThrow('explicitly')
    state = change(state, { type: 'review_item', item_id: 'fridge', checked: true })
    state = sign(state, pm)
    const signedVersion = state.batch.version
    state = change(state, { type: 'save_item', item_id: 'fridge', entry: { ...state.batch.entries[0], condition: 'damaged', checked: true } }, tenant)
    expect(state.batch.version).toBe(signedVersion + 1)
    expect(state.batch.signatures).toEqual({})
    expect(state.batch.entries[0].checked).toBe(false)
    state = change(state, { type: 'review_item', item_id: 'fridge', checked: true }, tenant)
    state = sign(sign(state, pm), tenant)
    expect(state.batch.status).toBe('confirmed')
    expect(state.items[0].baseline).toEqual(initial.items[0].baseline)
    expect(state.items[0].latest.condition).toBe('damaged')
  })

  it('supports no-baseline leases and newly discovered items without fabricating move-in evidence', () => {
    let state = createInventoryWorkflow({ custom_items: [{ item: 'Old key' }] }, context, now)
    state = change(state, { type: 'start', stage: 'move_out', scope: 'move_out' })
    expect(state.batch.missing_move_in).toBe(true)
    expect(state.batch.entries[0].added_at_move_out).toBe(false)
    state = change(state, { type: 'save_item', new_item_id: 'remote', entry: { name: 'Remote', area: ' Living Room ', condition: 'good', replaces_item_id: 'legacy-0' } })
    const added = state.batch.entries.find(entry => entry.item_id === 'remote')
    expect(added).toMatchObject({ area: 'Living Room', reference: null, move_in: null, added_at_move_out: true, replaces_item_id: 'legacy-0', checked: false })
    state = change(state, { type: 'save_item', item_id: 'legacy-0', entry: { name: 'Old key', area: 'living room', condition: 'missing' } })
    expect(state.batch.entries[0].area).toBe('Living Room')
    for (const id of ['remote', 'legacy-0']) state = change(state, { type: 'review_item', item_id: id, checked: true })
    state = sign(sign(state, pm), tenant)
    expect(state.items.every(item => item.baseline === null)).toBe(true)
    expect(state.move_in_confirmed).toBeUndefined()
  })

  it('does not overwrite an unfinished draft or allow incomplete or foreign item checks', () => {
    expect(() => change(draft(), { type: 'start', stage: 'move_out', scope: 'move_out' })).toThrow('existing check')
    const state = change(confirmed(), { type: 'start', stage: 'move_out', scope: 'move_out' })
    expect(() => change(state, { type: 'review_item', item_id: 'fridge' })).toThrow('condition')
    expect(() => change(state, { type: 'review_item', item_id: 'unknown' })).toThrow('Item not found')
    expect(() => change(state, { type: 'save_item', new_item_id: 'new', entry: { name: 'Replacement', condition: 'good', replaces_item_id: 'unknown' } })).toThrow('existing item')
  })

  it('lets both parties add items and sign once for the complete list without item checks', () => {
    let state = createInventoryWorkflow(null, context, now)
    state = change(state, { type: 'start', stage: 'inspection', scope: 'list' })
    state = change(state, { type: 'save_item', new_item_id: 'pm-item', entry: { name: 'Window', condition: 'not_checked' } })
    state = change(state, { type: 'save_item', new_item_id: 'tenant-item', entry: { name: 'Door', condition: 'not_checked' } }, tenant)
    state = sign(state, pm)
    expect(state.batch.status).toBe('awaiting_confirmation')
    state = sign(state, tenant)
    expect(state.batch.status).toBe('confirmed')
    expect(state.batch.entries).toHaveLength(2)
    expect(Object.keys(state.batch.signatures)).toEqual(['pm', 'tenant'])
  })
  it('includes the whole prior list in a new revision and invalidates signatures after edits', () => {
    let state = change(confirmed(), { type: 'start', stage: 'inspection', scope: 'list' })
    expect(state.batch.entries).toHaveLength(state.items.length)
    state = sign(state, pm)
    state = change(state, { type: 'save_item', new_item_id: 'extra', entry: { name: 'Door', condition: 'not_checked' } }, tenant)
    expect(state.batch.signatures).toEqual({})
    expect(state.batch.version).toBe(2)
    expect(state.items[0].baseline).toBeTruthy()
  })
  it('cannot sign a list that omits an active item', () => {
    let state = change(confirmed(), { type: 'start', stage: 'inspection', scope: 'list' })
    state.batch.entries = []
    expect(() => sign(state, pm)).toThrow('complete list')
  })
  it('does not treat migrated legacy records as signed evidence', () => {
    const state = createInventoryWorkflow(
      { custom_items: [{ item: 'Fridge', move_in_comment: 'Good' }], ktcs_items: { front_door: { keys: 2 } } },
      context,
      now,
    )
    expect(state.items[0].baseline).toBeNull()
    expect(state.items[0].legacy.move_in_comment).toBe('Good')
    expect(state.legacy_keys.front_door.keys).toBe(2)
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
    expect(() => sign(state, pm)).toThrow('Add a tenant to this lease')
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
