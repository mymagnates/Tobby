import { callStructuredModel } from '../llm/modelRouter.js'
import {
  buildTaskInsightFewShotContents,
  buildTaskInsightSystemInstruction,
  buildTaskInsightUserPayload,
} from '../prompts/taskInsightPrompt.js'
import { TASK_INSIGHT_RESPONSE_SCHEMA } from '../schemas/taskInsightSchema.js'
import {
  detectSafetyFlags,
  isNonEmptyString,
  normalizeStringList,
  truncateForLog,
} from '../utils/text.js'

const buildTaskInsightFallback = (task = {}) => {
  const description = String(task?.description || '').trim()
  const safetyFlags = detectSafetyFlags(description)
  const city = String(task?.property_city || task?.city || '').trim()
  const state = String(task?.property_state || task?.state || '').trim()
  const suggestSp = safetyFlags.length > 0 || description.length >= 12
  return {
    capability: 'task_insight',
    likely_causes: ['The exact trade and work scope need to be confirmed from the task description and on-site conditions.'],
    knowledge_points: [
      'The key first step is confirming the actual scope, access conditions, and any hidden constraints before pricing or scheduling.',
      'Final trade selection and pricing usually depend on material, quantity, condition, and whether demolition or prep work is required.',
    ],
    possible_scope_of_work: [
      'Review the described work, confirm site conditions, and define the actual labor and material scope before proceeding.',
    ],
    safety_flags: safetyFlags,
    regional_price_range: `Typical ${[city, state].filter(Boolean).join(', ') || 'the local market'} pricing depends on the final trade, quantity, material, access, and prep scope. A reliable range requires the correct project type first.`,
    recommended_next_step: safetyFlags.length
      ? 'Review the task promptly and consider contacting a service provider due to the reported safety risk.'
      : 'Review the task details, confirm the project type, and then decide whether to publish to the appropriate service provider.',
    suggest_sp: suggestSp,
    suggested_service_type: '',
    confidence: 0.35,
  }
}

export const normalizeTaskInsightOutput = ({ task = {}, modelOutput = null }) => {
  const fallback = buildTaskInsightFallback(task)
  if (!modelOutput || modelOutput.capability !== 'task_insight') {
    return { output: fallback, fallback_reason: 'missing_or_invalid_capability' }
  }

  const suggestedServiceType = String(modelOutput?.suggested_service_type || '').trim().toLowerCase()
  const modelLikelyCauses = normalizeStringList(modelOutput?.likely_causes, { max: 3 })
  const modelKnowledgePoints = normalizeStringList(modelOutput?.knowledge_points, { max: 3 })
  const modelScopes = normalizeStringList(modelOutput?.possible_scope_of_work, { max: 3 })
  const modelSafetyFlags = normalizeStringList(modelOutput?.safety_flags, { max: 3 })
  const mergedSafetyFlags = normalizeStringList(
    [...(fallback.safety_flags || []), ...modelSafetyFlags],
    { max: 4 },
  )

  const output = {
    capability: 'task_insight',
    likely_causes: modelLikelyCauses.length ? modelLikelyCauses : fallback.likely_causes,
    knowledge_points: modelKnowledgePoints.length ? modelKnowledgePoints : fallback.knowledge_points,
    possible_scope_of_work: modelScopes.length ? modelScopes : fallback.possible_scope_of_work,
    safety_flags: mergedSafetyFlags,
    regional_price_range:
      isNonEmptyString(modelOutput?.regional_price_range, 12) && /\$\d|\bprice\b/i.test(String(modelOutput.regional_price_range))
        ? String(modelOutput.regional_price_range).trim()
        : fallback.regional_price_range,
    recommended_next_step: isNonEmptyString(modelOutput?.recommended_next_step, 8)
      ? String(modelOutput.recommended_next_step).trim()
      : fallback.recommended_next_step,
    suggest_sp:
      typeof modelOutput?.suggest_sp === 'boolean'
        ? modelOutput.suggest_sp
        : fallback.suggest_sp,
    suggested_service_type:
      isNonEmptyString(suggestedServiceType, 3) ? suggestedServiceType : fallback.suggested_service_type,
    confidence:
      Number.isFinite(Number(modelOutput?.confidence))
        ? Math.max(0, Math.min(1, Number(modelOutput.confidence)))
        : fallback.confidence,
  }
  const usedFallbackContent =
    output.likely_causes === fallback.likely_causes &&
    output.knowledge_points === fallback.knowledge_points &&
    output.possible_scope_of_work === fallback.possible_scope_of_work &&
    output.regional_price_range === fallback.regional_price_range &&
    output.recommended_next_step === fallback.recommended_next_step &&
    output.suggested_service_type === fallback.suggested_service_type
  return {
    output,
    fallback_reason: usedFallbackContent ? 'normalized_to_generic_fallback' : 'model_output_used',
  }
}

const callModelTaskInsight = async ({
  task,
  apiKey,
  model,
  provider,
  vertexProjectId,
  vertexLocation,
  vertexPublisher,
}) => {
  const systemInstruction = buildTaskInsightSystemInstruction()
  const payload = buildTaskInsightUserPayload({ task })
  const fewShotContents = buildTaskInsightFewShotContents()
  const hasLocalMarket = Boolean(
    payload?.task?.property_zip || (payload?.task?.property_city && payload?.task?.property_state),
  )
  const searchTools = hasLocalMarket ? [{ googleSearch: {} }] : null
  const request = {
    provider,
    systemInstruction,
    contents: [...fewShotContents, { role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: TASK_INSIGHT_RESPONSE_SCHEMA,
    },
    geminiApiKey: apiKey,
    model,
    vertexProjectId,
    vertexLocation,
    vertexPublisher,
  }

  if (!searchTools) return callStructuredModel(request)

  const groundedResult = await callStructuredModel({
    ...request,
    tools: searchTools,
  })
  if (groundedResult?.ok) return groundedResult

  const ungroundedResult = await callStructuredModel(request)
  return {
    ...ungroundedResult,
    error_text: ungroundedResult?.ok
      ? groundedResult?.error_text || ''
      : truncateForLog(
          `grounding_error=${groundedResult?.error_text || 'unknown'} | retry_error=${ungroundedResult?.error_text || 'unknown'}`,
          800,
        ),
  }
}

export const runTaskInsightSkill = async ({ task, llmConfig = {} }) => {
  let modelResult = null
  try {
    modelResult = await callModelTaskInsight({
      task,
      apiKey: llmConfig.geminiApiKey,
      model: llmConfig.model,
      provider: llmConfig.provider,
      vertexProjectId: llmConfig.vertexProjectId,
      vertexLocation: llmConfig.vertexLocation,
      vertexPublisher: llmConfig.vertexPublisher,
    })
  } catch {
    modelResult = null
  }

  const normalized = normalizeTaskInsightOutput({
    task,
    modelOutput: modelResult?.parsed || null,
  })
  const output = {
    ...normalized.output,
    generated_by_model: normalized.fallback_reason === 'model_output_used',
    fallback_reason: normalized.fallback_reason,
    model_provider: modelResult?.provider || llmConfig.provider,
    model_status: modelResult?.status ?? null,
  }

  return {
    output,
    modelResult,
    normalized,
  }
}
