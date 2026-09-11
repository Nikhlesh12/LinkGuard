import jsQR from 'jsqr'

export function classifyQrContent(content) {
  if (/^(?:https?|hxxps?):\/\//i.test(content)) return 'URL'
  if (/^mailto:/i.test(content) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)) return 'Email'
  if (/^tel:/i.test(content) || /^\+?[\d\s()-]{7,}$/.test(content)) return 'Phone number'
  if (/^WIFI:/i.test(content)) return 'Wi-Fi information'
  if (content.trim()) return 'Plain text'
  return 'Unknown content'
}

export async function decodeQrFile(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose a PNG, JPEG, or other image file containing a QR code.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Choose an image smaller than 8 MB.')
  const bitmap = await createImageBitmap(file)
  const maxSide = 1600
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' })
  if (!result?.data) throw new Error('No readable QR code was found. Try a clear, well-lit image with the full code visible.')
  return { content: result.data, contentType: classifyQrContent(result.data), dimensions: `${pixels.width} × ${pixels.height}` }
}
