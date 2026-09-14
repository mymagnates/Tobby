import { randomUUID } from 'node:crypto'
import { applyInventoryCommand, createInventoryWorkflow, inventoryParticipant } from './inventoryWorkflow.js'
import { readInventory, readInventoryBatch, storeInventory, storeInventoryBatch } from './inventoryStorage.js'

const fail = (status, code, message) => { throw Object.assign(new Error(message), { status, code }) }
const propertyId = (value) => typeof value === 'string' ? value : value?.id || ''
const activeTenant = row => !['inactive', 'archived', 'terminated'].includes(String(row.status || row.tenant_status || '').toLowerCase())

async function resolveLeaseTenant(tx, db, lease, leaseId, pid) {
  let record = null
  let account = null
  if (lease.tenant_id) {
    const direct = await tx.get(db.collection('tenants').doc(lease.tenant_id))
    if (direct.exists) {
      const data = direct.data()
      if (data.lease_id === leaseId && propertyId(data.property_id) === pid && activeTenant(data)) record = { ...data, profile_id: lease.tenant_id }
    } else {
      const user = await tx.get(db.collection('users').doc(lease.tenant_id))
      if (user.exists && user.data().lease_id === leaseId)
        account = { id: lease.tenant_id, name: lease.tenant_email || user.data().displayName || '' }
    }
  }
  if (!record) {
    const rows = await tx.get(db.collection('tenants').where('lease_id', '==', leaseId))
    const active = rows.docs.map(doc => ({ ...doc.data(), profile_id: doc.id })).filter(row => propertyId(row.property_id) === pid && activeTenant(row))
    const primary = active.filter(row => row.is_primary === true)
    const linked = active.filter(row => row.account_user_id === lease.tenant_id)
    record = linked.length === 1 ? linked[0] : primary.length === 1 ? primary[0] : active.length === 1 ? active[0] : null
  }
  if (!record && account) return account
  if (!record) return { id: null, name: lease.tenant_email || '' }
  return { id: record.account_user_id || null, profile_id: record.profile_id,
    name: [record.personal_info?.first_name, record.personal_info?.last_name].filter(Boolean).join(' ') || record.personal_info?.email || '' }
}

