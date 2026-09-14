import { config, flushPromises, mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
vi.mock('src/boot/firebase', () => ({
  auth: { currentUser: null },
  authStateReady: Promise.resolve(),
}))
const plugins = config.global.plugins
const render = () =>
  mount(Reports, {
    global: {
      stubs: { 'q-tooltip': true, 'q-spinner': true, 'q-td': true, 'q-card-actions': true },
      directives: { 'close-popup': {} },
    },
  })
afterAll(() => {
  config.global.plugins = plugins
})
const mocks = vi.hoisted(() => ({
  options: vi.fn(),
  report: vi.fn(),
  save: vi.fn(),
  createPdf: vi.fn(),
}))
vi.mock('../../../src/services/reportingApi', async (original) => ({
  ...(await original()),
  getReportingOptions: mocks.options,
  getWorkspaceReport: mocks.report,
}))
vi.mock('../../../src/services/reportPdf', () => ({ createReportPdf: mocks.createPdf }))
import Reports from '../../../src/pages/ReportsPage.vue'
beforeEach(() => {
  config.global.plugins = []
  mocks.createPdf.mockReset().mockReturnValue({ save: mocks.save })
  mocks.save.mockReset()
  mocks.options.mockResolvedValue({
    account: {
      id: 'pm',
      label: 'Garden Management',
      company_name: 'Garden Management',
      can_pm_statement: true,
    },
    properties: [
      { id: 'p1', name: 'Garden House', can_finance: true, can_tasks: true, is_owner: true },
    ],
  })
  mocks.report.mockResolvedValue({
    rows: Array.from({ length: 55 }, (_, i) => ({
      id: `t${i}`,
      date: '2026-09-10',
      property_name: 'Garden House',
      category: 'rental_income',
      amount: 10,
      income: 10,
      expense: 0,
      classification: 'operating_income',
      note: 'Recorded rent',
    })),
    summary: { income: 550, expenses: 0, net: 550 },
    warnings: ['Review historical categorization.'],
    excluded_count: 1,
    property_totals: [],
    basis: 'Recorded basis',
  })
})
describe('Reports PDF integration', () => {
  it('prefills company, allows override, and exports all rows and data notes', async () => {
    const wrapper = render()
    await flushPromises()
    wrapper.vm.propertyType = 'ledger'
    await flushPromises()
    wrapper.vm.openPdfDialog()
    expect(wrapper.vm.pdfCompany).toBe('Garden Management')
    wrapper.vm.pdfCompany = 'New Report Company'
    const snapshot = wrapper.vm.pdfSnapshot()
    expect(snapshot.title).toBe('New Report Company | Garden House')
    expect(snapshot.rows).toHaveLength(55)
    expect(snapshot.notes.join(' ')).toContain('1 records excluded')
    await wrapper.vm.downloadPdf()
    expect(mocks.createPdf).toHaveBeenCalledWith(
      expect.objectContaining({ title: snapshot.title, rows: snapshot.rows }),
    )
    expect(mocks.save).toHaveBeenCalledWith(expect.stringMatching(/^ledger_.*\.pdf$/))
    wrapper.unmount()
  })
  it('does not export unavailable or loading data', async () => {
    const wrapper = render()
    await flushPromises()
    wrapper.vm.loading = true
    await wrapper.vm.downloadPdf()
    expect(mocks.createPdf).not.toHaveBeenCalled()
    expect(wrapper.vm.pdfSnapshot()).toBeNull()
    wrapper.unmount()
  })
  it('does not substitute the personal account label for a missing company', async () => {
    const wrapper = render()
    await flushPromises()
    wrapper.vm.account = { id: 'owner', label: 'Personal Name', can_pm_statement: false }
    wrapper.vm.openPdfDialog()
    expect(wrapper.vm.pdfCompany).toBe('')
    expect(wrapper.vm.pdfTitle).toBe('Garden House')
    wrapper.unmount()
  })
})
