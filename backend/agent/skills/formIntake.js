import { callStructuredModel } from '../llm/modelRouter.js'
import { buildAgentIntakeSystemInstruction, buildAgentIntakeUserPayload } from '../prompts/intakePrompt.js'

const classifyIssueCategory = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (
    /floor|flooring|spc|vinyl plank|lvp|laminate|tile|carpet|hardwood|baseboard|quarter round|trim|shoe molding|molding/.test(
      value,
    )
  ) {
    return 'flooring_finish'
  }
  if (/leak|drip|pipe|toilet|sink|faucet|water|plumbing/.test(value)) return 'plumbing'
  if (/sparks|outlet|breaker|power|electrical|wiring|light/.test(value)) return 'electrical'
  if (/\bac\b|air\s*conditioning|hvac|heat\b|heater|thermostat|furnace|cooling/.test(value)) {
    return 'hvac'
  }
  if (/washer|dryer|dishwasher|fridge|refrigerator|stove|oven/.test(value)) return 'appliance'
  return 'general_maintenance'
}

const classifyUrgency = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/fire|smoke|gas|sparks|flood|no power|electrical shock/.test(value)) return 'high'
  if (/leak|broken|not working|failed|overflow|clog/.test(value)) return 'medium'
  return 'low'
}

const detectEntityType = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/(transaction|payment|paid|pay|invoice|rent|deposit|refund|fee|charge|transfer)/.test(value)) {
    return 'transaction'
  }
  if (
    /(service|vendor|provider|contract|company|loan|insurance|pest control|lawn|pool|cleaning|security|alarm|trash|waste|snow removal)/.test(
      value,
    )
  ) {
    return 'service'
  }
  if (/(remind|reminder|due|renewal|renew|schedule|scheduled|recurring|monthly|weekly|yearly|annual)/.test(value)) {
    return 'reminder'
  }
  if (/(asset|appliance|equipment|serial|model|warranty|install|installed|purchase|purchased)/.test(value)) {
    return 'asset'
  }
  return 'task'
}

const detectTransactionType = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/rent/.test(value)) return 'Rent'
  if (/deposit/.test(value)) return 'Deposit'
  if (/tax/.test(value)) return 'Tax'
  if (/insurance/.test(value)) return 'Insurance'
  if (/utility|electric|water|gas|trash|sewer/.test(value)) return 'Utility'
  if (/maintenance|repair|fix/.test(value)) return 'Maintenance'
  if (/labor|service/.test(value)) return 'Labor'
  if (/hoa/.test(value)) return 'HOA'
  if (/refund/.test(value)) return 'Refund'
  if (/fee|charge/.test(value)) return 'Fee'
  return 'Other'
}

const detectAssetType = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/water heater|heater|ac|hvac|furnace|thermostat|air handler|compressor/.test(value)) return 'HVAC'
  if (/dishwasher|washer|dryer|fridge|refrigerator|stove|oven|microwave|appliance/.test(value)) return 'Appliance'
  if (/outlet|breaker|panel|switch|electrical|light|wiring/.test(value)) return 'Electrical'
  if (/toilet|sink|faucet|pipe|plumbing|drain|garbage disposal/.test(value)) return 'Plumbing'
  if (/camera|alarm|detector|safety|sensor|extinguisher/.test(value)) return 'Safety'
  if (/gate|door|window|roof|gutter|fence|garage/.test(value)) return 'Exterior'
  if (/sofa|chair|table|bed|furniture/.test(value)) return 'Furniture'
  if (/pool|spa|hot tub/.test(value)) return 'Pool/Spa'
  return 'Other'
}

const detectAssetLocation = (text = '') => {
  const value = String(text || '').toLowerCase()
  const knownLocations = [
    'kitchen',
    'laundry room',
    'garage',
    'basement',
    'bathroom',
    'primary bathroom',
    'guest bathroom',
    'living room',
    'dining room',
    'main bedroom',
    'office',
    'patio',
    'deck',
    'roof',
    'back yard',
    'front yard',
    'hvac closet',
    'utility room',
    'mechanical room',
    'water heater closet',
  ]
  const match = knownLocations.find((location) => value.includes(location))
  if (!match) return ''
  return match
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const extractTaggedValue = (text = '', pattern) => {
  const match = String(text || '').match(pattern)
  return match?.[1]?.trim() || ''
}

const detectReminderCategory = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/rent/.test(value)) return 'rent'
  if (/hoa/.test(value)) return 'hoa'
  if (/tax/.test(value)) return 'tax'
  if (/maintenance|repair|fix/.test(value)) return 'maintenance'
  if (/labor|service/.test(value)) return 'labor'
  if (/fee|charge/.test(value)) return 'fee'
  return 'other'
}

