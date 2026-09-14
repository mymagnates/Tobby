// @vitest-environment node
import { beforeEach, expect, it } from 'vitest'
import { createInventoryService } from '../../../backend/inventoryService.js'

let records, service
function assertFirestoreValue(value) {
  if (Array.isArray(value)) {
    if (value.some(Array.isArray)) throw new Error('Nested arrays are not supported by Firestore Standard')
    value.forEach(assertFirestoreValue)
  } else if (value && typeof value === 'object') Object.values(value).forEach(assertFirestoreValue)
}
const ctx = (body = {}, uid = 'pm') => ({ verified: true, actor: { id: uid }, params: { leaseId: 'l1' }, body })
beforeEach(() => {
  records = new Map([
    ['leases/l1', { property_id: 'p1', tenant_id: 'tt' }],
    ['users/tt', { lease_id: 'l1' }],
    ['users/pm/roles/p1', { property_id: 'p1', role: 'pm' }],
    ['leases/l1/inventories/primary', { custom_items: [{ item: 'Fridge' }] }],
  ])
  const snap = (path) => ({ id: path.split('/').at(-1), exists: records.has(path), data: () => structuredClone(records.get(path)) })
  const doc = (path) => ({ path, get: async () => snap(path), collection: (child) => collection(`${path}/${child}`) })
  const collection = (path, filters = []) => ({
    where: (key, op, value) => collection(path, [...filters, [key, value]]),
    doc: (id) => doc(`${path}/${id}`),
    get: async () => ({ docs: [...records.keys()].filter((p) => p.split('/').slice(0, -1).join('/') === path && filters.every(([key, value]) => records.get(p)[key] === value)).map(snap) }),
  })
  service = createInventoryService({ getDb: () => ({ collection, runTransaction: async (fn) => {
    const writes = []
    const result = await fn({ get: (ref) => ref.get(), set: (ref, value) => {
      assertFirestoreValue(value)
      writes.push([ref.path, structuredClone(value)])
    } })
    writes.forEach(([key, value]) => records.set(key, value))
    return result
  } }) })
})
it('rejects unverified users, viewers and unrelated tenants', async () => {
  await expect(service.get({ ...ctx(), verified: false })).rejects.toMatchObject({ status: 401 })
  for (const uid of ['viewer', 'stranger']) await expect(service.get(ctx({}, uid))).rejects.toMatchObject({ status: 403 })
})
it('initializes once and preserves the original unsigned legacy record', async () => {
  expect(await service.get(ctx())).toEqual({ inventory: null })
  const result = await service.command(ctx({ type: 'initialize' }))
  expect(result.inventory.items[0].name).toBe('Fridge')
  expect(result.inventory.items[0].baseline).toBeNull()
  expect(await service.command(ctx({ type: 'initialize' }))).toEqual(result)
  expect(records.get('leases/l1/inventories/primary').custom_items).toHaveLength(1)
})
it('blocks stale writes and revocation without modifying the list', async () => {
  await service.command(ctx({ type: 'initialize' }))
  await expect(service.command(ctx({ type: 'start', stage: 'move_in', expected_revision: 9 }))).rejects.toMatchObject({ status: 409 })
  expect(records.get('leases/l1/inventories/workflow').revision).toBe(0)
  records.delete('users/pm/roles/p1')
  await expect(service.command(ctx({ type: 'start', stage: 'move_in', expected_revision: 0 }))).rejects.toMatchObject({ status: 403 })
})
it('does not expose the previous inventory to a replacement tenant', async () => {
  await service.command(ctx({ type: 'initialize' }))
  records.get('leases/l1').tenant_id = 'replacement'
  records.set('users/replacement', { lease_id: 'l1' })
  await expect(service.get(ctx({}, 'replacement'))).rejects.toMatchObject({ status: 409 })
  await expect(service.history(ctx({}, 'tt'))).rejects.toMatchObject({ status: 403 })
})
it('persists confirmed history atomically after both signatures', async () => {
  let state = (await service.command(ctx({ type: 'initialize' }))).inventory
  const command = async (body, uid = 'pm') => {
    state = (await service.command(ctx({ expected_revision: state.revision, ...body }, uid))).inventory
  }
  await command({ type: 'start', stage: 'move_in' })
  await command({ type: 'save_item', item_id: 'legacy-0', entry: { name: 'Fridge', condition: 'good', photos: [] } })
  await command({ type: 'save_item', entry: { name: 'Window', condition: 'good', photos: [] } })
  const signature = [[[0.1, 0.2], [0.4, 0.5], [0.8, 0.9]]]
  await command({ type: 'sign', batch_version: state.batch.version, signature })
  expect(records.get('leases/l1/inventories/workflow').batch.signatures.pm.strokes).toBeUndefined()
  expect(JSON.parse(records.get('leases/l1/inventories/workflow').batch.signatures.pm.strokes_json)).toEqual(signature)
  expect((await service.get(ctx())).inventory.batch.signatures.pm.strokes).toEqual(signature)
  expect((await service.history(ctx())).items).toHaveLength(0)
  await command({ type: 'sign', batch_version: state.batch.version, signature }, 'tt')
  expect((await service.history(ctx())).items[0].status).toBe('confirmed')
  expect((await service.history(ctx())).items[0].signatures.tenant.strokes).toEqual(signature)
})

