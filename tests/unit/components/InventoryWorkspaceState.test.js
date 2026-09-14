import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import InventoryWorkspace from 'src/components/inventory/InventoryWorkspace.vue'

vi.mock('quasar', async (original) => ({
  ...(await original()),
  Notify: { create: vi.fn() },
}))

const api = vi.hoisted(() => ({
  getInventory: vi.fn(),
  inventoryCommand: vi.fn(),
  mobileRequest: vi.fn(),
  uploadInventoryPhoto: vi.fn(),
}))
vi.mock('src/services/mobileApi', () => ({
  ...api,
  inventoryPath: (id) => `/leases/${encodeURIComponent(id)}/inventory-workflow`,
}))
vi.mock('src/boot/firebase', () => ({ auth: { currentUser: { uid: 'pm-1' } } }))
vi.mock('src/stores/userDataStore', () => ({
  useUserDataStore: () => ({ userAccessibleProperties: [] }),
}))
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {}, meta: {} }),
  useRouter: () => ({ push: vi.fn() }),
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
}))

function inventory(lease = 'lease-a', revision = 4, version = 2) {
  const entry = {
    item_id: 'chair',
    name: 'Chair',
    area: 'Living room',
    condition: 'good',
    action: 'update',
    photos: [],
    note: '',
    checked: true,
  }
  return {
    lease_id: lease,
    revision,
    context: {
      lease_label: lease,
      property_id: 'property-1',
      pm_user_id: 'pm-1',
      pm_name: 'Manager',
      tenant_user_id: 'tenant-1',
      tenant_name: 'Tenant',
    },
    items: [{ id: 'chair', name: entry.name, area: entry.area, closed: false }],
    batch: {
      id: `batch-${lease}`,
      version,
      scope: 'list',
      stage: 'move_in',
      status: 'draft',
      signatures: {},
      entries: [entry],
    },
  }
}

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

let wrapper
const setup = () => wrapper.vm.$.setupState
const button = (label) =>
  wrapper.findAll('q-btn-stub').find((node) => node.attributes('label') === label)

async function mountWorkspace() {
  wrapper = shallowMount(InventoryWorkspace, {
    props: { leaseId: 'lease-a', embedded: true },
    global: {
      // Keep the global Quasar stubs, but expose dialog contents for UI assertions.
      stubs: {
        'q-dialog': {
          props: ['modelValue'],
          template: '<div v-if="modelValue" role="dialog"><slot /></div>',
        },
        'q-card': { template: '<div><slot /></div>' },
        'q-card-actions': { template: '<div><slot /></div>' },
      },
      directives: { 'close-popup': {} },
    },
  })
  await flushPromises()
}

async function openSignature(role = 'pm') {
  await setup().openSignature(role)
  await nextTick()
}

async function drawSignature() {
  setup().signature = [
    [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ],
  ]
  setup().consent = true
  await nextTick()
}