const detectReminderRepeat = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/daily|every day/.test(value)) return 'daily'
  if (/weekly|every week/.test(value)) return 'weekly'
  if (/monthly|every month/.test(value)) return 'monthly'
  if (/yearly|annual|annually|every year/.test(value)) return 'yearly'
  return 'one-time'
}

const detectServiceType = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/loan|mortgage|lender/.test(value)) return 'loan'
  if (/insurance|insurer|policy/.test(value)) return 'insurance'
  if (/pest|termite|exterminat/.test(value)) return 'pest_control'
  if (/lawn|yard|landscap|grass/.test(value)) return 'lawn'
  if (/\bpool\b|spa|hot tub/.test(value)) return 'pool'
  if (/clean|janitor|maid/.test(value)) return 'cleaning'
  if (/\bhvac\b|air conditioning|\bac\b|furnace|heating|cooling/.test(value)) return 'hvac'
  if (/plumb|pipe|drain|toilet|sink/.test(value)) return 'plumbing'
  if (/electric|outlet|breaker|wiring|panel/.test(value)) return 'electrical'
  if (/security|alarm|camera|monitoring/.test(value)) return 'security'
  if (/trash|waste|garbage|sewer/.test(value)) return 'trash'
  if (/snow/.test(value)) return 'snow_removal'
  return 'loan'
}

const detectRecurring = (text = '') => {
  const value = String(text || '').toLowerCase()
  return /(recurring|ongoing|monthly|weekly|yearly|annual|annually|quarterly|every month|every week|every year|contract)/.test(value)
}

