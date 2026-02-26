/**
 * Marketplace module — state machines, matching engine, and business logic
 * for PM/PO <-> SP interaction (leads, bids, conversations, assignments).
 */

const nowIso = () => new Date().toISOString()

// ---------------------------------------------------------------------------
// Lead state machine
// ---------------------------------------------------------------------------

const LEAD_TRANSITIONS = {
  open: ['paused', 'assigned', 'cancelled'],
  paused: ['open', 'cancelled'],
  assigned: ['closed'],
  closed: [],
  cancelled: [],
}

export const canTransitionLead = (current, next) =>
  (LEAD_TRANSITIONS[current] || []).includes(next)

export const transitionLead = (lead, nextStatus, actorId) => {
  if (!canTransitionLead(lead.status, nextStatus)) {
    return { ok: false, code: 'INVALID_LEAD_TRANSITION', message: `Cannot move lead from "${lead.status}" to "${nextStatus}"` }
  }
  lead.status = nextStatus
  lead.updated_at = nowIso()
  return { ok: true, lead }
}

// ---------------------------------------------------------------------------
// Bid state machine
// ---------------------------------------------------------------------------

const BID_TRANSITIONS = {
  submitted: ['withdrawn', 'shortlisted', 'selected', 'rejected', 'expired'],
  shortlisted: ['selected', 'rejected', 'expired'],
  withdrawn: [],
  selected: [],
  rejected: [],
  expired: [],
}

export const canTransitionBid = (current, next) =>
  (BID_TRANSITIONS[current] || []).includes(next)

export const transitionBid = (bid, nextStatus, actorId) => {
  if (!canTransitionBid(bid.status, nextStatus)) {
    return { ok: false, code: 'INVALID_BID_TRANSITION', message: `Cannot move bid from "${bid.status}" to "${nextStatus}"` }
  }
  bid.status = nextStatus
  bid.status_changed_by = actorId
  bid.updated_at = nowIso()
  return { ok: true, bid }
}

// ---------------------------------------------------------------------------
// Assignment state machine
// ---------------------------------------------------------------------------

const ASSIGNMENT_TRANSITIONS = {
  pending_acceptance: ['active', 'declined'],
  active: ['revoked', 'completed'],
  declined: [],
  revoked: [],
  completed: [],
}

export const canTransitionAssignment = (current, next) =>
  (ASSIGNMENT_TRANSITIONS[current] || []).includes(next)

export const transitionAssignment = (assignment, nextStatus) => {
  if (!canTransitionAssignment(assignment.status, nextStatus)) {
    return { ok: false, code: 'INVALID_ASSIGNMENT_TRANSITION', message: `Cannot move assignment from "${assignment.status}" to "${nextStatus}"` }
  }
  assignment.status = nextStatus
  assignment.updated_at = nowIso()
  return { ok: true, assignment }
}

// ---------------------------------------------------------------------------
// Matching engine
// ---------------------------------------------------------------------------

/**
 * Mock AI extraction — in production this calls gpt-5-nano to parse free text
 * into structured semantic fields. Here we do a simple keyword-based extraction.
 */
export const extractSemanticTags = (text) => {
  const lower = (text || '').toLowerCase()
  const TAG_KEYWORDS = {
    plumbing: ['plumb', 'pipe', 'drain', 'leak', 'faucet', 'water heater', 'toilet'],
    electrical: ['electri', 'wiring', 'panel', 'outlet', 'circuit', 'breaker'],
    hvac: ['hvac', 'air condition', 'heating', 'furnace', 'thermostat', 'coil', 'refrigerant'],
    painting: ['paint', 'primer', 'exterior coat', 'repaint'],
    tile: ['tile', 'grout', 'grouting', 're-grout'],
    roofing: ['roof', 'shingle', 'gutter'],
    'garage-door': ['garage door', 'torsion spring', 'garage opener'],
    general: ['maintenance', 'repair', 'handyman', 'general'],
    drywall: ['drywall', 'wall repair', 'patch'],
  }

  const tags = []
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) tags.push(tag)
  }
  return tags.length ? tags : ['general']
}

/**
 * Compute match score between a lead and an SP profile.
 * Returns 0..1 where 1 is perfect match.
 */
