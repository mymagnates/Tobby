import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecordPhotoUpload } from 'src/services/recordPhotoUpload'
import { mobileRequest } from 'src/services/mobileApi'
vi.mock('src/services/mobileApi', () => ({ mobileRequest: vi.fn() }))
const file = new File(['receipt'], 'receipt.jpg', { type: 'image/jpeg' })
const reservation = {
  reservation_id: 'r1',
  upload_url: 'https://upload.test',
  download_token: 'token',
}
beforeEach(() => {
  vi.clearAllMocks()
  mobileRequest
    .mockReset()
    .mockImplementation(async (url) =>
      url.endsWith('/commit') ? { url: 'https://image.test/receipt.jpg' } : reservation,
    )
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
describe('reserved record photo uploads', () => {
  it('reserves and commits exactly once, reusing the URL on record save retry', async () => {
    const upload = createRecordPhotoUpload({ propertyId: 'p1', file })
    expect(await upload.upload()).toBe('https://image.test/receipt.jpg')
    expect(await upload.upload()).toBe('https://image.test/receipt.jpg')
    expect(mobileRequest).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(mobileRequest.mock.calls[0][1].body).toMatchObject({
      content_type: 'image/jpeg',
      size_bytes: file.size,
    })
    expect(mobileRequest.mock.calls[0][1].body.storage_path).toMatch(
      /^properties\/p1\/transaction\//,
    )
  })
  it('does not upload after quota denial and can retry reservation', async () => {
    mobileRequest.mockRejectedValueOnce(new Error('Quota exceeded'))
    const upload = createRecordPhotoUpload({ propertyId: 'p1', file })
    await expect(upload.upload()).rejects.toThrow('Quota exceeded')
    expect(fetch).not.toHaveBeenCalled()
    expect(await upload.upload()).toBe('https://image.test/receipt.jpg')
  })
  it('retries a lost commit response with the same reservation, without reuploading', async () => {
    mobileRequest
      .mockResolvedValueOnce(reservation)
      .mockRejectedValueOnce(new Error('Connection lost'))
    const upload = createRecordPhotoUpload({ propertyId: 'p1', file })
    await expect(upload.upload()).rejects.toThrow('Connection lost')
    await upload.upload()
    expect(mobileRequest.mock.calls.map(([url]) => url)).toEqual([
      '/storage/upload-reservations',
      '/storage/upload-reservations/r1/commit',
      '/storage/upload-reservations/r1/commit',
    ])
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('retries a failed PUT within its reservation and deduplicates concurrent calls', async () => {
    fetch.mockResolvedValueOnce({ ok: false })
    const upload = createRecordPhotoUpload({ propertyId: 'p1', file })
    await expect(upload.upload()).rejects.toThrow('Photo upload failed')
    const first = upload.upload()
    expect(upload.upload()).toBe(first)
    await first
    expect(mobileRequest).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it('aborts a stalled upload and never commits it', async () => {
    vi.useFakeTimers()
    fetch.mockImplementation(
      (_url, { signal }) =>
        new Promise((_, reject) =>
          signal.addEventListener('abort', () => reject(new Error('Upload timed out'))),
        ),
    )
    const upload = createRecordPhotoUpload({ propertyId: 'p1', file })
    const result = expect(upload.upload()).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(60000)
    await result
    expect(mobileRequest).toHaveBeenCalledTimes(1)
  })
  it('does not treat a malformed commit as a saved image', async () => {
    mobileRequest.mockResolvedValueOnce(reservation).mockResolvedValueOnce({})
    await expect(createRecordPhotoUpload({ propertyId: 'p1', file }).upload()).rejects.toThrow(
      'not confirmed',
    )
  })
})
