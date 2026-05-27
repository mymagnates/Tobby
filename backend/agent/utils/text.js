export const truncateForLog = (value, max = 1200) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export const parseJsonLoose = (value) => {
  if (!value) return null
  if (typeof value === 'object') return value
  const text = String(value)
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

export const normalizeStringList = (value, { max = 3 } = {}) => {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  return value
    .map((item) => String(item || '').trim())
    .filter((item) => item.length >= 6 && item.length <= 220)
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, max)
}

export const isNonEmptyString = (value, min = 4) => String(value || '').trim().length >= min

export const detectSafetyFlags = (text = '') => {
  const value = String(text || '').toLowerCase()
  const flags = []
  if (/gas/.test(value)) flags.push('Gas risk')
  if (/smoke/.test(value)) flags.push('Smoke reported')
  if (/burning smell|burnt smell/.test(value)) flags.push('Burning smell reported')
  if (/sparking|spark/.test(value)) flags.push('Sparking reported')
  if (/shock|electrical shock/.test(value)) flags.push('Shock risk')
  if (/flood|flooding|burst pipe/.test(value)) flags.push('Water damage risk')
  return flags
}