export const computeMatchScore = (lead, spProfile) => {
  let score = 0
  let factors = 0

  // 1. Semantic tag overlap (weight: 0.4)
  const leadTags = new Set(lead.semantic_tags || [])
  const spTags = new Set(spProfile.semantic_tags || [])
  if (leadTags.size > 0 && spTags.size > 0) {
    let overlap = 0
    for (const t of leadTags) {
      if (spTags.has(t)) overlap++
    }
    score += 0.4 * (overlap / leadTags.size)
  }
  factors += 0.4

  // 2. Service category match (weight: 0.2)
  const leadCats = new Set(lead.semantic_tags || [])
  const spCats = new Set(spProfile.service_categories || [])
  if (leadCats.size > 0 && spCats.size > 0) {
    let catOverlap = 0
    for (const c of leadCats) {
      if (spCats.has(c)) catOverlap++
    }
    score += 0.2 * (catOverlap / Math.max(leadCats.size, 1))
  }
  factors += 0.2

  // 3. Urgency capability (weight: 0.15)
  const prefs = spProfile.match_preferences || {}
  const urgencyAccept = prefs.urgency_accept || ['normal']
  if (urgencyAccept.includes(lead.urgency || 'normal')) {
    score += 0.15
  }
  factors += 0.15

  // 4. Availability (weight: 0.15)
  if ((prefs.availability || 'available') === 'available') {
    score += 0.15
  }
  factors += 0.15

  // 5. Historical reliability bonus (weight: 0.1)
  const jobsDone = spProfile.total_jobs_completed || 0
  const reliabilityBonus = Math.min(jobsDone / 50, 1) * 0.1
  score += reliabilityBonus
  factors += 0.1

  return Math.min(score / factors, 1)
}

/**
 * Hard-filter SPs that are ineligible for a lead.
 */
export const hardFilterSp = (lead, spProfile) => {
  if (spProfile.verification_status !== 'approved') return false

  const prefs = spProfile.match_preferences || {}
  if (prefs.availability === 'unavailable') return false

  // Budget floor check — parse min from lead's budget_range like "$250–$600"
  if (prefs.min_budget != null && lead.budget_range) {
    const match = lead.budget_range.match(/\$?([\d,]+)/)
    if (match) {
      const leadMin = Number(match[1].replace(/,/g, ''))
      if (!isNaN(leadMin) && leadMin < prefs.min_budget) return false
    }
  }

  return true
}

/**
 * Find matched SPs for a lead, sorted by score descending.
 * @param {object} lead
 * @param {Map} spProfiles - Map<userId, spProfile>
 * @param {number} topK - max results
 * @returns {{ sp_id: string, score: number, business_name: string }[]}
 */
export const matchLeadToSps = (lead, spProfiles, topK = 20) => {
  const candidates = []
  for (const sp of spProfiles.values()) {
    if (!hardFilterSp(lead, sp)) continue
    const score = computeMatchScore(lead, sp)
    candidates.push({ sp_id: sp.user_id, score, business_name: sp.business_name })
  }
  candidates.sort((a, b) => b.score - a.score)
  return candidates.slice(0, topK)
}

/**
 * Check if a specific SP is eligible to view/bid on a lead.
 * For "public" leads: all approved SPs. For "matched_only": score > 0.
 */
export const isSpEligibleForLead = (lead, spProfile) => {
  if (lead.status !== 'open') return false
  if (lead.visibility_mode === 'public') return hardFilterSp(lead, spProfile)
  if (lead.visibility_mode === 'matched_only') {
    if (!hardFilterSp(lead, spProfile)) return false
    return computeMatchScore(lead, spProfile) > 0.1
  }
  // invite_only: would need an invite list — not enforced in MVP matching
  return false
}

// ---------------------------------------------------------------------------
// Business logic: select SP and close lead
// ---------------------------------------------------------------------------

/**
 * Select a winning bid, reject others, assign lead, create assignment.
 * @returns {{ ok: boolean, assignment?, error_code?, message? }}
 */
export const selectBidAndAssign = ({ store, lead, winningBid, actorId }) => {
  if (lead.status !== 'open' && lead.status !== 'paused') {
    return { ok: false, code: 'LEAD_NOT_OPEN', message: 'Lead is not open for selection' }
  }

  if (!['submitted', 'shortlisted'].includes(winningBid.status)) {
    return { ok: false, code: 'BID_NOT_SELECTABLE', message: `Bid status "${winningBid.status}" cannot be selected` }
  }

  // Transition winning bid to "selected"
  const bidResult = transitionBid(winningBid, 'selected', actorId)
  if (!bidResult.ok) return bidResult

  // Reject all other bids for this lead
  for (const bid of store.bids.values()) {
    if (bid.lead_id === lead.id && bid.id !== winningBid.id) {
      if (['submitted', 'shortlisted'].includes(bid.status)) {
        transitionBid(bid, 'rejected', actorId)
      }
    }
  }

  // Transition lead to "assigned"
  lead.status = 'assigned'
  lead.assigned_sp_id = winningBid.sp_id
  lead.assigned_bid_id = winningBid.id
  lead.updated_at = nowIso()

  // Link SP to the source task
  const task = store.tasks.get(lead.task_doc_id || lead.task_id)
  if (task) {
    task.assigned_sp_id = winningBid.sp_id
    task.updated_at = nowIso()
  }

  // Create assignment
  const assignment = store.createAssignment({
    lead,
    bid: winningBid,
    spId: winningBid.sp_id,
  })

  return { ok: true, assignment, lead, bid: winningBid }
}
