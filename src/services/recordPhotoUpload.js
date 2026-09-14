import { mobileRequest } from './mobileApi'
import { safePhotoUrl, validatePhotoFile } from './recordPhoto'

// A single attempt owns its reservation. Retry a lost commit response, never reserve/charge again.
export function createRecordPhotoUpload({ propertyId, file, context = 'transaction' }) {
  validatePhotoFile(file)
  if (!propertyId || /[/\\]/.test(propertyId) || !/^[a-z-]+$/.test(context))
    throw new Error('A valid property and photo context are required.')
  const path = `properties/${propertyId}/${context}/${crypto.randomUUID()}`
  let reservation,
    uploaded = false,
    url = '',
    pending
  async function run(onProgress) {
    if (url) return url
    onProgress('Reserving photo storage...')
    if (!reservation) {
      const result = await mobileRequest('/storage/upload-reservations', {
        method: 'POST',
        body: { storage_path: path, size_bytes: file.size, content_type: file.type },
      })
      if (!result.reservation_id || !safePhotoUrl(result.upload_url) || !result.download_token)
        throw new Error('Unable to reserve photo storage. Please retry.')
      reservation = result
    }
    if (!uploaded) {
      onProgress('Uploading photo...')
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 60000)
      try {
        const response = await fetch(reservation.upload_url, {
          method: 'PUT',
          body: file,
          signal: controller.signal,
          headers: {
            'Content-Type': file.type,
            'x-goog-meta-firebaseStorageDownloadTokens': reservation.download_token,
          },
        })
        if (!response.ok) throw new Error('Photo upload failed. Please retry.')
        uploaded = true
      } finally {
        clearTimeout(timer)
      }
    }
    onProgress('Confirming photo upload...')
    const result = await mobileRequest(
      `/storage/upload-reservations/${encodeURIComponent(reservation.reservation_id)}/commit`,
      { method: 'POST' },
    )
    url = safePhotoUrl(result.url)
    if (!url) throw new Error('Photo upload was not confirmed. Please retry.')
    return url
  }
  return {
    propertyId,
    file,
    path,
    upload(onProgress = () => {}) {
      pending ||= run(onProgress).finally(() => {
        pending = null
      })
      return pending
    },
  }
}
