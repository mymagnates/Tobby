import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

const firestore = vi.hoisted(() => {
  const collections = new Map()

  const keyFor = (segments) => segments.join('/')
  const rowsFor = (segments) => {
    const key = keyFor(segments)
    if (!collections.has(key)) collections.set(key, new Map())
    return collections.get(key)
  }
  const snapshot = (id, value, ref = null) => ({
    id,
    ref,
    exists: value !== undefined,
    data: () => (value ? structuredClone(value) : undefined),
  })
  const collection = (segments, filters = [], max = null) => ({
    collection: (name) => collection([...segments, name]),
    doc: (id) => {
      const ref = {
        id: String(id),
        collection: (name) => collection([...segments, String(id), name]),
        get: async () => snapshot(String(id), rowsFor(segments).get(String(id)), ref),
        set: async (value, options = {}) => {
          const current = rowsFor(segments).get(String(id)) || {}
          rowsFor(segments).set(
            String(id),
            options.merge ? { ...current, ...structuredClone(value) } : structuredClone(value),
          )
        },
        delete: async () => rowsFor(segments).delete(String(id)),
      }
      return ref
    },
    where: (field, operator, value) => {
      if (operator !== '==') throw new Error(`Unsupported test query operator: ${operator}`)
      return collection(segments, [...filters, [field, value]], max)
    },
    limit: (value) => collection(segments, filters, value),
    get: async () => {
      let rows = [...rowsFor(segments).entries()]
      for (const [field, value] of filters) rows = rows.filter(([, row]) => row?.[field] === value)
      if (max !== null) rows = rows.slice(0, max)
      return { docs: rows.map(([id, row]) => snapshot(id, row, collection(segments).doc(id))) }
    },
  })

  return {
    db: {
      collection: (name) => collection([name]),
      runTransaction: async (callback) =>
        callback({
          get: (ref) => ref.get(),
          set: (ref, value, options) => ref.set(value, options),
          delete: (ref) => ref.delete(),
        }),
    },
    reset: () => collections.clear(),
    seed: (path, id, value) => rowsFor(path.split('/')).set(id, structuredClone(value)),
    read: (path, id) => rowsFor(path.split('/')).get(id),
  }
})

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(() => [{}]),
  initializeApp: vi.fn(),
}))

vi.mock('firebase-admin/firestore', () => ({ getFirestore: vi.fn(() => firestore.db) }))

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(async (token) => {
      if (token === 'admin-token')
        return { uid: 'u-admin-1', email: 'admin@handout.local', admin: true }
      if (token === 'pm-token')
        return { uid: 'u-pm-verified', email: 'pm@handout.local', role: 'pm_po' }
      if (token === 'owner-token')
        return { uid: 'u-owner-1', email: 'owner@example.com', role: 'pm_po' }
      if (token === 'other-owner-token')
        return { uid: 'u-owner-2', email: 'other-owner@example.com', role: 'pm_po' }
      if (token === 'manager-token')
        return { uid: 'u-pm-1', email: 'pm@handout.local', role: 'pm_po' }
      if (token === 'tenant-token')
        return { uid: 'u-tenant-1', email: 'tenant@example.com', role: 'tt' }
      throw new Error('invalid token')
    }),
  })),
}))

import { createApiServer } from '../../../backend/apiServer.js'
import { createInMemoryStore } from '../../../backend/store.js'

let server
let baseUrl
let store
let runtime
const storageBucket = {
  file: (path) => ({
    getSignedUrl: async () => [`https://storage.test/${encodeURIComponent(path)}`],
    save: async () => {},
  }),
}
const firebaseAuth = {
  verifyIdToken: async (token) => {
    if (token === 'admin-token')
      return { uid: 'u-admin-1', email: 'admin@handout.local', admin: true }
    if (token === 'pm-token')
      return { uid: 'u-pm-verified', email: 'pm@handout.local', role: 'pm_po' }
    if (token === 'owner-token')
      return { uid: 'u-owner-1', email: 'owner@example.com', role: 'pm_po' }
    if (token === 'other-owner-token')
      return { uid: 'u-owner-2', email: 'other-owner@example.com', role: 'pm_po' }
    if (token === 'manager-token')
      return { uid: 'u-pm-1', email: 'pm@handout.local', role: 'pm_po' }
    if (token === 'tenant-token')
      return { uid: 'u-tenant-1', email: 'tenant@example.com', role: 'tt' }
    throw new Error('invalid token')
  },
}

