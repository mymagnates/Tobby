import { createHash, randomUUID } from 'node:crypto'
import {
  buildPropertyReport,
  buildPmStatement,
  isValidReportAmount,
  REPORT_TRANSACTION_CATEGORIES,
} from './reporting.js'

const MAX_PROPERTIES = 100
const MAX_ROWS = 5000
const fail = (status, code, message) => {
  throw Object.assign(new Error(message), { status, code })
}
const id = (value) => String(value || '').trim()
const validId = (value) => value && value.length <= 128 && !/[/,]/.test(value)
const includes = (values, userId) => Array.isArray(values) && values.includes(userId)
const name = (property) => String(property.nickname || property.address || property.id)
const hasFinance = (property, userId) =>
  includes(property.owner_user_ids, userId) || includes(property.manager_user_ids, userId)
const hasTasks = (property, userId) =>
  hasFinance(property, userId) || includes(property.viewer_user_ids, userId)
const categories = new Set(REPORT_TRANSACTION_CATEGORIES)

export function createReportingAccess({ getDb }) {
  const requireActor = ({ actor, verified }) => {
    if (!verified || !validId(id(actor?.id)))
      fail(401, 'UNAUTHENTICATED', 'Sign in to access reports.')
    return id(actor.id)
  }
  const profileFor = async (userId) => {
    const snap = await getDb().collection('users').doc(userId).get()
    return snap.exists ? snap.data() || {} : {}
  }
  const authorizedProperties = async (userId) => {
    const db = getDb()
    const properties = new Map()
    for (const field of ['owner_user_ids', 'manager_user_ids', 'viewer_user_ids']) {
      const snap = await db
        .collection('properties')
        .where(field, 'array-contains', userId)
        .limit(MAX_PROPERTIES + 1)
        .get()
      for (const doc of snap.docs) properties.set(doc.id, { ...doc.data(), id: doc.id })
    }
    if (properties.size > MAX_PROPERTIES)
      fail(422, 'REPORT_SCOPE_TOO_LARGE', 'Select specific properties to generate this report.')
    return [...properties.values()]
  }
  const requestedIds = (query) => {
    if (!query.has('property_ids')) return null
    const raw = query.get('property_ids')
    if (!raw?.trim()) fail(400, 'INVALID_PROPERTY_SCOPE', 'Select at least one property.')
    const ids = [...new Set(raw.split(',').map(id))]
    if (ids.length > MAX_PROPERTIES || ids.some((value) => !validId(value)))
      fail(400, 'INVALID_PROPERTY_SCOPE', 'Invalid property selection.')
    return ids
  }
  const propertyById = async (propertyId) => {
    if (!validId(propertyId)) fail(400, 'INVALID_PROPERTY_SCOPE', 'Invalid property selection.')
    const snap = await getDb().collection('properties').doc(propertyId).get()
    if (!snap.exists)
      fail(403, 'REPORT_ACCESS_DENIED', 'This property report is not available to your account.')
    return { ...snap.data(), id: snap.id }
  }
  const scopedProperties = async (userId, query, finance) => {
    const ids = requestedIds(query)
    const properties = ids
      ? await Promise.all(ids.map(propertyById))
      : await authorizedProperties(userId)
    const allowed = finance ? hasFinance : hasTasks
    if (ids && properties.some((property) => !allowed(property, userId)))
      fail(
        403,
        'REPORT_ACCESS_DENIED',
        'One or more selected properties are unavailable for this report.',
      )
    return properties.filter((property) => allowed(property, userId))
  }
  const propertyRows = async (properties, collectionName) => {
    const rows = []
    for (const property of properties) {
      const snap = await getDb()
        .collection('properties')
        .doc(property.id)
        .collection(collectionName)
        .limit(MAX_ROWS + 1)
        .get()
      // The path, not a client-supplied property_id or document id, owns this record.
      for (const doc of snap.docs)
        rows.push({
          ...doc.data(),
          id: doc.id,
          property_id: property.id,
          property_name: name(property),
        })
      if (rows.length > MAX_ROWS)
        fail(422, 'REPORT_TOO_LARGE', 'This report is too large. Select fewer properties.')
    }
    return rows
  }
  const accountFor = (userId, profile, properties) => ({
    id: userId,
    company_name: String(profile.company_name || profile.business_name || profile.company || ''),
    label: String(
      profile.company_name ||
        profile.business_name ||
        profile.full_name ||
        profile.user_name ||
        'My PM account',
    ),
    can_pm_statement:
      ['pm', 'pm_po'].includes(id(profile.account_type || profile.user_category).toLowerCase()) ||
      properties.some((property) => includes(property.manager_user_ids, userId)),
  })

  const options = async (context) => {
    const userId = requireActor(context)
    const [properties, profile] = await Promise.all([
      authorizedProperties(userId),
      profileFor(userId),
    ])
    return {
      properties: properties.map((property) => ({
        id: property.id,
        name: name(property),
        can_finance: hasFinance(property, userId),
        can_tasks: true,
        is_owner: includes(property.owner_user_ids, userId),
      })),
      account: accountFor(userId, profile, properties),
      basis_note:
        'Recorded property amounts, not ownership-share allocations. PM company names are display labels, not shared account access.',
    }
  }

  const workspace = async (context) => {
    const userId = requireActor(context)
    const { query } = context
    const type = query.get('type') || 'pnl'
    if (!['pnl', 'ledger', 'tasks', 'pm_statement'].includes(type))
      fail(400, 'INVALID_REPORT_TYPE', 'Unknown report type.')
    const from = query.get('from') || undefined
    const to = query.get('to') || undefined
    if (type === 'pm_statement') {
      const [properties, profile] = await Promise.all([
        authorizedProperties(userId),
        profileFor(userId),
      ])
      const account = accountFor(userId, profile, properties)
      if (!account.can_pm_statement)
        fail(403, 'REPORT_ACCESS_DENIED', 'A PM account is required for this statement.')
      const transactions = new Map()
      for (const field of ['from_account_id', 'to_account_id']) {
        const snap = await getDb()
          .collectionGroup('transactions')
          .where(field, '==', userId)
          .limit(MAX_ROWS + 1)
          .get()
        for (const doc of snap.docs) {
          const path = doc.ref.path.split('/')
          if (path.length !== 4 || path[0] !== 'properties' || path[2] !== 'transactions') continue
          const data = doc.data() || {}
          if (data.from_account_id !== userId && data.to_account_id !== userId) continue
          transactions.set(doc.ref.path, {
            ...data,
            id: doc.id,
            property_id: path[1],
            property_name: String(data.property_name || path[1]),
          })
        }
        if (snap.docs.length > MAX_ROWS || transactions.size > MAX_ROWS)
          fail(422, 'REPORT_TOO_LARGE', 'This statement is too large to generate in one request.')
      }
      const selectedIds = requestedIds(query)
      // Past transactions remain available to their named participant, without reopening property access.
      const ownRows = [...transactions.values()]
      const knownIds = new Set([
        ...properties.filter((p) => hasFinance(p, userId)).map((p) => p.id),
        ...ownRows.map((row) => row.property_id),
      ])
      if (selectedIds?.some((propertyId) => !knownIds.has(propertyId)))
        fail(
          403,
          'REPORT_ACCESS_DENIED',
          'One or more selected properties are unavailable for this statement.',
        )
      const result = buildPmStatement({
        accountId: userId,
        accountLabel: account.label,
        transactions: selectedIds
          ? ownRows.filter((row) => selectedIds.includes(row.property_id))
          : ownRows,
        properties,
        from,
        to,
      })
      result.warnings = [
        ...(result.warnings || []),
        'Historical role-only PM transactions are not attributed to this account. Only explicitly identified account transactions are included.',
      ]
      return result
    }
    const properties = await scopedProperties(userId, query, type !== 'tasks')
    const rows = await propertyRows(properties, type === 'tasks' ? 'mxrecords' : 'transactions')
    return buildPropertyReport({
      type,
      properties,
      transactions: type === 'tasks' ? [] : rows,
      tasks: type === 'tasks' ? rows : [],
      from,
      to,
    })
  }

  const participants = async (context) => {
    const userId = requireActor(context)
    const property = await propertyById(id(context.query.get('property_id')))
    if (!hasFinance(property, userId))
      fail(403, 'REPORT_ACCESS_DENIED', 'Owner or manager access is required.')
    const ids = [
      ...new Set(Array.isArray(property.manager_user_ids) ? property.manager_user_ids : []),
    ].filter(validId)
    if (ids.length > 100)
      fail(422, 'TOO_MANY_PARTICIPANTS', 'This property has too many managers to list.')
    return {
      participants: await Promise.all(
        ids.map(async (accountId) => {
          const profile = await profileFor(accountId)
          return {
            id: accountId,
            role: 'pm',
            label: String(
              profile.full_name || profile.user_name || profile.company_name || accountId,
            ),
          }
        }),
      ),
    }
  }

  const createTransaction = async (context) => {
    const userId = requireActor(context)
    const propertyId = id(context.params.propertyId)
    const property = await propertyById(propertyId)
    if (!hasFinance(property, userId))
      fail(403, 'REPORT_ACCESS_DENIED', 'Owner or manager access is required.')
    const input = context.body || {}
    const amount = Number(input.amount)
    if (!isValidReportAmount(input.amount))
      fail(400, 'INVALID_AMOUNT', 'Enter a positive amount with at most two decimal places.')
    const date = id(input.transac_date)
    const parsedDate = new Date(`${date}T00:00:00Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    )
      fail(400, 'INVALID_TRANSACTION_DATE', 'Enter a valid transaction date.')
    if (input.currency && input.currency !== 'USD')
      fail(400, 'UNSUPPORTED_CURRENCY', 'This report currently supports USD transactions only.')
    const category = id(input.financial_category || 'unclassified')
    if (!categories.has(category))
      fail(400, 'INVALID_CATEGORY', 'Choose a valid financial category.')
    const role = (value) =>
      ({
        owner: 'po',
        manager: 'pm',
        tenant: 'tt',
        'property manager': 'pm',
        'property owner': 'po',
        'service provider': 'sp',
      })[id(value).toLowerCase()] || id(value).toLowerCase()
    const from = role(input.transac_from)
    const to = role(input.transac_to)
    if (![from, to].every((value) => ['pm', 'po', 'tt', 'sp', 'other'].includes(value)))
      fail(400, 'INVALID_PARTIES', 'Choose a payer and payee.')
    const partyId = (side, partyRole) => {
      if (partyRole !== 'pm') return null
      const accountId = id(input[`${side}_account_id`])
      if (!validId(accountId) || !includes(property.manager_user_ids, accountId))
        fail(400, 'INVALID_PM_PARTICIPANT', 'Select a current property manager for each PM party.')
      return accountId
    }
    const fromAccountId = partyId('from', from)
    const toAccountId = partyId('to', to)
    const pictureUrl = String(input.picture_url || '')
    if (pictureUrl) {
      let url, storagePath
      try {
        url = new URL(pictureUrl)
        const match = url.pathname.match(/^\/v0\/b\/[^/]+\/o\/(.+)$/)
        storagePath = match ? decodeURIComponent(match[1]) : ''
      } catch { fail(400, 'INVALID_TRANSACTION_IMAGE', 'Choose a successfully uploaded photo.') }
      if (pictureUrl.length > 2048 || url.protocol !== 'https:' || url.hostname !== 'firebasestorage.googleapis.com' || !storagePath)
        fail(400, 'INVALID_TRANSACTION_IMAGE', 'Choose a successfully uploaded photo.')
      const reservations = await getDb().collection('storage_upload_reservations').where('storage_path', '==', storagePath).limit(10).get()
      if (!reservations.docs.some((snap) => {
        const upload = snap.data()
        return upload.status === 'committed' && upload.user_id === userId &&
          upload.property_id === propertyId && String(upload.content_type).startsWith('image/') &&
          upload.download_token === url.searchParams.get('token')
      })) fail(403, 'TRANSACTION_IMAGE_ACCESS_DENIED', 'This photo does not belong to your upload for this property.')
    }
    const docId = randomUUID()
    const now = new Date().toISOString()
    const record = {
      transac_id: docId,
      property_id: propertyId,
      property_name: name(property),
      amount,
      currency: 'USD',
      transac_date: date,
      transac_type: id(input.transac_type).slice(0, 80),
      transac_from: from,
      transac_to: to,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      financial_category: category,
      note: String(input.note || '').slice(0, 10000),
      picture_url: pictureUrl,
      created_by: userId,
      created_by_user_id: userId,
      created_datetime: now,
      role: includes(property.manager_user_ids, userId) ? 'pm' : 'po',
      created_by_role: includes(property.manager_user_ids, userId) ? 'pm' : 'po',
      attribution_version: 1,
    }
    const propertyRef = getDb().collection('properties').doc(propertyId)
    const key = context.req?.headers?.['idempotency-key']
    if (key !== undefined) {
      if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(key))
        fail(400, 'INVALID_IDEMPOTENCY_KEY', 'Use a valid transaction submission identifier.')
      const digest = (value) => createHash('sha256').update(value).digest('hex')
      const submission = propertyRef.collection('transaction_submissions').doc(digest(`${userId}:${key}`))
      const fingerprint = digest(JSON.stringify({
        amount, date, category, from, to, fromAccountId, toAccountId,
        transac_type: record.transac_type, note: record.note, picture_url: record.picture_url,
      }))
      return getDb().runTransaction(async (tx) => {
        const currentProperty = await tx.get(propertyRef)
        if (!currentProperty.exists || !hasFinance(currentProperty.data(), userId))
          fail(403, 'REPORT_ACCESS_DENIED', 'Owner or manager access is required.')
        const prior = await tx.get(submission)
        if (prior.exists) {
          if (prior.data().fingerprint !== fingerprint)
            fail(409, 'IDEMPOTENCY_CONFLICT', 'This submission already saved a different transaction.')
          const saved = await tx.get(propertyRef.collection('transactions').doc(prior.data().id))
          if (!saved.exists) fail(409, 'TRANSACTION_REMOVED', 'The previously saved transaction is no longer available.')
          return { id: saved.id, transaction: saved.data() }
        }
        tx.set(propertyRef.collection('transactions').doc(docId), record)
        tx.set(submission, { id: docId, fingerprint, user_id: userId })
        return { id: docId, transaction: record }
      })
    }
    await propertyRef.collection('transactions').doc(docId).set(record)
    return { id: docId, transaction: record }
  }

  return { options, workspace, participants, createTransaction }
}
