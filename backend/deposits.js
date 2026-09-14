import { createHash } from 'node:crypto'
import { isValidReportAmount, parseReportPeriod } from './reporting.js'

const fail = (status, code, message) => {
  throw Object.assign(new Error(message), { status, code })
}
const validId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(id)
const ended = (lease) =>
  lease.archived || ['Archived', 'Expired', 'Terminated', 'Ended', 'Closed'].includes(lease.status)
const finance = (p, uid) =>
  [p.owner_user_ids, p.manager_user_ids].some((ids) => Array.isArray(ids) && ids.includes(uid))
const isDeposit = (row) =>
  row.financial_category === 'security_deposit' ||
  (!row.financial_category && row.transac_type === 'Deposit')
const zero = () => ({
  version: 0,
  received_cents: 0,
  refunded_cents: 0,
  deducted_cents: 0,
  balance_cents: 0,
  settled: false,
})
const cents = (amount) => {
  if (!isValidReportAmount(amount))
    fail(400, 'INVALID_AMOUNT', 'Enter a positive amount with at most two decimals.')
  return Math.round(Number(amount) * 100)
}
const dollar = (cents) => cents / 100

export function depositSummary(lease, account = zero()) {
  const expected = Number(lease.deposit || 0)
  const balance = account.balance_cents || 0
  const received = account.received_cents || 0
  let status = 'held'
  if (account.settled) status = 'settled'
  else if (ended(lease) || (account.version > 0 && balance === 0)) status = 'pending_settlement'
  else if (!received) status = expected > 0 ? 'not_received' : 'not_required'
  else if (received < Math.round(expected * 100)) status = 'partially_received'
  return {
    lease_id: lease.id,
    label: lease.LSID || lease.id,
    lease_status: lease.status || '',
    expected: Number.isFinite(expected) && expected >= 0 ? expected : null,
    received: dollar(received),
    refunded: dollar(account.refunded_cents || 0),
    deducted: dollar(account.deducted_cents || 0),
    balance: dollar(balance),
    version: account.version || 0,
    status,
  }
}

export function applyDepositEntry(account, entry, original) {
  const next = { ...zero(), ...account }
  const action = entry.action
  if (action === 'reopen') {
    if (!next.settled) fail(409, 'NOT_SETTLED', 'This deposit is already open.')
    next.settled = false
  } else {
    if (next.settled) fail(409, 'DEPOSIT_SETTLED', 'Reopen the deposit before making changes.')
    if (action === 'settle') {
      if (next.balance_cents !== 0)
        fail(
          409,
          'DEPOSIT_HAS_BALANCE',
          'Refund or allocate the remaining balance before settling.',
        )
      next.settled = true
    } else {
      let amount = entry.amount_cents
      let kind = action
      if (action === 'reversal') {
        if (!original || !['receipt', 'refund', 'deduction'].includes(original.action))
          fail(400, 'INVALID_REVERSAL', 'Choose a receipt, refund or deduction to reverse.')
        amount = -original.amount_cents
        kind = original.action
      }
      if (kind === 'receipt') {
        next.received_cents += amount
        next.balance_cents += amount
      } else if (kind === 'refund') {
        next.refunded_cents += amount
        next.balance_cents -= amount
      } else if (kind === 'deduction') {
        next.deducted_cents += amount
        next.balance_cents -= amount
      } else fail(400, 'INVALID_DEPOSIT_ACTION', 'Unsupported deposit action.')
      for (const field of ['received_cents', 'refunded_cents', 'deducted_cents', 'balance_cents']) {
        const value = next[field]
        if (value < 0)
          fail(
            409,
            'INSUFFICIENT_DEPOSIT',
            'This action exceeds the available deposit or reverses funds already used.',
          )
        if (!Number.isSafeInteger(value) || (value > 0 && !isValidReportAmount(dollar(value))))
          fail(400, 'INVALID_AMOUNT', 'The resulting balance exceeds the supported range.')
      }
    }
  }
  next.version += 1
  return next
}

