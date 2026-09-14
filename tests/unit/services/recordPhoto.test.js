import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pickNativePhoto, safePhotoUrl, validatePhotoFile } from 'src/services/recordPhoto'

const { getPhoto } = vi.hoisted(() => ({ getPhoto: vi.fn() }))
vi.mock('@capacitor/camera', () => ({
  Camera: { getPhoto },
  CameraSource: { Camera: 'CAMERA', Photos: 'PHOTOS' },
  CameraResultType: { Uri: 'uri' },
}))
beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})
describe('record photo adapter', () => {
  it.each(['camera', 'photos'])('converts native %s to a validated File', async (source) => {
    getPhoto.mockResolvedValueOnce({ webPath: 'capacitor://photo', format: 'jpeg' })
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          blob: async () => new Blob(['photo'], { type: 'image/jpeg' }),
        }),
    )
    const file = await pickNativePhoto(source)
    expect(file).toBeInstanceOf(File)
    expect(file.type).toBe('image/jpeg')
    expect(getPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        source: source.toUpperCase(),
        resultType: 'uri',
        saveToGallery: false,
      }),
    )
  })
  it('accepts a photo from limited access without requesting full library access', async () => {
    getPhoto.mockResolvedValueOnce({ webPath: 'capacitor://limited', format: 'jpeg' })
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          blob: async () => new Blob(['photo'], { type: 'image/jpeg' }),
        }),
    )
    expect(await pickNativePhoto('photos')).toBeInstanceOf(File)
  })
  it.each(['User cancelled photos app', 'User canceled'])(
    'returns no change on cancel: %s',
    async (message) => {
      getPhoto.mockRejectedValueOnce(new Error(message))
      expect(await pickNativePhoto('photos')).toBeNull()
    },
  )
  it('reports denied access with a recoverable message', async () => {
    getPhoto.mockRejectedValueOnce(new Error('Permission denied'))
    await expect(pickNativePhoto('camera')).rejects.toThrow('Your draft is unchanged')
  })
  it('rejects unreadable native output', async () => {
    getPhoto.mockResolvedValueOnce({})
    await expect(pickNativePhoto('photos')).rejects.toThrow('could not be read')
  })
  it('rejects unsupported, empty and oversized files before upload', () => {
    expect(() =>
      validatePhotoFile(new File(['<svg/>'], 'image.svg', { type: 'image/svg+xml' })),
    ).toThrow('Choose a JPEG')
    expect(() => validatePhotoFile({ type: 'image/jpeg', size: 26 * 1024 * 1024 })).toThrow('25 MB')
    expect(() => validatePhotoFile({ type: 'image/jpeg', size: 0 })).toThrow('25 MB')
  })
  it('only renders absolute HTTP image links', () => {
    expect(safePhotoUrl('javascript:alert(1)')).toBe('')
    expect(safePhotoUrl('data:text/html,test')).toBe('')
    expect(safePhotoUrl('/relative')).toBe('')
    expect(safePhotoUrl('https://example.test/image.jpg')).toBe('https://example.test/image.jpg')
  })
})
