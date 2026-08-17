import { supabase } from '../supabase'
import { comprimirImagen } from './imagen'

export function mensajeErrorSupabase(error) {
  const texto = (error?.message || '').toLowerCase()

  if (texto.includes('row-level security') || texto.includes('violates row-level')) {
    return 'No hay permiso para guardar en la base de datos. En Supabase, abre el SQL Editor y ejecuta el archivo supabase/fix-rls.sql.'
  }
  if (texto.includes('column') && texto.includes('does not exist')) {
    return 'La tabla de vinilos no tiene una columna que la app está intentando guardar.'
  }
  if (texto.includes('invalid input syntax') || texto.includes('22p02')) {
    return 'Hay un dato con formato incorrecto (revisa el año).'
  }
  if (texto.includes('bucket') || texto.includes('storage') || texto.includes('object')) {
    return 'No se pudo subir la portada. El vinilo se puede guardar igual sin foto.'
  }

  return error?.message || 'No se ha podido completar la acción.'
}

export function parseAño(valor) {
  if (valor === '' || valor === null || valor === undefined) return null
  const n = parseInt(String(valor), 10)
  return Number.isFinite(n) ? n : null
}

export function prepararDatosVinilo({ titulo, autor, año, genero, valoracion, comentarios, imagenUrl }) {
  const datos = {
    titulo: titulo.trim(),
    autor: autor.trim(),
    año: parseAño(año),
    genero: genero.trim() || null,
    valoracion: Number(valoracion) || 0,
    canciones: comentarios.trim(),
  }

  if (imagenUrl) datos.imagen_url = imagenUrl
  return datos
}

export async function subirPortada(archivo) {
  const comprimida = await comprimirImagen(archivo)
  const nombreArchivo = `${Date.now()}.jpg`
  const { error } = await supabase.storage.from('portadas').upload(nombreArchivo, comprimida, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('portadas').getPublicUrl(nombreArchivo)
  return { url: data.publicUrl, nombreArchivo }
}

export async function borrarPortada(nombreArchivo) {
  if (!nombreArchivo) return
  await supabase.storage.from('portadas').remove([nombreArchivo])
}

export async function guardarVinilo({ datos, idEditar }) {
  if (idEditar) {
    const { error } = await supabase.from('vinilos').update(datos).eq('id', idEditar)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('vinilos').insert([{
    ...datos,
    historial_escuchas: [],
  }])
  if (error) throw error
}

export function comentariosDe(vinilo) {
  return (vinilo?.canciones || '').trim()
}

export function timestampUltimaEscucha(vinilo) {
  if (vinilo?.ultima_escucha) {
    const t = Date.parse(vinilo.ultima_escucha)
    if (Number.isFinite(t)) return t
  }

  const historial = vinilo?.historial_escuchas || []
  let masReciente = null
  for (const fecha of historial) {
    const t = Date.parse(fecha)
    if (Number.isFinite(t) && (masReciente === null || t > masReciente)) {
      masReciente = t
    }
  }
  return masReciente
}

export function fechaIsoUltimaEscucha(viniloOHistorial) {
  const historial = Array.isArray(viniloOHistorial)
    ? viniloOHistorial
    : (viniloOHistorial?.historial_escuchas || [])

  let mejor = null
  let mejorTs = null
  for (const fecha of historial) {
    const t = Date.parse(fecha)
    if (Number.isFinite(t) && (mejorTs === null || t > mejorTs)) {
      mejor = fecha
      mejorTs = t
    }
  }
  return mejor
}

export function textoUltimaEscucha(vinilo) {
  const t = timestampUltimaEscucha(vinilo)
  if (t === null) return 'Todavía no se ha escuchado'

  const dias = Math.floor(Math.max(0, Date.now() - t) / 86400000)
  if (dias <= 0) return 'Escuchado hoy'
  if (dias === 1) return 'Escuchado ayer'
  if (dias < 14) return `Escuchado hace ${dias} días`

  const semanas = Math.round(dias / 7)
  if (dias < 45) return semanas === 1 ? 'Escuchado hace 1 semana' : `Escuchado hace ${semanas} semanas`

  const meses = Math.round(dias / 30)
  if (dias < 540) return meses === 1 ? 'Escuchado hace 1 mes' : `Escuchado hace ${meses} meses`

  const años = Math.round(dias / 365)
  return años === 1 ? 'Escuchado hace 1 año' : `Escuchado hace ${años} años`
}

export function ordenarPorUltimaEscucha(lista, direccion) {
  const masTiempo = direccion === 'mas'
  return [...lista].sort((a, b) => {
    const ta = timestampUltimaEscucha(a)
    const tb = timestampUltimaEscucha(b)
    if (ta === null && tb === null) return 0
    if (ta === null) return masTiempo ? -1 : 1
    if (tb === null) return masTiempo ? 1 : -1
    return masTiempo ? ta - tb : tb - ta
  })
}
