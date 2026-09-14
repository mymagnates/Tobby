import { reactive, nextTick } from 'vue'
import { config, flushPromises, mount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import CreateTransaction from '../../../src/components/CreateTransaction.vue'
import {
  createReportTransaction,
  getReportParticipants,
  defaultFinancialCategory,
  financialCategoryOptions,
} from '../../../src/services/reportTransactionApi'

const mocks = vi.hoisted(() => ({
  store: null,
  route: null,
  auth: { currentUser: null },
  authReady: Promise.resolve(),
  getIdToken: vi.fn(),
  createDocument: vi.fn(),
  uploadImages: vi.fn(),
  notify: vi.fn(),
  push: vi.fn(),
}))
vi.mock('../../../src/boot/firebase', () => ({
  auth: mocks.auth,
  authStateReady: { then: (...args) => mocks.authReady.then(...args) },
}))
vi.mock('../../../src/composables/useFirebase', () => ({
  useFirebase: () => ({ createDocument: mocks.createDocument, uploadImages: mocks.uploadImages }),
}))
vi.mock('../../../src/stores/userDataStore', () => ({ useUserDataStore: () => mocks.store }))
vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => ({ push: mocks.push, back: vi.fn() }),
}))
vi.mock('quasar', async (original) => ({ ...(await original()), Notify: { create: mocks.notify } }))

const plugins = config.global.plugins
const wrappers = []
const managers = [{ id: 'pm-actual', label: 'Assigned Manager', role: 'pm' }]
const response = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
})
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const input = {
  props: ['label', 'modelValue', 'options', 'rules'],
  template: '<label>{{ label }}<slot /></label>',
}
function render(props = {}) {
  const wrapper = mount(CreateTransaction, {
    props,
    global: {
      stubs: {
        'q-form': { template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>' },
        'q-card': { template: '<div><slot /></div>' },
        'q-card-section': { template: '<section><slot /></section>' },
        'q-input': input,
        'q-select': input,
        'q-file': true,
        'q-img': true,
      },
    },
  })
  wrappers.push(wrapper)
  return wrapper
}
async function validForm(props = {}) {
  const wrapper = render({ propertyId: 'p1', ...props })
  await flushPromises()
  Object.assign(wrapper.vm.transactionData, {
    transac_type: 'Rent',
    transac_from: 'Tenant',
    transac_to: 'Property Manager',
    to_account_id: 'pm-actual',
    amount: 1200,
    note: 'September rent',
  })
  await nextTick()
  return wrapper
}
const posts = () => fetch.mock.calls.filter(([, options]) => options.method === 'POST')

beforeAll(() => {
  config.global.plugins = []
})
afterAll(() => {
  config.global.plugins = plugins
})
beforeEach(() => {
  vi.clearAllMocks()
  mocks.authReady = Promise.resolve()
  mocks.auth.currentUser = { uid: 'pm-creator', getIdToken: mocks.getIdToken }
  mocks.getIdToken.mockResolvedValue('verified-token')
  mocks.uploadImages.mockResolvedValue(['https://example.test/proof.jpg'])
  mocks.route = reactive({ params: {}, query: {}, path: '/' })
  mocks.store = reactive({
    userId: 'pm-creator',
    userAccessibleProperties: [
      { id: 'p1', nickname: 'One' },
      { id: 'p2', nickname: 'Two' },
    ],
    userRoles: [
      { property_id: 'p1', role: 'pm' },
      { property_id: 'p2', role: 'po' },
    ],
    propertiesLoading: false,
  })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url, options) =>
      response(options.method === 'POST' ? { id: 'server-txn' } : { participants: managers }),
    ),
  )
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.unstubAllGlobals()
})

