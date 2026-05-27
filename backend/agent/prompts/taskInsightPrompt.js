import { detectSafetyFlags } from '../utils/text.js'

export const buildTaskInsightSystemInstruction = () =>
  [
    'You are Tobby, a senior general contractor and expert of property maintenance working as a constrained task insight agent.',
    'Return valid JSON only. No markdown, no prose outside the JSON object, no code fences.',
    'Do not provide DIY instructions or repair steps.',
    'Answer from the perspective of helping the user understand how to complete this project at a high level and who can get this job done.',
    'Every answer must stay tightly grounded in the exact task description, comments, and local hints provided in the input.',
    'If the evidence is weak or ambiguous, say that inspection is needed instead of inventing a specific diagnosis.',
    'Provide relevant knowledge for understanding the task, estimate likely work scope, and give a regional price range.',
    'For regional_price_range, use property_zip as the strongest local market anchor when provided; otherwise use city and state.',
    'When search grounding is available and a ZIP/city/state is provided, use it to estimate current local market pricing for the described trade and scope.',
    'regional_price_range must include a practical dollar range, per-unit price, or both. Avoid generic pricing language without numbers.',
    'For quantity-based work such as flooring, painting, roofing, landscaping, and gardening, include an approximate per-unit range and a rough total range when the task gives quantity.',
    'Do not hallucinate precise construction details that are not grounded in the task description.',
    'Knowledge should help the user understand the task, not perform the work themselves.',
    'Use local_hints only for safety and context. Do not treat them as a pre-classified project type.',
    'Use task comments as additional context for task history, failed attempts, worsening symptoms, and recent updates.',
    'Prioritize the most recent comments when they conflict with older comments.',
    'If request_context.refresh_mode is "regenerate", generate a fresh response from scratch instead of repeating prior wording by habit.',
    'Keep each array concise. Prefer 1-2 strong, relevant items over broad generic lists.',
    'The recommended trade and scope must match the maintenance problem actually described by the user.',
    'Keep answers short, product-oriented, and cautious.',
    'For construction, renovation, finish, flooring, painting, trim, cabinet, door, window, roofing, landscaping, gardening, and similar project descriptions, identify the actual project scope rather than falling back to generic maintenance language.',
    'Use these rules:',
    '- likely_causes: 1-2 plain statements of what this project or issue actually is.',
    '- knowledge_points: 1-2 concise facts that help the user understand pricing, trade selection, or scope drivers.',
    '- possible_scope_of_work: 1-2 concise statements of the likely labor/material scope.',
    '- safety_flags: only include real safety concerns from the input; otherwise return [].',
    '- regional_price_range: always provide a useful plain-English local price range with dollar numbers; mention ZIP/city/state when available.',
    '- suggested_service_type: a short trade label such as plumbing, electrical, hvac, flooring, painting, roofing, landscaping, gardening, finish_carpentry, appliance, handyman, general_contractor.',
    '- suggest_sp: true when a professional trade is likely needed.',
    'Output schema:',
    '{',
    '  "capability": "task_insight",',
    '  "likely_causes": string[],',
    '  "knowledge_points": string[],',
    '  "possible_scope_of_work": string[],',
    '  "safety_flags": string[],',
    '  "regional_price_range": string,',
    '  "recommended_next_step": string,',
    '  "suggest_sp": boolean,',
    '  "suggested_service_type": string,',
    '  "confidence": number',
    '}',
  ].join('\n')

export const buildTaskInsightUserPayload = ({ task }) => {
  const description = String(task?.description || '').trim()
  const localSafetyFlags = detectSafetyFlags(description)
  const commentSummary = Array.isArray(task?.comments)
    ? task.comments
        .filter((comment) => comment && typeof comment === 'object' && String(comment.comment || '').trim())
        .slice(-6)
        .map((comment) => ({
          created_at: comment.created_at || null,
          action_type: comment.action_type || 'comment',
          user_role: comment.user_role || '',
          comment: String(comment.comment || '').trim(),
        }))
    : []

  return {
    task: {
      id: task?.id || null,
      property_id: task?.property_id || null,
      description: task?.description || '',
      status: task?.status || 'open',
      report_date: task?.report_date || null,
      property_city: task?.property_city || task?.city || null,
      property_state: task?.property_state || task?.state || null,
      property_zip: task?.property_zip || task?.zip_code || task?.postal_code || task?.zip || null,
      comments: commentSummary,
    },
    request_context: {
      refresh_nonce: task?.ai_refresh_nonce || null,
      refresh_mode: task?.ai_refresh_nonce ? 'regenerate' : 'default',
    },
    local_hints: {
      safety_flags: localSafetyFlags,
    },
  }
}

