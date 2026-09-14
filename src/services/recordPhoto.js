import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif'
export function validatePhotoFile(file) {
  if (!file || !PHOTO_ACCEPT.split(',').includes(file.type))
    throw new Error('Choose a JPEG, PNG, WebP, HEIC, HEIF or GIF image.')
  if (!file.size || file.size > 25 * 1024 * 1024)
    throw new Error('Choose a photo between 1 byte and 25 MB.')
  return file
}

export const isPhotoPickerCancelled = (error) =>
  /cancelled|canceled|user cancel|no image picked/i.test(String(error?.message || error || ''))

export async function pickNativePhoto(source) {
  if (!['camera', 'photos'].includes(source)) throw new Error('Unknown photo source.')
  try {
    // Let the system picker request only the access it needs, including limited-library access.
    const photo = await Camera.getPhoto({
      source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
      resultType: CameraResultType.Uri,
      quality: 90,
      correctOrientation: true,
      allowEditing: false,
      saveToGallery: false,
    })
    if (!photo.webPath) throw new Error('The selected photo could not be read. Please try again.')
    const response = await fetch(photo.webPath)
    if (!response.ok) throw new Error('The selected photo could not be read. Please try again.')
    const blob = await response.blob()
    const format = photo.format === 'jpg' ? 'jpeg' : photo.format || 'jpeg'
    return validatePhotoFile(
      new File([blob], `photo.${format}`, { type: blob.type || `image/${format}` }),
    )
  } catch (error) {
    if (isPhotoPickerCancelled(error)) return null
    if (/permission|denied|access/i.test(String(error?.message || '')))
      throw new Error(
        'Photo access was denied. Allow access in device Settings or choose an image file. Your draft is unchanged.',
      )
    throw error
  }
}

export function safePhotoUrl(value) {
  if (typeof value !== 'string') return ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''
  } catch {
    return ''
  }
}
