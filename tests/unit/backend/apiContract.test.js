import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApiServer } from '../../../backend/apiServer.js'
import { createSeededStore } from '../../fixtures/storeSeed.js'

let server
let baseUrl

const call = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options)
  const payload = await response.json()
  return { response, payload }
}

describe('API boundary contract v0.1', () => {
  beforeAll(async () => {
    const runtime = createApiServer({ store: createSeededStore() })
    server = runtime.server
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('includes request_id on success responses', async () => {
    const { response, payload } = await call('/auth/me', {
      headers: { 'X-User-Id': 'u-pm-1' },
    })
    expect(response.status).toBe(200)
    expect(typeof payload.request_id).toBe('string')
    expect(payload.user.role).toBe('pm_po')
  })

  it('returns structured error shape', async () => {
    const { response, payload } = await call('/unknown-route')
    expect(response.status).toBe(404)
    expect(payload).toMatchObject({
      request_id: expect.any(String),
      error_code: 'NOT_FOUND',
      message: expect.any(String),
      retryable: false,
    })
  })

  it('returns gate fields when a gated report is blocked', async () => {
    const { response, payload } = await call('/reports/annual-tax-finance?year=2026', {
      headers: { 'X-User-Id': 'u-tt-1' },
    })
    expect(response.status).toBe(403)
    expect(payload.error_code).toBe('PLAN_NOT_ELIGIBLE')
    expect(payload.gate_status).toBe('blocked')
    expect(payload.plan_required).toBe('pro')
    expect(typeof payload.upgrade_hint).toBe('string')
  })

  it('returns seeded task when store is pre-seeded', async () => {
    const { response, payload } = await call('/tasks/task-1', {
      headers: { 'X-User-Id': 'u-tt-1' },
    })
    expect(response.status).toBe(200)
    expect(payload.id).toBe('task-1')
    expect(payload.title).toBe('Fix leaking faucet in Unit 3')
  })

  it('enforces PM/PO-only inventory creation', async () => {
    const denied = await call('/leases/lease-1/inventories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': 'u-tt-1' },
      body: JSON.stringify({ assigned_tt_id: 'u-tt-1' }),
    })
    expect(denied.response.status).toBe(403)
    expect(denied.payload.error_code).toBe('PERMISSION_DENIED')

    const allowed = await call('/leases/lease-1/inventories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': 'u-pm-1' },
      body: JSON.stringify({ assigned_tt_id: 'u-tt-1' }),
    })
    expect(allowed.response.status).toBe(200)
    expect(allowed.payload.lease_id).toBe('lease-1')
    expect(allowed.payload.assigned_tt_id).toBe('u-tt-1')
  })
})