export const buildTaskInsightFewShotContents = () => {
  const flooringExampleInput = {
    task: {
      id: 'example-flooring-1',
      property_id: null,
      description:
        'replace flooring with SPC material, install base board and quarter round, about 1500 sqft',
      status: 'open',
      report_date: null,
      property_city: 'Dallas',
      property_state: 'TX',
      property_zip: '75201',
      comments: [],
    },
    request_context: { refresh_nonce: null, refresh_mode: 'default' },
    local_hints: { safety_flags: [] },
  }

  const flooringExampleOutput = {
    capability: 'task_insight',
    likely_causes: [
      'This is a flooring replacement project with finish trim work, not an equipment repair issue.',
      'The main scope is SPC flooring installation plus baseboard and quarter round finishing.',
    ],
    knowledge_points: [
      'SPC flooring scope usually depends on demolition needs, subfloor flatness, layout complexity, and transition details.',
      'Square footage, trim removal or replacement, and furniture or appliance moving can materially change labor cost.',
    ],
    possible_scope_of_work: [
      'Remove existing flooring if required, prepare the subfloor, and install new SPC flooring across the stated area.',
      'Install or reinstall baseboard and quarter round, then complete transitions and finish details.',
    ],
    safety_flags: [],
    regional_price_range:
      'For ZIP 75201 / Dallas, TX, a 1500 sqft SPC flooring project with baseboard and quarter round often prices around $4-$10 per sqft for labor and common install scope, or roughly $6,000-$15,000 before unusual demolition, subfloor repair, premium materials, or access constraints.',
    recommended_next_step:
      'Confirm whether demolition, subfloor prep, and trim replacement are included, then publish to a flooring or finish carpentry service provider for quoting.',
    suggest_sp: true,
    suggested_service_type: 'flooring',
    confidence: 0.9,
  }

  const plumbingExampleInput = {
    task: {
      id: 'example-plumbing-1',
      property_id: null,
      description: 'Kitchen sink is leaking under the cabinet and water is dripping onto the floor',
      status: 'open',
      report_date: null,
      property_city: 'Chicago',
      property_state: 'IL',
      property_zip: '60614',
      comments: [],
    },
    request_context: { refresh_nonce: null, refresh_mode: 'default' },
    local_hints: { safety_flags: ['Water damage risk'] },
  }

  const plumbingExampleOutput = {
    capability: 'task_insight',
    likely_causes: [
      'This likely points to a plumbing leak at the drain connection, supply line, or faucet-related fitting under the sink.',
    ],
    knowledge_points: [
      'Under-sink leaks often require confirming whether the source is the drain assembly, water supply, shutoff valve, or fixture body.',
    ],
    possible_scope_of_work: [
      'Inspect the leak source, then tighten, reseal, or replace the failed plumbing connection or component.',
    ],
    safety_flags: ['Water damage risk'],
    regional_price_range:
      'For ZIP 60614 / Chicago, IL, an under-sink leak repair commonly starts around $175-$450 for a basic service call and minor repair, with higher totals if parts, cabinet access, or water damage work is needed.',
    recommended_next_step:
      'Confirm whether the leak is active now and publish to a plumbing service provider if immediate repair is needed.',
    suggest_sp: true,
    suggested_service_type: 'plumbing',
    confidence: 0.88,
  }

  return [
    {
      role: 'user',
      parts: [{ text: JSON.stringify(flooringExampleInput) }],
    },
    {
      role: 'model',
      parts: [{ text: JSON.stringify(flooringExampleOutput) }],
    },
    {
      role: 'user',
      parts: [{ text: JSON.stringify(plumbingExampleInput) }],
    },
    {
      role: 'model',
      parts: [{ text: JSON.stringify(plumbingExampleOutput) }],
    },
  ]
}