describe('reporting transaction form', () => {
  it('emits authoritative server fields when the response includes a transaction', async () => {
    const wrapper = await validForm()
    fetch.mockResolvedValueOnce(
      response({
        id: 'server-txn',
        transaction: {
          transac_id: 'server-txn',
          created_by: 'verified-actor',
          role: 'po',
          transac_to: 'pm',
          created_datetime: '2026-09-09T12:00:00Z',
          attribution_version: 1,
        },
      }),
    )
    await wrapper.vm.onSubmit()
    expect(wrapper.emitted('transaction-created')[0][0]).toMatchObject({
      id: 'server-txn',
      transac_id: 'server-txn',
      created_by: 'verified-actor',
      role: 'po',
      transac_to: 'pm',
      attribution_version: 1,
      amount: 1200,
    })
  })

  it.each(['Government', 'HOA'])(
    'retains %s in the UI but submits the supported other party role',
    async (party) => {
      const wrapper = await validForm()
      wrapper.vm.transactionData.transac_to = party
      expect(wrapper.vm.toRoleOptions).toContain(party)
      await wrapper.vm.onSubmit()
      expect(JSON.parse(posts()[0][1].body).transac_to).toBe('other')
    },
  )

  it.each([1.005, 1.234, 1e20])(
    'rejects unsupported decimal precision or amount range: %s',
    async (amount) => {
      const wrapper = await validForm()
      wrapper.vm.transactionData.amount = amount
      await wrapper.vm.onSubmit()
      expect(posts()).toHaveLength(0)
      expect(wrapper.vm.submitError).toContain('two decimal places')
    },
  )

  it('accepts valid cents without floating point rounding rejections', async () => {
    const wrapper = await validForm()
    wrapper.vm.transactionData.amount = 0.29
    await wrapper.vm.onSubmit()
    expect(JSON.parse(posts()[0][1].body).amount).toBe(0.29)
  })

  it.each(['', '2026-02-30', '2026-13-01', '09/09/2026', '2026-09-09T00:00:00Z'])(
    'rejects invalid transaction date %j',
    async (date) => {
      const wrapper = await validForm()
      wrapper.vm.transactionData.transac_date = date
      await wrapper.vm.onSubmit()
      expect(posts()).toHaveLength(0)
      expect(wrapper.vm.submitError).toContain('valid date in YYYY-MM-DD')
    },
  )

  it('preserves the shared form style and exposes category and actual PM account controls', async () => {
    const wrapper = await validForm()
    expect(wrapper.classes()).toContain('workspace-form')
    expect(wrapper.find('.workspace-form-cancel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Financial Category')
    expect(wrapper.text()).toContain('To: Property Manager Account')
    expect(wrapper.vm.transactionTypeOptions).toContain('Management Fee')
  })

  it('posts explicit attribution with a bearer token and emits saved data before reset', async () => {
    const wrapper = await validForm()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(posts()).toHaveLength(1)
    const [url, options] = posts()[0]
    expect(url).toBe('/api/properties/p1/report-transactions')
    expect(options.headers.Authorization).toBe('Bearer verified-token')
    const payload = JSON.parse(options.body)
    expect(payload).toMatchObject({
      property_id: 'p1',
      transac_type: 'Rent',
      financial_category: 'rental_income',
      transac_from: 'Tenant',
      transac_to: 'Property Manager',
      from_account_id: '',
      to_account_id: 'pm-actual',
      amount: 1200,
    })
    expect(mocks.createDocument).not.toHaveBeenCalled()
    expect(wrapper.emitted('transaction-created')[0][0]).toMatchObject({
      id: 'server-txn',
      amount: 1200,
      financial_category: 'rental_income',
      to_account_id: 'pm-actual',
      note: 'September rent',
      property_id: 'p1',
    })
    expect(wrapper.vm.transactionData.amount).toBeNull()
    expect(wrapper.vm.selectedPropertyId).toBe('p1')
    expect(wrapper.vm.loading).toBe(false)
  })

  it.each(['', 'unknown-property', 'properties/p1'])(
    'blocks invalid property %j before upload or POST',
    async (id) => {
      const wrapper = await validForm()
      wrapper.vm.selectedPropertyId = id
      wrapper.vm.selectedFile = new File(['proof'], 'proof.png', { type: 'image/png' })
      await nextTick()
      await wrapper.vm.onSubmit()
      expect(posts()).toHaveLength(0)
      expect(mocks.uploadImages).not.toHaveBeenCalled()
      expect(wrapper.vm.submitError).toContain('valid, accessible property')
    },
  )

  it.each(['', 'pm-creator', 'pm-other-property'])(
    'blocks missing or invalid PM identity %j',
    async (id) => {
      const wrapper = await validForm()
      wrapper.vm.transactionData.to_account_id = id
      await wrapper.vm.onSubmit()
      expect(posts()).toHaveLength(0)
      expect(wrapper.vm.submitError).toContain('actual property manager account')
    },
  )

  it('does not infer the creator or automatically choose the only manager', async () => {
    const wrapper = render({ propertyId: 'p1', prefill: { transac_from: 'tt', transac_to: 'pm' } })
    await flushPromises()
    expect(wrapper.vm.transactionData.transac_to).toBe('Property Manager')
    expect(wrapper.vm.transactionData.to_account_id).toBe('')
    expect(wrapper.vm.managerOptions).toHaveLength(1)
  })

  it('supports explicit attribution on the from side and clears identities on role changes', async () => {
    const wrapper = await validForm()
    Object.assign(wrapper.vm.transactionData, {
      transac_from: 'Property Manager',
      transac_to: 'Property Owner',
      from_account_id: 'pm-actual',
    })
    expect(wrapper.vm.transactionData.to_account_id).toBe('')
    await wrapper.vm.onSubmit()
    expect(JSON.parse(posts()[0][1].body)).toMatchObject({
      from_account_id: 'pm-actual',
      to_account_id: '',
    })
    wrapper.vm.transactionData.transac_from = 'Property Manager'
    wrapper.vm.transactionData.from_account_id = 'pm-actual'
    wrapper.vm.transactionData.transac_from = 'Tenant'
    expect(wrapper.vm.transactionData.from_account_id).toBe('')
    wrapper.vm.transactionData.transac_to = 'Property Manager'
    wrapper.vm.transactionData.to_account_id = 'pm-actual'
    wrapper.vm.transactionData.transac_to = 'Property Owner'
    expect(wrapper.vm.transactionData.to_account_id).toBe('')
  })

  it('clears both account IDs on property change and uses the dropdown instead of the route', async () => {
    mocks.route.params.propertyId = 'p1'
    const wrapper = await validForm()
    wrapper.vm.transactionData.from_account_id = 'stale'
    wrapper.vm.selectedPropertyId = 'p2'
    expect(wrapper.vm.transactionData.to_account_id).toBe('')
    expect(wrapper.vm.transactionData.from_account_id).toBe('')
    await flushPromises()
    wrapper.vm.transactionData.to_account_id = 'pm-actual'
    await wrapper.vm.onSubmit()
    expect(posts()[0][0]).toBe('/api/properties/p2/report-transactions')
  })

  it('clears account IDs when a locked property prop changes', async () => {
    const wrapper = await validForm({ allowPropertyEdit: false })
    await wrapper.setProps({ propertyId: 'p2' })
    expect(wrapper.vm.transactionData.to_account_id).toBe('')
    await flushPromises()
    expect(fetch.mock.calls.some(([url]) => url.endsWith('property_id=p2'))).toBe(true)
  })

  it('preserves valid property and account selections when the store refreshes', async () => {
    const wrapper = await validForm()
    mocks.store.userAccessibleProperties = [{ id: 'p1', nickname: 'Updated' }, { id: 'p2' }]
    await flushPromises()
    expect(wrapper.vm.selectedPropertyId).toBe('p1')
    expect(wrapper.vm.transactionData.to_account_id).toBe('pm-actual')
  })

  it('ignores stale participant responses and blocks save while the new property is loading', async () => {
    const old = deferred()
    fetch.mockImplementationOnce(() => old.promise)
    const wrapper = render({ propertyId: 'p1' })
    await flushPromises()
    const current = deferred()
    fetch.mockImplementationOnce(() => current.promise)
    wrapper.vm.selectedPropertyId = 'p2'
    await flushPromises()
    Object.assign(wrapper.vm.transactionData, {
      transac_type: 'Rent',
      transac_from: 'Tenant',
      transac_to: 'Property Manager',
      amount: 10,
      to_account_id: 'pm-actual',
    })
    await wrapper.vm.onSubmit()
    expect(posts()).toHaveLength(0)
    current.resolve(response({ participants: [{ id: 'pm-new', label: 'New', role: 'pm' }] }))
    await flushPromises()
    old.resolve(response({ participants: managers }))
    await flushPromises()
    expect(wrapper.vm.managerOptions.map((option) => option.value)).toEqual(['pm-new'])
    expect(wrapper.vm.transactionData.to_account_id).toBe('')
  })

  it.each([0, -5, Infinity, NaN, '12garbage', ''])('rejects invalid amount %j', async (amount) => {
    const wrapper = await validForm()
    wrapper.vm.transactionData.amount = amount
    await wrapper.vm.onSubmit()
    expect(posts()).toHaveLength(0)
    expect(wrapper.vm.submitError).toContain('finite number greater than zero')
  })

  it.each(['Fee', 'Refund', 'Other'])(
    'warns for %s but permits an explicit unclassified save',
    async (type) => {
      const wrapper = await validForm()
      wrapper.vm.transactionData.transac_type = type
      await nextTick()
      expect(wrapper.vm.transactionData.financial_category).toBe('unclassified')
      expect(wrapper.text()).toContain('You may save as Unclassified')
      await wrapper.vm.onSubmit()
      expect(JSON.parse(posts()[0][1].body).financial_category).toBe('unclassified')
    },
  )

  it('posts an explicit category override and rejects noncanonical categories', async () => {
    const wrapper = await validForm()
    wrapper.vm.transactionData.financial_category = 'bogus'
    await wrapper.vm.onSubmit()
    expect(posts()).toHaveLength(0)
    wrapper.vm.transactionData.financial_category = 'reimbursement'
    await wrapper.vm.onSubmit()
    expect(JSON.parse(posts()[0][1].body).financial_category).toBe('reimbursement')
  })

  it('preserves an explicit prefilled category and both prefilled parties', async () => {
    const wrapper = render({
      propertyId: 'p1',
      prefill: {
        transac_type: 'Refund',
        transac_from: 'pm',
        transac_to: 'tt',
        financial_category: 'security_deposit',
      },
    })
    await flushPromises()
    expect(wrapper.vm.transactionData).toMatchObject({
      transac_from: 'Property Manager',
      transac_to: 'Tenant',
      financial_category: 'security_deposit',
      from_account_id: '',
    })
  })

  it('shows participant failures, blocks PM saves, and allows retry', async () => {
    fetch.mockImplementationOnce(async () =>
      response({ message: 'Owner or manager access required.' }, 403),
    )
    const wrapper = await validForm()
    await wrapper.vm.onSubmit()
    expect(posts()).toHaveLength(0)
    expect(wrapper.text()).toContain('Owner or manager access required.')
    await wrapper.vm.loadParticipants()
    wrapper.vm.transactionData.to_account_id = 'pm-actual'
    await wrapper.vm.onSubmit()
    expect(posts()).toHaveLength(1)
  })

  it('does not require PM accounts for transactions between non-PM parties', async () => {
    const wrapper = await validForm()
    wrapper.vm.transactionData.transac_to = 'Property Owner'
    await wrapper.vm.onSubmit()
    expect(JSON.parse(posts()[0][1].body).to_account_id).toBe('')
  })

  it('preserves upload context and includes the uploaded proof in POST', async () => {
    const wrapper = await validForm()
    const file = new File(['proof'], 'proof.png', { type: 'image/png' })
    wrapper.vm.selectedFile = file
    await wrapper.vm.onSubmit()
    expect(mocks.uploadImages).toHaveBeenCalledWith([file], 'p1', 'transaction')
    expect(JSON.parse(posts()[0][1].body).picture_url).toBe('https://example.test/proof.jpg')
  })

  it('preserves the warning-and-save behavior when image upload fails', async () => {
    const wrapper = await validForm()
    mocks.uploadImages.mockRejectedValueOnce(new Error('Upload failed'))
    wrapper.vm.selectedFile = new File(['proof'], 'proof.png', { type: 'image/png' })
    await wrapper.vm.onSubmit()
    expect(JSON.parse(posts()[0][1].body).picture_url).toBe('')
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' }))
  })

  it('shows server rejection inline, retains the form, and never falls back to direct writes', async () => {
    const wrapper = await validForm()
    fetch.mockImplementationOnce(async () =>
      response({ message: 'Manager account is not assigned to this property.' }, 400),
    )
    await wrapper.vm.onSubmit()
    await nextTick()
    expect(wrapper.find('[role="alert"]').text()).toContain('not assigned to this property')
    expect(wrapper.vm.transactionData.amount).toBe(1200)
    expect(wrapper.emitted('transaction-created')).toBeUndefined()
    expect(mocks.createDocument).not.toHaveBeenCalled()
    expect(wrapper.vm.loading).toBe(false)
  })

  it('guards against duplicate submits while saving', async () => {
    const wrapper = await validForm()
    const pending = deferred()
    fetch.mockImplementationOnce(() => pending.promise)
    const first = wrapper.vm.onSubmit()
    await flushPromises()
    await wrapper.vm.onSubmit()
    expect(posts()).toHaveLength(1)
    pending.resolve(response({ id: 'server-txn' }))
    await first
  })
})

describe('report transaction API contract', () => {
  it('uses canonical category values and shared type defaults', () => {
    expect(financialCategoryOptions.map((option) => option.value)).toEqual([
      'rental_income',
      'management_fee',
      'maintenance',
      'utilities',
      'insurance',
      'property_tax',
      'hoa',
      'other_income',
      'other_expense',
      'security_deposit',
      'owner_contribution',
      'owner_distribution',
      'transfer',
      'reimbursement',
      'unclassified',
    ])
    expect(defaultFinancialCategory('Management Fee')).toBe('management_fee')
    expect(defaultFinancialCategory('Deposit')).toBe('security_deposit')
    expect(defaultFinancialCategory('Tax')).toBe('property_tax')
    expect(defaultFinancialCategory('Utility')).toBe('utilities')
    expect(defaultFinancialCategory('Fee')).toBe('unclassified')
  })

  it('waits for auth restoration before obtaining a bearer token', async () => {
    const ready = deferred()
    mocks.authReady = ready.promise
    mocks.auth.currentUser = null
    const pending = getReportParticipants('p1')
    await flushPromises()
    expect(fetch).not.toHaveBeenCalled()
    mocks.auth.currentUser = { getIdToken: mocks.getIdToken }
    ready.resolve()
    await pending
    expect(fetch).toHaveBeenCalledWith(
      '/api/reports/participants?property_id=p1',
      expect.objectContaining({
        headers: { Authorization: 'Bearer verified-token', 'Content-Type': 'application/json' },
      }),
    )
  })

  it('rejects signed-out users without sending requests', async () => {
    mocks.auth.currentUser = null
    await expect(createReportTransaction('p1', {})).rejects.toThrow('sign in again')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns only valid PM participants and URL-encodes property IDs', async () => {
    fetch.mockResolvedValueOnce(
      response({ participants: [...managers, { id: 'po1', role: 'po' }, { role: 'pm' }] }),
    )
    expect(await getReportParticipants('p & 1')).toEqual(managers)
    expect(fetch.mock.calls[0][0]).toBe('/api/reports/participants?property_id=p%20%26%201')
  })

  it('rejects malformed successful responses instead of emitting a false success', async () => {
    fetch.mockResolvedValueOnce(response({}))
    await expect(createReportTransaction('p1', {})).rejects.toThrow(
      'did not confirm a transaction ID',
    )
    fetch.mockResolvedValueOnce(response({}))
    await expect(getReportParticipants('p1')).rejects.toThrow('Unable to load')
  })
})
