export async function comprimirImagen(archivo, ladoMaximo = 1400, calidad = 0.82) {
  if (!archivo || !archivo.type?.startsWith('image/')) return archivo

  let bitmap
  try {
    bitmap = await createImageBitmap(archivo)
  } catch {
    return archivo
  }
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
  const ancho = Math.round(bitmap.width * escala)
  const alto = Math.round(bitmap.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, ancho, alto)
  bitmap.close()

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', calidad)
  })

  if (!blob) return archivo
  return new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' })
}