describe('InventoryWorkspace signature and request state', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    api.getInventory.mockImplementation(async (lease) => ({ inventory: inventory(lease) }))
    api.inventoryCommand.mockRejectedValue(new Error('Unexpected inventory command'))
    api.mobileRequest.mockRejectedValue(new Error('Unexpected mobile request'))
    api.uploadInventoryPhoto.mockRejectedValue(new Error('Unexpected upload'))
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
  })

  it('waits for a fresh GET before opening and freezes the returned revision/version', async () => {
    await mountWorkspace()
    const pending = deferred()
    api.getInventory.mockReturnValueOnce(pending.promise)
    const opening = setup().openSignature('pm')
    expect(api.getInventory).toHaveBeenNthCalledWith(2, 'lease-a')
    expect(setup().signatureOpen).toBe(false)
    pending.resolve({ inventory: inventory('lease-a', 8, 5) })
    await opening
    await nextTick()
    expect(setup().signatureOpen).toBe(true)
    expect(setup().signingRevision).toBe(8)
    expect(setup().signingVersion).toBe(5)
    expect(setup().signingBatchId).toBe('batch-lease-a')
    expect(wrapper.get('[role="dialog"]').text()).toContain('version 5')
    expect(api.inventoryCommand).not.toHaveBeenCalled()
  })

  it.each(['pm', 'tenant', 'confirmed'])(
    'refuses another signature when remote status is %s',
    async (status) => {
      await mountWorkspace()
      const latest = inventory('lease-a', 5)
      if (status === 'confirmed') latest.batch.status = 'confirmed'
      else latest.batch.signatures[status] = { signed_at: '2026-09-13T12:00:00Z' }
      api.getInventory.mockResolvedValueOnce({ inventory: latest })
      await openSignature(status === 'confirmed' ? 'pm' : status)
      expect(api.getInventory).toHaveBeenCalledTimes(2)
      expect(setup().state).toEqual(latest)
      expect(setup().signatureOpen).toBe(false)
      expect(api.inventoryCommand).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['pm', 'authenticated'],
    ['tenant', 'in_person'],
  ])('signs as %s using the frozen values', async (role, capture) => {
    await mountWorkspace()
    api.getInventory.mockResolvedValueOnce({ inventory: inventory('lease-a', 8, 5) })
    await openSignature(role)
    await drawSignature()
    const strokes = setup().signature
    const saved = inventory('lease-a', 9, 5)
    saved.batch.signatures[role] = { signed_at: '2026-09-13T12:00:00Z' }
    api.inventoryCommand.mockResolvedValueOnce({ inventory: saved })
    await button('Confirm & sign').trigger('click')
    await flushPromises()
    expect(api.inventoryCommand).toHaveBeenCalledExactlyOnceWith('lease-a', {
      type: 'sign',
      expected_revision: 8,
      batch_version: 5,
      signature: strokes,
      signer_role: role,
      capture_method: capture,
    })
    expect(setup().state).toEqual(saved)
    expect(setup().signatureOpen).toBe(false)
  })

  it.each(['revision', 'version', 'batch ID'])(
    'blocks signing if the %s changes after opening',
    async (field) => {
      await mountWorkspace()
      await openSignature()
      await drawSignature()
      if (field === 'revision') setup().state.revision++
      else if (field === 'version') setup().state.batch.version++
      else setup().state.batch.id = 'replacement-batch'
      await button('Confirm & sign').trigger('click')
      await flushPromises()
      expect(api.inventoryCommand).not.toHaveBeenCalled()
      expect(setup().signatureOpen).toBe(true)
      expect(wrapper.get('[role="dialog"] [role="alert"]').text()).toContain('The list changed')
      expect(setup().signingRevision).toBe(4)
      expect(setup().signingVersion).toBe(2)
    },
  )

  it('exposes Reload latest list after failed signing and reloads without retrying the signature', async () => {
    await mountWorkspace()
    await openSignature()
    await drawSignature()
    api.inventoryCommand.mockRejectedValueOnce(new Error('Revision conflict'))
    await button('Confirm & sign').trigger('click')
    await flushPromises()
    expect(setup().signatureOpen).toBe(true)
    expect(wrapper.get('[role="dialog"] [role="alert"]').text()).toBe('Revision conflict')
    api.getInventory.mockResolvedValueOnce({ inventory: inventory('lease-a', 10, 6) })
    await button('Reload latest list').trigger('click')
    await flushPromises()
    expect(api.getInventory).toHaveBeenCalledTimes(3)
    expect(api.inventoryCommand).toHaveBeenCalledTimes(1)
    expect(setup().signatureOpen).toBe(false)
    expect(setup().state.revision).toBe(10)
    expect(setup().signature).toEqual([])
    expect(setup().consent).toBe(false)
  })

  it.each(['resolve', 'reject'])('ignores an old lease GET that later %ss', async (outcome) => {
    await mountWorkspace()
    const old = deferred()
    api.getInventory.mockReturnValueOnce(old.promise)
    const loading = setup().load()
    await wrapper.setProps({ leaseId: 'lease-b' })
    await flushPromises()
    const latest = inventory('lease-b')
    expect(setup().state).toEqual(latest)
    if (outcome === 'resolve') old.resolve({ inventory: inventory('lease-a', 99) })
    else old.reject(new Error('Old lease unavailable'))
    await loading
    expect(setup().state).toEqual(latest)
    expect(setup().error).toBe('')
    expect(setup().loading).toBe(false)
    expect(setup().workflowReady).toBe(true)
  })

  it('does not let an older same-lease GET overwrite a newer GET', async () => {
    await mountWorkspace()
    const old = deferred()
    api.getInventory.mockReturnValueOnce(old.promise)
    const loading = setup().load()
    api.getInventory.mockResolvedValueOnce({ inventory: inventory('lease-a', 10, 6) })
    await setup().load()
    old.resolve({ inventory: inventory('lease-a', 5, 3) })
    await loading
    expect(setup().state.revision).toBe(10)
    expect(setup().state.batch.version).toBe(6)
  })

  it('does not let an inflight GET overwrite a successful sign response', async () => {
    await mountWorkspace()
    await openSignature()
    await drawSignature()
    const old = deferred()
    api.getInventory.mockReturnValueOnce(old.promise)
    const loading = setup().load()
    api.getInventory.mockResolvedValueOnce({ inventory: inventory() })
    await setup().load()
    const saved = inventory('lease-a', 5)
    saved.batch.signatures.pm = { signed_at: '2026-09-13T12:00:00Z' }
    api.inventoryCommand.mockResolvedValueOnce({ inventory: saved })
    await setup().sign()
    old.resolve({ inventory: inventory() })
    await loading
    expect(setup().state).toEqual(saved)
    expect(api.inventoryCommand).toHaveBeenCalledTimes(1)
  })

  it('clears an open signature session when the lease changes', async () => {
    await mountWorkspace()
    await openSignature()
    await drawSignature()
    await wrapper.setProps({ leaseId: 'lease-b' })
    await flushPromises()
    expect(setup().state.lease_id).toBe('lease-b')
    expect(setup().signatureOpen).toBe(false)
    expect(setup().signature).toEqual([])
    expect(setup().consent).toBe(false)
    expect(api.inventoryCommand).not.toHaveBeenCalled()
  })

  it('does not open a signature for the new lease when the old signature GET finishes', async () => {
    await mountWorkspace()
    const old = deferred()
    api.getInventory.mockReturnValueOnce(old.promise)
    const opening = setup().openSignature('pm')
    await wrapper.setProps({ leaseId: 'lease-b' })
    await flushPromises()
    old.resolve({ inventory: inventory('lease-a', 99) })
    await opening
    await nextTick()
    expect(setup().state.lease_id).toBe('lease-b')
    expect(setup().signatureOpen).toBe(false)
    expect(api.inventoryCommand).not.toHaveBeenCalled()
  })
})