const call = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options)
  return { response, payload: await response.json() }
}

const headers = (userId, role, extra = {}) => ({
  'Content-Type': 'application/json',
  'X-User-Id': userId,
  'X-User-Role': role,
  ...extra,
})

describe('PM release API safety contracts', () => {
  beforeAll(async () => {
    firestore.reset()
    firestore.seed('properties', 'prop-owned', { nickname: 'Release test property' })
    firestore.seed('users/u-pm-1/roles', 'role-pm', {
      property_id: 'prop-owned',
      role: 'pm',
      status: 'active',
    })
    runtime = createApiServer({
      store: createInMemoryStore(),
      config: { firestoreDb: firestore.db, firebaseAuth, storageBucket },
    })
    store = runtime.store
    server = runtime.server
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
    runtime.dispose()
  })

  it('reports quota exhaustion through backend-owned usage state', async () => {
    const actor = store.ensureUser('u-pm-quota', 'pm_po')
    actor.billing.ai_tokens_used = actor.billing.ai_tokens_limit
    actor.billing.storage_used_mb = actor.billing.storage_limit_mb
    const { response, payload } = await call('/billing/usage', {
      headers: headers('u-pm-quota', 'pm_po'),
    })
    expect(response.status).toBe(200)
    expect(payload.gate_status).toBe('blocked')
    expect(payload.ai_tokens_status).toBe('blocked')
    expect(payload.storage_status).toBe('blocked')
  })

  it('blocks AI calls before model execution when the actor has no AI credit remaining', async () => {
    const actor = store.ensureUser('u-pm-ai-exhausted', 'pm_po')
    actor.billing.ai_tokens_used = actor.billing.ai_tokens_limit
    const { response, payload } = await call('/agent/intake', {
      method: 'POST',
      headers: headers('u-pm-ai-exhausted', 'pm_po'),
      body: JSON.stringify({ raw_text: 'The kitchen sink pipe is leaking.' }),
    })
    expect(response.status).toBe(402)
    expect(payload.error_code).toBe('AI_CREDIT_EXHAUSTED')
  })

  it('creates a support ticket and prevents another PM from reading it', async () => {
    const created = await call('/support/tickets', {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po'),
      body: JSON.stringify({ subject: 'Upload issue', description: 'Cannot attach a receipt.' }),
    })
    expect(created.response.status).toBe(200)
    expect(created.payload.ticket.user_id).toBe('u-pm-1')

    const denied = await call(`/support/tickets/${created.payload.ticket.id}`, {
      headers: headers('u-pm-2', 'pm_po'),
    })
    expect(denied.response.status).toBe(403)
    expect(denied.payload.error_code).toBe('PERMISSION_DENIED')
  })

  it('accepts account deletion only with a verified Firebase token', async () => {
    const denied = await call('/account-deletion-requests', {
      method: 'POST',
      headers: headers('u-pm-verified', 'pm_po'),
      body: JSON.stringify({ reason: 'Release test' }),
    })
    expect(denied.response.status).toBe(401)
    expect(denied.payload.error_code).toBe('UNAUTHENTICATED')

    const accepted = await call('/account-deletion-requests', {
      method: 'POST',
      headers: headers('u-pm-verified', 'pm_po', { Authorization: 'Bearer pm-token' }),
      body: JSON.stringify({ reason: 'Release test' }),
    })
    expect(accepted.response.status).toBe(200)
    expect(accepted.payload.request.status).toBe('requested')
    expect(
      firestore.read('account_deletion_requests', 'u-pm-verified_account_deletion'),
    ).toMatchObject({
      user_id: 'u-pm-verified',
      status: 'requested',
    })
  })

  it('rejects duplicate pending owner invitations', async () => {
    const request = {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po'),
      body: JSON.stringify({ property_id: 'prop-owned', owner_email: 'mismatch@example.com' }),
    }
    const first = await call('/owner-invites/email', request)
    expect(first.response.status).toBe(200)
    expect(first.payload.email_sent).toBe(false)

    const duplicate = await call('/owner-invites/email', request)
    expect(duplicate.response.status).toBe(409)
    expect(duplicate.payload.error_code).toBe('INVITE_ALREADY_PENDING')
  })

  it('sanitizes token lookup and accepts an owner invite atomically for the verified email', async () => {
    const created = await call('/owner-invites/email', {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po'),
      body: JSON.stringify({ property_id: 'prop-owned', owner_email: 'other-owner@example.com' }),
    })
    expect(created.response.status).toBe(200)
    const token = created.payload.invite_url.split('/').pop()

    const lookup = await call(`/owner-invites/${token}`)
    expect(lookup.response.status).toBe(200)
    expect(lookup.payload.invite).not.toHaveProperty('owner_email')
    expect(lookup.payload.invite).not.toHaveProperty('token')
    expect(lookup.payload.property).toMatchObject({ id: 'prop-owned' })

    const accepted = await call(`/owner-invites/${token}/accept`, {
      method: 'POST',
      headers: headers('u-owner-2', 'pm_po', { Authorization: 'Bearer other-owner-token' }),
    })
    expect(accepted.response.status).toBe(200)
    expect(accepted.payload.already_accepted).toBe(false)
    expect(firestore.read('properties', 'prop-owned').owner_user_ids).toContain('u-owner-2')
    expect(firestore.read('users/u-owner-2/roles', 'po_prop-owned')).toMatchObject({
      role: 'po',
      property_id: 'prop-owned',
      status: 'active',
    })

    const repeated = await call(`/owner-invites/${token}/accept`, {
      method: 'POST',
      headers: headers('u-owner-2', 'pm_po', { Authorization: 'Bearer other-owner-token' }),
    })
    expect(repeated.response.status).toBe(200)
    expect(repeated.payload.already_accepted).toBe(true)
  })

  it('grants view-only access without granting a manager or owner relationship', async () => {
    const created = await call('/property-access-invites/email', {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      body: JSON.stringify({
        property_id: 'prop-owned',
        invited_email: 'owner@example.com',
        access_role: 'viewer',
      }),
    })
    expect(created.response.status).toBe(200)
    const token = created.payload.invite_url.split('/').pop()

    const lookup = await call(`/property-access-invites/${token}`)
    expect(lookup.response.status).toBe(200)
    expect(lookup.payload.invite).toMatchObject({ access_role: 'viewer' })
    expect(lookup.payload.invite).not.toHaveProperty('invited_email')

    const accepted = await call(`/property-access-invites/${token}/accept`, {
      method: 'POST',
      headers: headers('u-owner-1', 'pm_po', { Authorization: 'Bearer owner-token' }),
    })
    expect(accepted.response.status).toBe(200)
    expect(accepted.payload.access_role).toBe('viewer')
    expect(firestore.read('properties', 'prop-owned').viewer_user_ids).toContain('u-owner-1')
    expect(firestore.read('properties', 'prop-owned').owner_user_ids || []).not.toContain(
      'u-owner-1',
    )
    expect(firestore.read('users/u-owner-1/roles', 'viewer_prop-owned')).toMatchObject({
      role: 'viewer',
      relationship_type: 'viewer',
      property_id: 'prop-owned',
    })
  })

  it('grants the selected manager relationship through the same access invite flow', async () => {
    const created = await call('/property-access-invites/email', {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      body: JSON.stringify({
        property_id: 'prop-owned',
        invited_email: 'pm@handout.local',
        access_role: 'manager',
      }),
    })
    expect(created.response.status).toBe(200)
    const token = created.payload.invite_url.split('/').pop()

    const accepted = await call(`/property-access-invites/${token}/accept`, {
      method: 'POST',
      headers: headers('u-pm-verified', 'pm_po', { Authorization: 'Bearer pm-token' }),
    })
    expect(accepted.response.status).toBe(200)
    expect(firestore.read('properties', 'prop-owned').manager_user_ids).toContain('u-pm-verified')
    expect(firestore.read('users/u-pm-verified/roles', 'pm_prop-owned')).toMatchObject({
      role: 'pm',
      relationship_type: 'manager',
      property_id: 'prop-owned',
    })
  })

  it('rejects acceptance by a verified account with a different email', async () => {
    const created = await call('/owner-invites/email', {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po'),
      body: JSON.stringify({ property_id: 'prop-owned', owner_email: 'owner@example.com' }),
    })
    const token = created.payload.invite_url.split('/').pop()
    const denied = await call(`/owner-invites/${token}/accept`, {
      method: 'POST',
      headers: headers('u-owner-2', 'pm_po', { Authorization: 'Bearer other-owner-token' }),
    })
    expect(denied.response.status).toBe(403)
    expect(denied.payload.error_code).toBe('INVITE_EMAIL_MISMATCH')
  })

  it('revokes only a pending invite and protects the final owner from removal', async () => {
    const created = await call('/owner-invites/email', {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po'),
      body: JSON.stringify({ property_id: 'prop-owned', owner_email: 'revoke@example.com' }),
    })
    const revoke = await call(
      `/properties/prop-owned/owner-invites/${created.payload.invite_id}/revoke`,
      {
        method: 'POST',
        headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      },
    )
    expect(revoke.response.status).toBe(200)
    expect(revoke.payload.already_revoked).toBe(false)

    const repeatedRevoke = await call(
      `/properties/prop-owned/owner-invites/${created.payload.invite_id}/revoke`,
      {
        method: 'POST',
        headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      },
    )
    expect(repeatedRevoke.response.status).toBe(200)
    expect(repeatedRevoke.payload.already_revoked).toBe(true)

    const removed = await call('/properties/prop-owned/owners/u-owner-2', {
      method: 'DELETE',
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      body: JSON.stringify({ next_primary_owner_user_id: 'u-owner-2' }),
    })
    expect(removed.response.status).toBe(409)
    expect(removed.payload.error_code).toBe('LAST_OWNER_REMOVAL_FORBIDDEN')
  })

  it('rejects an unverified caller who claims an admin role', async () => {
    const response = await call('/admin/support/tickets', {
      headers: headers('u-pm-1', 'admin'),
    })
    expect(response.response.status).toBe(401)
    expect(response.payload.error_code).toBe('UNAUTHENTICATED')
  })

  it('allows the verified admin path without trusting a PM role header', async () => {
    const response = await call('/admin/support/tickets', {
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer admin-token' }),
    })
    expect(response.response.status).toBe(200)
    expect(response.payload.items).toEqual(expect.any(Array))
  })

  it('restores the active server adapters after a temporary test scope is disposed', async () => {
    const temporary = createApiServer({
      config: {
        firestoreDb: {
          collection: () => {
            throw new Error('temporary adapter should not leak')
          },
        },
        firebaseAuth,
      },
    })
    temporary.dispose()

    const response = await call('/support/tickets', {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po'),
      body: JSON.stringify({
        subject: 'Adapter scope',
        description: 'The original adapter is active.',
      }),
    })
    expect(response.response.status).toBe(200)
  })

  it('keeps tenant CRUD property-authorized and rejects cross-property edits', async () => {
    firestore.seed('properties', 'prop-other', { nickname: 'Other property' })
    const created = await call('/properties/prop-owned/tenants', {
      method: 'POST',
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      body: JSON.stringify({
        tenant: {
          personal_info: { first_name: 'Taylor', last_name: 'Tenant', email: 'taylor@example.com' },
          status: 'active',
        },
      }),
    })
    expect(created.response.status).toBe(200)
    expect(created.payload.tenant.property_id).toBe('prop-owned')

    const listed = await call('/properties/prop-owned/tenants', {
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
    })
    expect(listed.response.status).toBe(200)
    expect(listed.payload.rows).toHaveLength(1)

    const denied = await call(`/properties/prop-other/tenants/${created.payload.tenant.id}`, {
      method: 'PATCH',
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      body: JSON.stringify({ tenant: { status: 'inactive' } }),
    })
    expect(denied.response.status).toBe(403)
    expect(denied.payload.error_code).toBe('PERMISSION_DENIED')
  })

  it('redacts co-tenant records and issues document links only after tenant authorization', async () => {
    firestore.seed('users', 'u-tenant-1', { lease_id: 'lease-tenant' })
    firestore.seed('leases', 'lease-tenant', {
      property_id: 'prop-owned',
      tenant_id: 'u-tenant-1',
      tenant_email: 'tenant@example.com',
      status: 'Rented',
    })
    firestore.seed('tenants', 'tenant-current', {
      lease_id: 'lease-tenant',
      account_user_id: 'u-tenant-1',
      personal_info: {
        first_name: 'Taylor',
        last_name: 'Tenant',
        email: 'tenant@example.com',
        phone: '555-0100',
        ssn: '111-22-3333',
      },
      employment: { employer_name: 'Private Employer' },
    })
    firestore.seed('tenants', 'tenant-other', {
      lease_id: 'lease-tenant',
      account_user_id: 'u-tenant-2',
      personal_info: {
        first_name: 'Morgan',
        last_name: 'CoTenant',
        email: 'other@example.com',
        phone: '555-0101',
        ssn: '444-55-6666',
      },
      employment: { employer_name: 'Private Employer' },
    })
    firestore.seed('properties/prop-owned/documents', 'document-current', {
      tenant_id: 'u-tenant-1',
      lease_id: 'lease-tenant',
      name: 'My receipt.pdf',
      storage_path: 'secure/tenant_documents/prop-owned/u-tenant-1/current/receipt.pdf',
      url: 'https://stale.example/current',
    })
    firestore.seed('properties/prop-owned/documents', 'document-other', {
      tenant_id: 'u-tenant-2',
      lease_id: 'lease-tenant',
      name: 'Other tenant document.pdf',
      storage_path: 'secure/tenant_documents/prop-owned/u-tenant-2/other/document.pdf',
    })
    firestore.seed('properties/prop-owned/documents', 'document-shared', {
      lease_id: 'lease-tenant',
      name: 'Lease addendum.pdf',
      storage_path: 'secure/lease_documents/prop-owned/lease-tenant/addendum.pdf',
    })

    const tenantHeaders = headers('u-tenant-1', 'tt', { Authorization: 'Bearer tenant-token' })
    const dashboard = await call('/tenant/dashboard', { headers: tenantHeaders })
    expect(dashboard.response.status).toBe(200)
    expect(dashboard.payload.tenants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'tenant-current', is_current: true }),
        expect.objectContaining({ id: 'tenant-other', is_current: false }),
      ]),
    )
    expect(dashboard.payload.tenants[0]).not.toHaveProperty('personal_info')
    expect(dashboard.payload.tenants[0]).not.toHaveProperty('employment')
    expect(dashboard.payload.documents.map((document) => document.id)).toEqual(
      expect.arrayContaining(['document-current', 'document-shared']),
    )
    expect(dashboard.payload.documents.map((document) => document.id)).not.toContain(
      'document-other',
    )
    expect(dashboard.payload.documents[0]).not.toHaveProperty('url')
    expect(dashboard.payload.documents[0]).not.toHaveProperty('storage_path')

    const currentDocument = await call('/tenant/documents/document-current/access', {
      headers: tenantHeaders,
    })
    expect(currentDocument.response.status).toBe(200)
    expect(currentDocument.payload.url).toContain(
      'secure%2Ftenant_documents%2Fprop-owned%2Fu-tenant-1',
    )

    const sharedDocument = await call('/tenant/documents/document-shared/access', {
      headers: tenantHeaders,
    })
    expect(sharedDocument.response.status).toBe(200)

    const deniedDocument = await call('/tenant/documents/document-other/access', {
      headers: tenantHeaders,
    })
    expect(deniedDocument.response.status).toBe(403)
    expect(deniedDocument.payload.error_code).toBe('TENANT_DOCUMENT_ACCESS_DENIED')
  })

  it('reviews an application through a PM-authorized transaction', async () => {
    firestore.seed('leases', 'lease-owned', { property_id: 'prop-owned', status: 'Available' })
    firestore.seed('lease_applications', 'application-owned', {
      property_id: 'prop-owned',
      lease_id: 'lease-owned',
      status: 'pending',
      desired_move_in_date: '2026-08-01',
    })
    firestore.seed('lease_applications/application-owned/private', 'profile', {
      applicant: { first_name: 'Casey', last_name: 'Applicant', email: 'casey@example.com' },
      documents: [],
    })

    const approved = await call('/lease-applications/application-owned/review', {
      method: 'PATCH',
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      body: JSON.stringify({ decision: 'approved', lease_start_date: '2026-08-15' }),
    })
    expect(approved.response.status).toBe(200)
    expect(approved.payload.application.status).toBe('approved')
    expect(approved.payload.tenant_id).toEqual(expect.any(String))
    expect(firestore.read('leases', 'lease-owned')).toMatchObject({
      status: 'Rented',
      tenant_id: approved.payload.tenant_id,
    })

    const repeat = await call('/lease-applications/application-owned/review', {
      method: 'PATCH',
      headers: headers('u-pm-1', 'pm_po', { Authorization: 'Bearer manager-token' }),
      body: JSON.stringify({ decision: 'rejected' }),
    })
    expect(repeat.response.status).toBe(409)
    expect(repeat.payload.error_code).toBe('APPLICATION_ALREADY_REVIEWED')
  })
})
