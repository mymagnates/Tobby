import { auth, authStateReady } from 'src/boot/firebase'
import { isNativeMobileRuntime } from 'src/utils/mobileRuntime'

export const mobileApiBase = () => {
  const configured = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  if (isNativeMobileRuntime() && !/^https:\/\//.test(configured))
    return 'https://tobbythebutler.web.app/api'
  return configured
}
export async function mobileRequest(path, { method = 'GET', body, signal } = {}) {
  await authStateReady
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in again.')
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, 20000)
  try {
    const token = await Promise.race([
      user.getIdToken(),
      new Promise((_, reject) =>
        controller.signal.addEventListener(
          'abort',
          () => reject(new Error('Request timed out. Please try again.')),
          { once: true },
        ),
      ),
    ])
    const response = await fetch(`${mobileApiBase()}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'X-User-Id': user.uid,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.headers.get('content-type')?.includes('application/json'))
      throw Object.assign(
        new Error('The server did not return data. This feature may not be deployed yet.'),
        { status: 501 },
      )
    if (!response.ok)
      throw Object.assign(
        new Error(
          payload.message ||
            (response.status === 404
              ? 'This feature is not available on the server yet.'
              : 'Unable to complete the request.'),
        ),
        { code: payload.error_code, status: response.status },
      )
    return payload
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}
export const inventoryPath = (leaseId) =>
  `/leases/${encodeURIComponent(leaseId)}/inventory-workflow`
export const getInventory = (leaseId) => mobileRequest(inventoryPath(leaseId))
export const inventoryCommand = (leaseId, body) =>
  mobileRequest(`${inventoryPath(leaseId)}/commands`, { method: 'POST', body })
export async function uploadInventoryPhoto({ propertyId, leaseId, itemId, file }) {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) || file.size > 25 * 1024 * 1024)
    throw new Error('Choose a photo up to 25 MB.')
  const path = `properties/${propertyId}/inventory/${leaseId}/${itemId}/${crypto.randomUUID()}`
  const reservation = await mobileRequest('/storage/upload-reservations', {
    method: 'POST',
    body: { storage_path: path, size_bytes: file.size, content_type: file.type },
  })
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
    if (!response.ok) throw new Error('Photo upload failed. Tap Retry.')
    const result = await mobileRequest(
      `/storage/upload-reservations/${encodeURIComponent(reservation.reservation_id)}/commit`,
      { method: 'POST' },
    )
    return { path, url: result.url }
  } finally {
    clearTimeout(timer)
  }
}
