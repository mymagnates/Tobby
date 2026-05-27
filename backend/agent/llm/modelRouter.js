import { parseJsonLoose, truncateForLog } from '../utils/text.js'

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
export const DEFAULT_LLM_PROVIDER = 'vertex'
export const DEFAULT_VERTEX_LOCATION = 'us-central1'
export const DEFAULT_VERTEX_PUBLISHER = 'google'

const parseFirebaseProjectId = () => {
  try {
    const config = JSON.parse(process.env.FIREBASE_CONFIG || '{}')
    return String(config.projectId || '').trim() || null
  } catch {
    return null
  }
}

export const resolveVertexProjectId = (config = {}) =>
  String(
    config.vertexProjectId ||
      process.env.VERTEX_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      parseFirebaseProjectId() ||
      '',
  ).trim() || null

const getGoogleAccessToken = async () => {
  const response = await fetch(
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    {
      headers: { 'Metadata-Flavor': 'Google' },
    },
  )
  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`metadata_token_failed:${response.status}:${truncateForLog(errorText, 400)}`)
  }
  const data = await response.json().catch(() => null)
  return String(data?.access_token || '').trim() || null
}

const extractModelText = (data = null) => data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

export const callGeminiDeveloperGenerateContent = async ({
  systemInstruction,
  contents,
  apiKey,
  model,
  generationConfig,
  tools,
}) => {
  if (!apiKey) {
    return {
      parsed: null,
      raw_text: '',
      status: null,
      ok: false,
      error_text: 'missing_gemini_api_key',
      provider: 'gemini',
    }
  }
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model || DEFAULT_GEMINI_MODEL,
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig,
        ...(Array.isArray(tools) && tools.length ? { tools } : {}),
      }),
    },
  )
  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    return {
      parsed: null,
      raw_text: '',
      status: response.status,
      ok: false,
      error_text: truncateForLog(errorText, 800),
      provider: 'gemini',
    }
  }
  const data = await response.json().catch(() => null)
  const text = extractModelText(data)
  return {
    parsed: parseJsonLoose(text),
    raw_text: text,
    status: response.status,
    ok: true,
    error_text: '',
    provider: 'gemini',
  }
}

export const callVertexGenerateContent = async ({
  systemInstruction,
  contents,
  model,
  generationConfig,
  tools,
  vertexProjectId,
  vertexLocation,
  vertexPublisher,
}) => {
  const projectId = String(vertexProjectId || '').trim()
  if (!projectId) {
    return {
      parsed: null,
      raw_text: '',
      status: null,
      ok: false,
      error_text: 'missing_vertex_project_id',
      provider: 'vertex',
    }
  }

  let accessToken = null
  try {
    accessToken = await getGoogleAccessToken()
  } catch (error) {
    return {
      parsed: null,
      raw_text: '',
      status: null,
      ok: false,
      error_text: truncateForLog(error?.message || 'vertex_auth_failed', 400),
      provider: 'vertex',
    }
  }

  const location = String(vertexLocation || DEFAULT_VERTEX_LOCATION).trim()
  const publisher = String(vertexPublisher || DEFAULT_VERTEX_PUBLISHER).trim()
  const response = await fetch(
    `https://${encodeURIComponent(location)}-aiplatform.googleapis.com/v1/projects/${encodeURIComponent(
      projectId,
    )}/locations/${encodeURIComponent(location)}/publishers/${encodeURIComponent(
      publisher,
    )}/models/${encodeURIComponent(model || DEFAULT_GEMINI_MODEL)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig,
        ...(Array.isArray(tools) && tools.length ? { tools } : {}),
      }),
    },
  )
  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    return {
      parsed: null,
      raw_text: '',
      status: response.status,
      ok: false,
      error_text: truncateForLog(errorText, 800),
      provider: 'vertex',
    }
  }
  const data = await response.json().catch(() => null)
  const text = extractModelText(data)
  return {
    parsed: parseJsonLoose(text),
    raw_text: text,
    status: response.status,
    ok: true,
    error_text: '',
    provider: 'vertex',
  }
}

export const callStructuredModel = async ({
  provider = DEFAULT_LLM_PROVIDER,
  systemInstruction,
  contents,
  generationConfig,
  tools,
  geminiApiKey,
  model,
  vertexProjectId,
  vertexLocation,
  vertexPublisher,
}) => {
  const normalizedProvider = String(provider || DEFAULT_LLM_PROVIDER).trim().toLowerCase()
  if (normalizedProvider === 'gemini') {
    return callGeminiDeveloperGenerateContent({
      systemInstruction,
      contents,
      apiKey: geminiApiKey,
      model,
      generationConfig,
      tools,
    })
  }
  if (normalizedProvider === 'vertex') {
    return callVertexGenerateContent({
      systemInstruction,
      contents,
      model,
      generationConfig,
      tools,
      vertexProjectId,
      vertexLocation,
      vertexPublisher,
    })
  }
  if (normalizedProvider === 'auto') {
    const vertexResult = await callVertexGenerateContent({
      systemInstruction,
      contents,
      model,
      generationConfig,
      tools,
      vertexProjectId,
      vertexLocation,
      vertexPublisher,
    })
    if (vertexResult.ok) return vertexResult
    const geminiResult = await callGeminiDeveloperGenerateContent({
      systemInstruction,
      contents,
      apiKey: geminiApiKey,
      model,
      generationConfig,
      tools,
    })
    if (geminiResult.ok) return geminiResult
    return {
      ...geminiResult,
      error_text: truncateForLog(
        `vertex_error=${vertexResult.error_text || 'unknown'} | gemini_error=${geminiResult.error_text || 'unknown'}`,
        800,
      ),
      provider: 'auto',
    }
  }
  return {
    parsed: null,
    raw_text: '',
    status: null,
    ok: false,
    error_text: `unsupported_provider:${normalizedProvider}`,
    provider: normalizedProvider,
  }
}