const extractCompanyName = (text = '') => {
  const value = String(text || '').trim()
  const match = value.match(/\b(?:with|from|by|company|provider|vendor)\s+([A-Za-z0-9&.,' -]{2,80})/i)
  if (!match?.[1]) return ''
  return match[1]
    .replace(/\b(?:phone|tel|mobile|email|website|url|contact|agent)\b.*$/i, '')
    .trim()
}

const extractAmount = (text = '') => {
  const match = String(text || '').match(
    /(?:\$|\b)(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?:\b|$)/,
  )
  if (!match) return null
  const normalized = match[1].replace(/,/g, '')
  const value = Number.parseFloat(normalized)
  return Number.isNaN(value) ? null : value
}

const callModelIntake = async ({
  rawText,
  context,
  apiKey,
  model,
  provider,
  vertexProjectId,
  vertexLocation,
  vertexPublisher,
}) => {
  const systemInstruction = buildAgentIntakeSystemInstruction()
  const payload = buildAgentIntakeUserPayload({ rawText, context })
  const result = await callStructuredModel({
    provider,
    systemInstruction,
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: 'application/json' },
    geminiApiKey: apiKey,
    model,
    vertexProjectId,
    vertexLocation,
    vertexPublisher,
  })
  return result?.parsed || null
}

const buildFallbackDraft = ({ rawText, context, photos, videos, attachments }) => {
  const entityType = detectEntityType(rawText)
  const missingFields = []

  if (entityType === 'transaction') {
    const draft = {
      property_id: context?.property_id || null,
      transac_type: detectTransactionType(rawText),
      transac_from: '',
      transac_to: '',
      amount: extractAmount(rawText),
      transac_date: new Date().toISOString().split('T')[0],
      note: rawText || '',
    }
    if (!draft.property_id) missingFields.push('property_id')
    if (!draft.transac_type) missingFields.push('transac_type')
    return { entity_type: 'transaction', draft, missing_fields: missingFields }
  }

  if (entityType === 'asset') {
    const draft = {
      property_id: context?.property_id || null,
      nickname: rawText.slice(0, 80) || 'New asset',
      type: context?.asset_type_hint || detectAssetType(rawText),
      location: context?.asset_location_hint || detectAssetLocation(rawText),
      brand: extractTaggedValue(rawText, /\b(?:brand|manufacturer)\s*[:#-]?\s*([A-Za-z0-9 ./_-]+)/i),
      model: extractTaggedValue(rawText, /\b(?:model|mod)\s*[:#-]?\s*([A-Za-z0-9 ./_-]+)/i),
      serial: extractTaggedValue(rawText, /\b(?:serial|s\/n|sn)\s*[:#-]?\s*([A-Za-z0-9 ./_-]+)/i),
      mfg_date: '',
      acquired_date: '',
      notes: rawText || '',
    }
    if (!draft.property_id) missingFields.push('property_id')
    if (!draft.nickname) missingFields.push('nickname')
    return { entity_type: 'asset', draft, missing_fields: missingFields }
  }

  if (entityType === 'reminder') {
    const startDate = new Date().toISOString().split('T')[0]
    const draft = {
      property_id: context?.property_id || null,
      category: context?.reminder_category_hint || detectReminderCategory(rawText),
      start_date: startDate,
      due_date: startDate,
      repeat_by: context?.reminder_repeat_hint || detectReminderRepeat(rawText),
      amount: extractAmount(rawText),
      note: rawText || '',
      status: true,
    }
    if (!draft.property_id) missingFields.push('property_id')
    if (!draft.category) missingFields.push('category')
    return { entity_type: 'reminder', draft, missing_fields: missingFields }
  }

  if (entityType === 'service') {
    const propertyId = context?.property_id || null
    const draft = {
      propertyId,
      selectedServicePropertyIds: propertyId ? [propertyId] : [],
      service_type: context?.service_type_hint || detectServiceType(rawText),
      company_name: extractCompanyName(rawText),
      company_website: extractTaggedValue(rawText, /\b(?:website|url)\s*[:#-]?\s*(https?:\/\/[^\s]+|[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i),
      agent_company: '',
      agent_name: extractTaggedValue(rawText, /\b(?:agent|contact)\s*[:#-]?\s*([A-Za-z .'’-]{2,80})/i),
      agent_phone: extractTaggedValue(rawText, /\b(?:phone|tel|mobile)\s*[:#-]?\s*([+()0-9 .-]{7,30})/i),
      agent_email: extractTaggedValue(rawText, /\b(?:email)\s*[:#-]?\s*([^\s]+@[^\s]+)/i),
      service_start_date: '',
      term: '',
      recurring: detectRecurring(rawText),
    }
    if (!draft.propertyId) missingFields.push('propertyId')
    if (!draft.selectedServicePropertyIds.length) missingFields.push('selectedServicePropertyIds')
    if (!draft.service_type) missingFields.push('service_type')
    return { entity_type: 'service', draft, missing_fields: missingFields }
  }

  const category = classifyIssueCategory(rawText)
  const urgency = classifyUrgency(rawText)
  const draft = {
    title: rawText.slice(0, 120) || 'Untitled task',
    description: rawText || '',
    task_category: category,
    task_priority: urgency === 'high' ? 'high' : urgency === 'medium' ? 'medium' : 'low',
    status: 'open',
    property_id: context?.property_id || null,
    lease_id: context?.lease_id || null,
    unit_id: context?.unit_id || null,
    photos: Array.isArray(photos) ? photos : [],
    videos: Array.isArray(videos) ? videos : [],
    attachments: Array.isArray(attachments) ? attachments : [],
  }
  if (!draft.property_id) missingFields.push('property_id')
  if (!draft.description) missingFields.push('description')
  return {
    entity_type: 'task',
    draft,
    missing_fields: missingFields,
  }
}

export const runFormIntakeSkill = async ({
  rawText,
  context = {},
  photos = [],
  videos = [],
  attachments = [],
  llmConfig = {},
}) => {
  let output = null
  try {
    output = await callModelIntake({
      rawText,
      context,
      apiKey: llmConfig.geminiApiKey,
      model: llmConfig.model,
      provider: llmConfig.provider,
      vertexProjectId: llmConfig.vertexProjectId,
      vertexLocation: llmConfig.vertexLocation,
      vertexPublisher: llmConfig.vertexPublisher,
    })
  } catch {
    output = null
  }

  if (output) return output
  return buildFallbackDraft({ rawText, context, photos, videos, attachments })
}
