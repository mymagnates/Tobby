import { createHash } from 'node:crypto'

const fail = (message, code = 'INVENTORY_INVALID', status = 400) => {
  throw Object.assign(new Error(message), { code, status })
}
const text = (value, max = 2000) =>
  String(value || '')
    .trim()
    .slice(0, max)
const copy = (value) => JSON.parse(JSON.stringify(value))
const stages = new Set(['move_in', 'inspection', 'move_out'])
const itemKind = (...records) => records.some(record => record?.kind === 'access') ? 'access' : 'item'
const requireQuantity = quantity => {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999)
    fail('Access quantity must be an integer from 0 to 999.')
}
const snapshotRecord = record => record ? { kind: itemKind(record), ...Object.fromEntries(['name', 'area', 'quantity', 'condition', 'note', 'photos', 'batch_id', 'stage', 'confirmed_at'].filter(key => record[key] !== undefined).map(key => [key, copy(record[key])])) } : null
const moveOutEntry = (item, added = false) => ({
  item_id: item.id, name: item.name, area: item.area || 'Other',
  kind: itemKind(item, item.latest, item.baseline),
  ...(itemKind(item, item.latest, item.baseline) === 'access' ? { quantity: null } : {}),
  condition: 'not_checked', note: '', photos: [], action: 'record', checked: false,
  reference: snapshotRecord(item.latest?.stage === 'move_out' ? item.latest.reference : item.latest),
  move_in: snapshotRecord(item.baseline?.stage === 'move_in' ? item.baseline : null),
  added_at_move_out: added,
})

export function createInventoryWorkflow(legacy, context, now) {
  return {
    schema_version: 2,
    revision: 0,
    context,
    legacy_keys: legacy?.ktcs_items || null,
    items: (legacy?.custom_items || []).map((item, index) => ({
      id: `legacy-${index}`,
      area: text(item.area, 100),
      name: text(item.item, 160) || 'Item',
      kind: 'item',
      closed: false,
      baseline: null,
      latest: null,
      legacy: {
        move_in_comment: text(item.move_in_comment),
        move_out_comment: text(item.move_out_comment),
        move_in_photo_url: text(item.move_in_photo_url, 3000),
        move_out_photo_url: text(item.move_out_photo_url, 3000),
      },
    })),
    batch: null,
    created_at: now,
    updated_at: now,
  }
}

export function inventoryParticipant(state, actor) {
  if (actor.id === state.context.pm_user_id) return 'pm'
  if (actor.id && actor.id === state.context.tenant_user_id) return 'tenant'
  fail(
    'Only the assigned PM and primary tenant can change this inventory.',
    'PERMISSION_DENIED',
    403,
  )
}

export function validateSignature(signature) {
  if (!Array.isArray(signature) || !signature.length || signature.length > 100)
    fail('Please add your signature.')
  let points = 0
  for (const stroke of signature) {
    if (!Array.isArray(stroke) || !stroke.length) fail('Invalid signature.')
    for (const point of stroke) {
      if (
        !Array.isArray(point) ||
        point.length !== 2 ||
        point.some((n) => !Number.isFinite(n) || n < 0 || n > 1)
      )
        fail('Invalid signature.')
      points++
    }
  }
  if (points < 3 || points > 3000) fail('Please provide a complete signature (up to 3000 points).')
  return copy(signature)
}