export function createDepositService({ getDb }) {
  const actorId = (ctx) => {
    if (!ctx.verified || !validId(ctx.actor?.id))
      fail(401, 'UNAUTHENTICATED', 'Sign in to manage deposits.')
    if (!validId(ctx.params?.propertyId)) fail(400, 'INVALID_PROPERTY', 'Choose a valid property.')
    return ctx.actor.id
  }
  const refs = (ctx) => {
    const db = getDb(),
      propertyId = ctx.params.propertyId
    return {
      db,
      propertyId,
      property: db.collection('properties').doc(propertyId),
      root: db.collection('property_deposits').doc(propertyId),
    }
  }
  const authorize = (snap, uid) => {
    if (!snap.exists || !finance(snap.data(), uid))
      fail(403, 'DEPOSIT_ACCESS_DENIED', 'Owner or manager access to this property is required.')
  }
  const verifyLease = (snap, propertyId) => {
    const lease = snap.exists ? snap.data() : null
    const linked =
      lease?.property_string_id ||
      (typeof lease?.property_id === 'string' ? lease.property_id : lease?.property_id?.id)
    if (!lease || linked !== propertyId)
      fail(403, 'DEPOSIT_ACCESS_DENIED', 'This lease does not belong to the selected property.')
    return { ...lease, id: snap.id }
  }
  const bounded = async (query, max = 1000, read = (query) => query.get()) => {
    const snap = await read(query.limit(max + 1))
    if (snap.docs.length > max)
      fail(422, 'DEPOSIT_TOO_LARGE', 'Too many records to load safely. Contact support.')
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
  }
  const getLease = async (ctx) => {
    const uid = actorId(ctx),
      r = refs(ctx)
    if (!validId(ctx.params.leaseId)) fail(400, 'INVALID_LEASE', 'Choose a valid lease.')
    return r.db.runTransaction(
      async (tx) => {
        authorize(await tx.get(r.property), uid)
        const lease = verifyLease(
          await tx.get(r.db.collection('leases').doc(ctx.params.leaseId)),
          r.propertyId,
        )
        const account = await tx.get(r.root.collection('accounts').doc(lease.id))
        const entries = await bounded(
          r.root.collection('entries').where('lease_id', '==', lease.id),
          1000,
          (query) => tx.get(query),
        )
        const reversed = new Set(
          entries.filter((e) => e.action === 'reversal').map((e) => e.reverses_id),
        )
        return {
          summary: depositSummary(lease, account.exists ? account.data() : zero()),
          entries: entries
            .sort((a, b) => a.version - b.version)
            .map((e) => ({
              ...e,
              amount: dollar(e.amount_cents || 0),
              reversed: reversed.has(e.id),
            })),
          currency: 'USD',
        }
      },
      { readOnly: true },
    )
  }
  const getProperty = async (ctx) => {
    const uid = actorId(ctx),
      r = refs(ctx)
    authorize(await r.property.get(), uid)
    const leases = await bounded(
      r.db.collection('leases').where('property_string_id', '==', r.propertyId),
      200,
    )
    const accounts = await bounded(r.root.collection('accounts'), 200)
    const byId = new Map(accounts.map((a) => [a.id, a]))
    const rows = leases.map((lease) => depositSummary(lease, byId.get(lease.id)))
    for (const account of accounts)
      if (!leases.some((l) => l.id === account.id))
        rows.push({
          ...depositSummary({ id: account.id, LSID: 'Lease unavailable', deposit: 0 }, account),
          status: 'needs_review',
        })
    const sources = new Set(
      (await bounded(r.root.collection('sources'), 5000))
        .filter((s) => !s.reversed)
        .map((s) => s.id),
    )
    const transactions = await bounded(r.property.collection('transactions'), 5000)
    const unlinked = transactions
      .filter((t) => isDeposit(t) && !t.deposit_entry_id && !sources.has(t.id))
      .map((t) => ({
        id: t.id,
        date: t.transac_date || '',
        amount: t.amount,
        type: t.transac_type || '',
        importable:
          ['Deposit', 'Refund'].includes(t.transac_type) &&
          isValidReportAmount(t.amount) &&
          !!t.transac_date &&
          (!t.currency || t.currency === 'USD'),
      }))
    return { accounts: rows, unlinked, currency: 'USD' }
  }
  const postEntry = async (ctx) => {
    const uid = actorId(ctx),
      r = refs(ctx),
      body = ctx.body || {},
      leaseId = ctx.params.leaseId
    if (!validId(leaseId) || !validId(body.operation_id))
      fail(400, 'INVALID_OPERATION', 'A lease and unique operation ID are required.')
    if (!Number.isInteger(body.expected_version) || body.expected_version < 0)
      fail(400, 'INVALID_VERSION', 'Reload the deposit before saving.')
    const action = body.action
    if (
      !['receipt', 'refund', 'deduction', 'reversal', 'settle', 'reopen', 'import'].includes(action)
    )
      fail(400, 'INVALID_DEPOSIT_ACTION', 'Choose a deposit action.')
    const date = body.date
    if (!date) fail(400, 'INVALID_DATE', 'A date is required.')
    parseReportPeriod({ from: date })
    const note = String(body.note || '').trim()
    if (!note || note.length > 2000)
      fail(400, 'NOTE_REQUIRED', 'Add a short description or reference for this action.')
    if (
      action === 'deduction' &&
      (!['rent', 'repair', 'other'].includes(body.reason) || body.accounting_confirmed !== true)
    )
      fail(
        400,
        'DEDUCTION_REVIEW_REQUIRED',
        'Select the purpose and confirm that any P&L entry is handled separately.',
      )
    if (action === 'settle' && body.reconciliation_confirmed !== true)
      fail(
        400,
        'RECONCILIATION_REQUIRED',
        'Confirm that all deposit records have been reviewed and no actions remain pending.',
      )
    if (action === 'reversal' && !validId(body.reverses_id))
      fail(400, 'INVALID_REVERSAL', 'Choose the original entry.')
    if (action === 'import' && !validId(body.source_transaction_id))
      fail(400, 'INVALID_SOURCE', 'Choose a legacy transaction.')
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify({
          action,
          date,
          note,
          amount: body.amount ?? null,
          reason: body.reason || '',
          source: body.source_transaction_id || '',
          reversal: body.reverses_id || '',
          confirmation: body.accounting_confirmed === true,
        }),
      )
      .digest('hex')
    const entryRef = r.root.collection('entries').doc(body.operation_id)
    await r.db.runTransaction(async (tx) => {
      const accountRef = r.root.collection('accounts').doc(leaseId)
      const [propertySnap, leaseSnap, accountSnap, existing] = await Promise.all([
        tx.get(r.property),
        tx.get(r.db.collection('leases').doc(leaseId)),
        tx.get(accountRef),
        tx.get(entryRef),
      ])
      authorize(propertySnap, uid)
      verifyLease(leaseSnap, r.propertyId)
      if (existing.exists) {
        const old = existing.data()
        if (old.fingerprint !== fingerprint || old.lease_id !== leaseId || old.actor_id !== uid)
          fail(409, 'OPERATION_CONFLICT', 'This operation ID has already been used.')
        return
      }
      const account = accountSnap.exists ? accountSnap.data() : zero()
      if (account.version !== body.expected_version)
        fail(
          409,
          'DEPOSIT_VERSION_CONFLICT',
          'The deposit changed. Reload before recording another action.',
        )
      let original, source, markerRef, reversedSourceRef
      if (action === 'reversal') {
        const originalSnap = await tx.get(r.root.collection('entries').doc(body.reverses_id))
        original = originalSnap.exists ? originalSnap.data() : null
        markerRef = r.root.collection('reversals').doc(body.reverses_id)
        const marker = await tx.get(markerRef)
        if (!original || original.lease_id !== leaseId || marker.exists)
          fail(409, 'INVALID_REVERSAL', 'This entry is unavailable or already reversed.')
        if (original.source_transaction_id) {
          reversedSourceRef = r.root.collection('sources').doc(original.source_transaction_id)
          const sourceMarker = await tx.get(reversedSourceRef)
          if (!sourceMarker.exists || sourceMarker.data().entry_id !== original.id)
            fail(
              409,
              'INVALID_REVERSAL',
              'The source association has changed. Reload before correcting it.',
            )
        }
      }
      if (action === 'import') {
        const sourceSnap = await tx.get(
          r.property.collection('transactions').doc(body.source_transaction_id),
        )
        markerRef = r.root.collection('sources').doc(body.source_transaction_id)
        const marker = await tx.get(markerRef)
        source = sourceSnap.exists ? sourceSnap.data() : null
        if (
          !source ||
          !isDeposit(source) ||
          !['Deposit', 'Refund'].includes(source.transac_type) ||
          source.deposit_entry_id ||
          (marker.exists && !marker.data().reversed) ||
          (source.currency && source.currency !== 'USD')
        )
          fail(
            409,
            'INVALID_SOURCE',
            'This transaction is not an unlinked USD deposit transaction.',
          )
        parseReportPeriod({ from: source.transac_date })
        if (!source.transac_date)
          fail(400, 'INVALID_SOURCE', 'Correct the source transaction date before linking.')
      }
      const amount =
        action === 'import'
          ? cents(source.amount)
          : ['receipt', 'refund', 'deduction'].includes(action)
            ? cents(body.amount)
            : action === 'reversal'
              ? original.amount_cents
              : 0
      const entry = {
        id: body.operation_id,
        lease_id: leaseId,
        property_id: r.propertyId,
        action:
          action === 'import' ? (source.transac_type === 'Refund' ? 'refund' : 'receipt') : action,
        amount_cents: amount,
        date: source?.transac_date || date,
        note,
        reason: action === 'deduction' ? body.reason : null,
        accounting_confirmed: action === 'deduction',
        reverses_id: body.reverses_id || null,
        source_transaction_id: body.source_transaction_id || null,
        actor_id: uid,
        recorded_at: new Date().toISOString(),
        fingerprint,
      }
      const next = applyDepositEntry(account, entry, original)
      entry.version = next.version
      tx.set(accountRef, {
        ...next,
        property_id: r.propertyId,
        lease_id: leaseId,
        updated_at: entry.recorded_at,
      })
      tx.set(entryRef, entry)
      if (markerRef) tx.set(markerRef, { entry_id: entry.id, lease_id: leaseId })
      if (reversedSourceRef)
        tx.set(reversedSourceRef, { entry_id: original.id, lease_id: leaseId, reversed: true })
      // Importing already-recorded cash must never create another general-ledger transaction.
      // Reversing an import corrects its lease association, not the existing cash transaction.
      if (!source && !reversedSourceRef && amount > 0) {
        const refund =
          entry.action === 'refund' ||
          (entry.action === 'reversal' && original.action === 'receipt')
        tx.set(r.property.collection('transactions').doc(`deposit-${entry.id}`), {
          transac_id: `deposit-${entry.id}`,
          property_id: r.propertyId,
          lease_id: leaseId,
          amount: dollar(amount),
          currency: 'USD',
          transac_date: entry.date,
          financial_category: 'security_deposit',
          transac_type: refund ? 'Refund' : entry.action === 'receipt' ? 'Deposit' : 'Other',
          deposit_entry_id: entry.id,
          deposit_action: entry.action,
          note: `Deposit ${entry.action}: ${note}. Non-P&L; any rent/compensation accounting is separate.`,
          created_by: uid,
          created_datetime: entry.recorded_at,
        })
      }
    })
    return getLease(ctx)
  }
  return { getLease, getProperty, postEntry }
}