export function createInventoryService({ getDb }) {
  async function execute({ actor, verified, params, body }, operation) {
    if (!verified || !actor?.id) fail(401, 'AUTH_REQUIRED', 'Please sign in.')
    let leaseId = params.leaseId
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(leaseId || '')) fail(400, 'INVALID_LEASE', 'Invalid lease.')
    const db = getDb()
    const requested = await db.collection('leases').doc(leaseId).get()
    const sourceId = requested.data()?.inventory_source_lease_id
    if (sourceId && sourceId !== leaseId) {
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(sourceId)) fail(409, 'INVALID_INVENTORY_SOURCE', 'The inventory source needs review.')
      const source = await db.collection('leases').doc(sourceId).get()
      if (!source.exists || propertyId(source.data().property_string_id || source.data().property_id) !== propertyId(requested.data().property_string_id || requested.data().property_id)) fail(403, 'PERMISSION_DENIED', 'Inventory source does not belong to this property.')
      leaseId = sourceId
    }
    const leaseRef = db.collection('leases').doc(leaseId)
    const stateRef = leaseRef.collection('inventories').doc('workflow')
    const historyRef = stateRef.collection('history')
    const now = new Date().toISOString()
    const commandId = randomUUID()
    return db.runTransaction(async (tx) => {
      const leaseSnap = await tx.get(leaseRef)
      if (!leaseSnap.exists) fail(404, 'LEASE_NOT_FOUND', 'Lease not found.')
      const lease = leaseSnap.data()
      const pid = propertyId(lease.property_string_id || lease.property_id)
      if (!pid) fail(409, 'LEASE_PROPERTY_MISSING', 'Link this lease to a property first.')
      const roles = await tx.get(db.collection('users').doc(actor.id).collection('roles'))
      const manager = roles.docs.some((doc) => {
        const role = doc.data()
        return propertyId(role.property_id) === pid && String(role.role).toLowerCase() === 'pm' &&
          String(role.status || 'active').toLowerCase() === 'active'
      })
      const linkedTenant = await resolveLeaseTenant(tx, db, lease, leaseId, pid)
      const tenant = linkedTenant.id === actor.id
      if (!manager && !tenant) fail(403, 'PERMISSION_DENIED', 'Only the property PM and linked tenant can access this inventory.')
      const snapshot = await tx.get(stateRef)
      let state = snapshot.exists ? readInventory(snapshot.data()) : null
      if (state) {
        if (Object.keys(state.batch?.signatures || {}).length && !state.batch.signing_context)
          state.batch.signing_context = structuredClone(state.context)
        if (state.context.tenant_profile_id && state.context.tenant_profile_id !== linkedTenant.profile_id)
          fail(409, 'INVENTORY_PARTICIPANTS_CHANGED', 'The lease tenant changed. Contact support before accessing this inventory.')
        const unsigned = !state.move_in_confirmed && !Object.keys(state.batch?.signatures || {}).length && state.items.every(item => !item.baseline && !item.latest)
        if (!state.context.tenant_user_id || (unsigned && state.context.tenant_user_id === lease.tenant_id)) {
          state.context.tenant_user_id = linkedTenant.id
          state.context.tenant_name = linkedTenant.name
        }
        if (state.context.tenant_user_id && state.context.tenant_user_id !== linkedTenant.id)
          fail(409, 'INVENTORY_PARTICIPANTS_CHANGED', 'The lease tenant changed. Contact support before accessing this inventory.')
        if (linkedTenant.profile_id) state.context.tenant_profile_id = linkedTenant.profile_id
        if (manager && actor.id !== state.context.pm_user_id)
          fail(403, 'PERMISSION_DENIED', 'Only the assigned PM can access this inventory.')
      }
      if (operation === 'get') return { inventory: state }
      if (operation === 'history') {
        const rows = await tx.get(historyRef)
        return { items: rows.docs.map((doc) => readInventoryBatch(doc.data())).sort((a, b) => String(b.confirmed_at).localeCompare(String(a.confirmed_at))) }
      }
      if (lease.archived || ['Archived', 'Terminated', 'Closed'].includes(lease.status))
        fail(409, 'LEASE_CLOSED', 'This lease is read-only.')
      if (body?.type === 'initialize') {
        if (!manager) fail(403, 'PERMISSION_DENIED', 'A property PM must create the inventory list.')
        if (state) return { inventory: state }
        const legacy = await tx.get(leaseRef.collection('inventories').doc('primary'))
        state = createInventoryWorkflow(legacy.exists ? legacy.data() : null, {
          property_id: pid, lease_id: leaseId, lease_label: lease.LSID || leaseId,
          property_label: lease.property_id?.nickname || lease.property_id?.address || '',
          pm_user_id: actor.id, pm_name: actor.name || actor.email || 'Property manager',
          tenant_user_id: linkedTenant.id, tenant_name: linkedTenant.name,
          ...(linkedTenant.profile_id ? { tenant_profile_id: linkedTenant.profile_id } : {}),
        }, now)
      } else {
        if (!state) fail(409, 'INVENTORY_NOT_INITIALIZED', 'Create the inventory list first.')
        // Fill an initially vacant tenant slot, but never reassign signed evidence.
        inventoryParticipant(state, actor)
        if ((state.context.tenant_user_id || null) !== linkedTenant.id)
          fail(409, 'INVENTORY_PARTICIPANTS_CHANGED', 'The lease tenant changed. Contact support before continuing this inventory.')
        if (state.context.property_id !== pid)
          fail(409, 'INVENTORY_PROPERTY_CHANGED', 'The lease property changed. Contact support before continuing.')
        const previousBatch = state.batch
        state = applyInventoryCommand(state, body || {}, actor, now, commandId)
        if (previousBatch && previousBatch.status !== 'confirmed' && state.batch?.id !== previousBatch.id) {
          tx.set(historyRef.doc(previousBatch.id), storeInventoryBatch({
            ...previousBatch, status: 'withdrawn', withdrawn_at: now,
            withdrawn_by: actor.id, withdrawal_reason: 'Started move-out checklist',
          }))
        }
        if (state.batch?.status === 'confirmed') tx.set(historyRef.doc(state.batch.id), storeInventoryBatch(state.batch))
      }
      tx.set(stateRef, storeInventory(state))
      return { inventory: state }
    })
  }
  return {
    get: (ctx) => execute(ctx, 'get'),
    history: (ctx) => execute(ctx, 'history'),
    command: (ctx) => execute(ctx, 'command'),
  }
}