function normalizeEntry(source, item, context, existing, moveOut = false) {
  const previousKind = itemKind(item, item.latest, item.baseline, existing, existing?.reference, existing?.move_in)
  const kind = source.kind === undefined ? previousKind : source.kind
  if (!['item', 'access'].includes(kind)) fail('Choose an item kind: item or access.')
  if (previousKind === 'access' && kind !== 'access') fail('Access items cannot be changed to ordinary items.')
  if (kind === 'access' && !(moveOut && source.quantity == null)) requireQuantity(source.quantity)
  const photos = Array.isArray(source.photos) ? source.photos : []
  if (photos.length > 12) fail('Use up to 12 photos per item in a check.')
  const normalized = photos.map((photo) => {
    const path = text(photo.path, 1500)
    if (
      !path.startsWith(
        `properties/${context.property_id}/inventory/${context.lease_id}/${item.id}/`,
      )
    )
      fail('Photo does not belong to this item.')
    if (!/^https:\/\//.test(photo.url || '')) fail('Wait for every photo to finish uploading.')
    return { path, url: text(photo.url, 3000) }
  })
  const condition = text(source.condition, 100)
  if (!['good', 'worn', 'damaged', 'missing', 'not_checked'].includes(condition))
    fail('Select an item condition.')
  const name = text(source.name || item.name, 160)
  if (!name) fail('An item name is required.')
  return {
    item_id: item.id,
    kind,
    ...(kind === 'access' ? { quantity: source.quantity ?? null } : {}),
    name,
    area: text(source.area ?? item.area, 100),
    condition,
    note: text(source.note),
    photos: normalized,
    action: 'record',
    checked: condition !== 'not_checked',
  }
}

export function applyInventoryCommand(previous, command, actor, now, id) {
  const state = copy(previous)
  const role = inventoryParticipant(state, actor)
  if (command.expected_revision !== state.revision)
    fail(
      'This list changed. Reload before saving; your unsaved input is still available.',
      'INVENTORY_CONFLICT',
      409,
    )
  const batch = state.batch
  // Older move-out records used scope "check"; stage identifies the workflow.
  if (batch?.stage === 'move_out') batch.scope = 'move_out'
  const requireDraft = () => {
    if (!batch || batch.status === 'confirmed')
      fail('Start a new check to change confirmed records.')
    if (batch.status === 'awaiting_confirmation') {
      batch.version += 1
      batch.status = 'draft'
      batch.signatures = {}
      batch.digest = null
    }
  }
  const entryFor = (itemId) => batch?.entries.find((entry) => entry.item_id === itemId)
  switch (command.type) {
    case 'start': {
      if (batch?.stage === 'move_out' && command.stage === 'move_out') break
      const withdrawPending = batch && batch.status !== 'confirmed' &&
        command.stage === 'move_out' &&
        command.withdraw_pending === true && batch.stage !== 'move_out'
      if (withdrawPending && role !== 'pm') fail('Only the property manager can withdraw the pending list.', 'PERMISSION_DENIED', 403)
      if (batch && batch.status !== 'confirmed' && !withdrawPending) fail('Continue the existing check first.')
      if (!stages.has(command.stage)) fail('Choose a check type.')
      if (command.stage === 'move_in' && state.move_in_confirmed)
        fail('The move-in record is already confirmed. Start an inspection instead.')
      state.batch = {
        id,
        stage: command.stage,
        version: 1,
        status: 'draft',
        signatures: {},
        created_at: now,
        entries: [],
        scope: command.stage === 'move_out' ? 'move_out' : command.scope === 'list' ? 'list' : 'check',
      }
      if (command.stage !== 'inspection' || command.scope === 'list') {
        state.batch.entries = state.items
          .filter((item) => !item.closed)
          .map((item) => ({
            item_id: item.id,
            name: item.name,
            area: item.area,
            kind: itemKind(item, item.latest, item.baseline),
            ...(item.latest?.quantity !== undefined ? { quantity: item.latest.quantity } : {}),
            condition: item.latest?.condition || 'not_checked',
            note: item.latest?.note || '',
            photos: copy(item.latest?.photos || []),
            action: 'record',
            checked: false,
          }))
      }
      if (state.batch.stage === 'move_out') {
        state.batch.entries = state.items.filter(item => !item.closed).map(item => moveOutEntry(item))
        if (withdrawPending) {
          for (const entry of state.batch.entries) {
            const pending = batch.entries.find(row => row.item_id === entry.item_id)
            if (!pending || pending.action === 'close') continue
            entry.name = pending.name
            entry.area = pending.area || 'Other'
            entry.kind = itemKind(entry, pending)
            if (entry.kind === 'access') entry.quantity = null
          }
        }
        state.batch.missing_move_in = !state.move_in_confirmed
      }
      break
    }
    case 'prepare_list': {
      if (batch?.stage === 'move_out') break
      requireDraft()
      batch.scope = 'list'
      for (const item of state.items.filter(row => !row.closed)) {
        if (!entryFor(item.id)) batch.entries.push({
          item_id: item.id, name: item.name, area: item.area,
          kind: itemKind(item, item.latest, item.baseline),
          ...(item.latest?.quantity !== undefined ? { quantity: item.latest.quantity } : {}),
          condition: item.latest?.condition || 'not_checked',
          note: item.latest?.note || '', photos: copy(item.latest?.photos || []),
          action: 'record', checked: false,
        })
      }
      break
    }
    case 'save_item': {
      requireDraft()
      let item = state.items.find((row) => row.id === command.item_id)
      if (!item && command.item_id) fail('Item not found.', 'ITEM_NOT_FOUND', 404)
      if (!item) {
        if (state.items.length >= 250) fail('This list has reached 250 items.')
        item = {
          id: command.new_item_id || id,
          name: text(command.entry?.name, 160),
          area: text(command.entry?.area, 100),
          closed: false,
          baseline: null,
          latest: null,
        }
        if (
          !/^[a-zA-Z0-9_-]{1,100}$/.test(item.id) ||
          state.items.some((row) => row.id === item.id)
        )
          fail('Invalid item identifier.')
        state.items.push(item)
      }
      if (item.closed) fail('This item is closed.')
      if (entryFor(item.id)?.action === 'close')
        fail('Resolve or withdraw the closure request before editing this item.')
      const entry = normalizeEntry(command.entry || {}, item, state.context, entryFor(item.id), batch.stage === 'move_out')
      const rooms = [...(state.rooms || []), ...state.items.map(row => row.area)].filter(Boolean)
      entry.area = rooms.find(room => room.toLowerCase() === entry.area.trim().toLowerCase()) || entry.area.trim() || 'Other'
      state.rooms = [...new Set([...rooms, entry.area])]
      if (batch.stage === 'move_out') {
        const previousEntry = entryFor(item.id) || moveOutEntry(item, true)
        Object.assign(entry, {
          reference: previousEntry.reference, move_in: previousEntry.move_in,
          added_at_move_out: previousEntry.added_at_move_out,
          checked: false,
        })
        const replaces = text(Object.hasOwn(command.entry || {}, 'replaces_item_id')
          ? command.entry.replaces_item_id
          : previousEntry.replaces_item_id, 100)
        if (replaces) {
          if (!entry.added_at_move_out || replaces === item.id || !state.items.some(row => row.id === replaces)) fail('Choose an existing item to link as replaced.')
          entry.replaces_item_id = replaces
        }
      }
      const index = batch.entries.findIndex((row) => row.item_id === item.id)
      if (index >= 0) batch.entries[index] = entry
      else batch.entries.push(entry)
      break
    }
    case 'review_item':
    case 'use_reference': {
      requireDraft()
      if (batch.stage !== 'move_out') fail('This inventory is not in the move-out phase. Reload its current state.', 'INVENTORY_PHASE_CHANGED', 409)
      const entry = entryFor(command.item_id)
      if (!entry) fail('Item not found.', 'ITEM_NOT_FOUND', 404)
      if (command.type === 'use_reference') {
        const reference = entry.move_in || entry.reference
        if (!reference || reference.condition === 'not_checked') fail('No recorded reference condition is available.')
        entry.condition = reference.condition
        entry.checked = false
        delete entry.checked_by
        delete entry.checked_at
      } else {
        if (command.checked !== false && entry.condition === 'not_checked') fail('Record the move-out condition before checking this item.')
        const item = state.items.find(row => row.id === entry.item_id)
        if (command.checked !== false && itemKind(entry, entry.reference, entry.move_in, item, item?.latest, item?.baseline) === 'access') requireQuantity(entry.quantity)
        entry.checked = command.checked !== false
        if (entry.checked) {
          entry.checked_by = actor.id
          entry.checked_at = now
        } else {
          delete entry.checked_by
          delete entry.checked_at
        }
      }
      break
    }
    case 'unchanged': {
      requireDraft()
      if (batch.stage === 'move_out') fail('Use the reference condition, then check each item explicitly.')
      if (!Array.isArray(command.item_ids) || !command.item_ids.length)
        fail('Select items to mark unchanged.')
      for (const itemId of new Set(command.item_ids)) {
        const item = state.items.find((row) => row.id === itemId)
        if (!item || item.closed || !item.latest)
          fail('Only previously confirmed items can be marked unchanged.')
        if (batch.stage === 'move_out' && itemKind(item, item.latest, item.baseline, entryFor(itemId)) === 'access')
          fail('Record the actual move-out access quantity instead of marking it unchanged.')
        const existing = entryFor(itemId)
        if (existing?.action === 'close') fail('Resolve the closure request first.')
        const entry = {
          ...copy(item.latest),
          item_id: itemId,
          kind: itemKind(item, item.latest, item.baseline),
          photos: [],
          note: '',
          unchanged_from: item.latest.batch_id,
          action: 'record',
          checked: true,
        }
        if (existing) Object.assign(existing, entry)
        else batch.entries.push(entry)
      }
      break
    }
    case 'request_close': {
      requireDraft()
      if (batch.stage === 'move_out') fail('Record the move-out condition instead of removing an item from this checklist.')
      const item = state.items.find((row) => row.id === command.item_id)
      if (!item || item.closed) fail('Active item not found.')
      if (!text(command.reason)) fail('A reason is required to request closure.')
      if (entryFor(item.id)?.action === 'close') fail('A closure request is already pending.')
      const existing = entryFor(item.id)
      const entry = {
        ...(existing || {
          item_id: item.id,
          name: item.name,
          area: item.area,
          photos: [],
          note: '',
          condition: 'not_checked',
        }),
        action: 'close',
        checked: true,
        closure: { reason: text(command.reason), requested_by: actor.id, requested_at: now },
        before_close: existing ? copy(existing) : null,
      }
      if (existing) Object.assign(existing, entry)
      else batch.entries.push(entry)
      break
    }
    case 'withdraw_close':
    case 'reject_close': {
      requireDraft()
      const entry = entryFor(command.item_id)
      if (entry?.action !== 'close') fail('No pending closure request.')
      if (command.type === 'withdraw_close' && entry.closure.requested_by !== actor.id)
        fail('Only the requester can withdraw.', 'PERMISSION_DENIED', 403)
      if (command.type === 'reject_close' && entry.closure.requested_by === actor.id)
        fail('Withdraw your own request instead.')
      const index = batch.entries.indexOf(entry)
      if (entry.before_close) batch.entries[index] = entry.before_close
      else batch.entries.splice(index, 1)
      break
    }
    case 'sign': {
      if (!batch || batch.status === 'confirmed') fail('No pending batch to sign.')
      const signingRole = command.signer_role || role
      const assisted = signingRole === 'tenant' && role === 'pm'
      if (!['pm', 'tenant'].includes(signingRole) || (signingRole !== role && !assisted))
        fail('You cannot sign for this role.', 'PERMISSION_DENIED', 403)
      if (assisted && command.capture_method !== 'in_person')
        fail('The tenant must sign in person on this device.')
      if (!state.context.tenant_user_id && !state.context.tenant_profile_id)
        fail('Add a tenant to this lease before signing.')
      if (state.context.tenant_user_id === state.context.pm_user_id)
        fail('The PM and primary tenant must be different accounts.')
      if (batch.version !== command.batch_version)
        fail('The batch version changed. Review the new version.', 'INVENTORY_CONFLICT', 409)
      if ((batch.stage === 'move_out' || batch.scope === 'list') && state.items.some(item => !item.closed && !entryFor(item.id)))
        fail('The list changed. Reload the complete list before signing.', 'INVENTORY_CONFLICT', 409)
      if (!batch.entries.length || ((batch.stage === 'move_out' || batch.scope !== 'list') && batch.entries.some((entry) => !entry.checked)))
        fail('Review every item before signing. Unchanged items can be checked together.')
      for (const entry of batch.entries) {
        const item = state.items.find(row => row.id === entry.item_id)
        if (entry.action !== 'close' && itemKind(entry, entry.reference, entry.move_in, item, item?.latest, item?.baseline) === 'access') requireQuantity(entry.quantity)
      }
      if (batch.signatures[signingRole]) fail('This party already signed this version.')
      const signature = validateSignature(command.signature)
      // Freeze participant details so later account activation cannot alter signed content.
      if (!Object.keys(batch.signatures).length) batch.signing_context = copy(state.context)
      batch.digest = createHash('sha256')
        .update(
          JSON.stringify({
            context: batch.signing_context || state.context,
            stage: batch.stage,
            version: batch.version,
            entries: batch.entries,
          }),
        )
        .digest('hex')
      batch.signatures[signingRole] = {
        user_id: assisted ? null : actor.id,
        tenant_profile_id: signingRole === 'tenant' ? state.context.tenant_profile_id || null : null,
        captured_by: actor.id,
        capture_method: assisted ? 'in_person' : 'authenticated',
        name: text(assisted ? state.context.tenant_name : actor.name || actor.email || actor.id, 200),
        email: assisted ? '' : text(actor.email, 200),
        role: signingRole,
        signed_at: now,
        strokes: signature,
        digest: batch.digest,
      }
      batch.status = 'awaiting_confirmation'
      if (batch.signatures.pm && batch.signatures.tenant) {
        batch.status = 'confirmed'
        batch.confirmed_at = now
        for (const entry of batch.entries) {
          const item = state.items.find((row) => row.id === entry.item_id)
          if (entry.action === 'close') {
            item.closed = true
            item.closed_at = now
            item.closed_batch_id = batch.id
          } else {
            item.name = entry.name
            item.area = entry.area
            item.kind = itemKind(entry, item, item.latest, item.baseline)
            item.latest = {
              ...copy(entry),
              batch_id: batch.id,
              stage: batch.stage,
              confirmed_at: now,
            }
            if (!item.baseline && batch.stage !== 'move_out') item.baseline = copy(item.latest)
          }
        }
        if (batch.stage === 'move_in') state.move_in_confirmed = true
      }
      break
    }
    default:
      fail('Unknown inventory action.')
  }
  state.revision++
  state.updated_at = now
  // Keep below Firestore's document limit; never truncate signed evidence.
  if (Buffer.byteLength(JSON.stringify(state)) > 650000)
    fail(
      'This check is too large. Reduce unsent photos or contact support.',
      'INVENTORY_TOO_LARGE',
      413,
    )
  return state
}