it('resolves a tenant profile ID to its accepted account automatically', async () => {
  records.get('leases/l1').tenant_id = 'profile1'
  records.set('tenants/profile1', { lease_id: 'l1', property_id: 'p1', account_user_id: 'tt', personal_info: { first_name: 'Taylor' } })
  const result = await service.command(ctx({ type: 'initialize' }))
  expect(result.inventory.context).toMatchObject({ tenant_user_id: 'tt', tenant_name: 'Taylor' })
  expect((await service.get(ctx({}, 'tt'))).inventory).toBeTruthy()
  await expect(service.get(ctx({}, 'profile1'))).rejects.toMatchObject({ status: 403 })
})

it('automatically refreshes an initially vacant tenant slot on read', async () => {
  records.get('leases/l1').tenant_id = null
  await service.command(ctx({ type: 'initialize' }))
  records.set('tenants/profile1', { lease_id: 'l1', property_id: 'p1', personal_info: { first_name: 'Taylor' } })
  expect((await service.get(ctx())).inventory.context).toMatchObject({ tenant_user_id: null, tenant_name: 'Taylor' })
  records.get('tenants/profile1').account_user_id = 'tt'
  expect((await service.get(ctx())).inventory.context.tenant_user_id).toBe('tt')
})

it('does not guess the primary tenant when multiple tenants are present', async () => {
  records.get('leases/l1').tenant_id = null
  for (const id of ['a', 'b']) records.set(`tenants/${id}`, { lease_id: 'l1', property_id: 'p1', account_user_id: id })
  expect((await service.command(ctx({ type: 'initialize' }))).inventory.context.tenant_user_id).toBeNull()
})

it('allows a lease tenant without an account to sign on the PM device with an honest audit trail', async () => {
  records.get('leases/l1').tenant_id = null
  records.set('tenants/profile1', { lease_id: 'l1', property_id: 'p1', personal_info: { first_name: 'Taylor' } })
  let state = (await service.command(ctx({ type: 'initialize' }))).inventory
  const command = async body => {
    state = (await service.command(ctx({ expected_revision: state.revision, ...body }))).inventory
  }
  await command({ type: 'start', stage: 'inspection', scope: 'list' })
  const signature = [[[0.1, 0.2], [0.4, 0.5], [0.8, 0.9]]]
  const sign = { type: 'sign', batch_version: state.batch.version, signature }
  await expect(command({ ...sign, signer_role: 'tenant' })).rejects.toThrow('in person')
  await command({ ...sign, signer_role: 'tenant', capture_method: 'in_person' })
  expect(state.batch.signatures.tenant).toMatchObject({ user_id: null, tenant_profile_id: 'profile1', name: 'Taylor', captured_by: 'pm', capture_method: 'in_person' })
  const digest = state.batch.digest
  records.get('tenants/profile1').account_user_id = 'tt'
  records.get('leases/l1').tenant_id = 'tt'
  await command(sign)
  expect(state.batch.status).toBe('confirmed')
  expect(state.batch.signatures.pm.digest).toBe(digest)
  expect(state.batch.signatures.tenant.digest).toBe(digest)
  expect((await service.history(ctx())).items[0].signatures.tenant.captured_by).toBe('pm')
})

it('rejects tenant impersonation of the PM and tenants from other leases', async () => {
  let state = (await service.command(ctx({ type: 'initialize' }))).inventory
  state = (await service.command(ctx({ type: 'start', stage: 'inspection', scope: 'list', expected_revision: state.revision }))).inventory
  await expect(service.command(ctx({ type: 'sign', signer_role: 'pm', capture_method: 'in_person', expected_revision: state.revision }, 'tt'))).rejects.toMatchObject({ status: 403 })
  records.get('leases/l1').tenant_id = 'wrong'
  records.set('tenants/wrong', { lease_id: 'other', property_id: 'p1' })
  await expect(service.command(ctx({ type: 'sign', signer_role: 'tenant', capture_method: 'in_person', expected_revision: state.revision }))).rejects.toMatchObject({ status: 409 })
})
