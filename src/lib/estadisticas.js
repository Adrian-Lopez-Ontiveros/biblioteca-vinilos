function timestampsEscuchas(vinilo) {
  const fechas = []
  for (const fecha of vinilo?.historial_escuchas || []) {
    const t = Date.parse(fecha)
    if (Number.isFinite(t)) fechas.push(t)
  }
  return fechas
}

function esEsteMes(timestamp, ahora) {
  const fecha = new Date(timestamp)
  return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth()
}

function normalizarGenero(valor) {
  return String(valor || '').trim()
}

function claveGenero(valor) {
  return normalizarGenero(valor).toLocaleLowerCase('es')
}

function mejorDiscoDelMes(vinilos, ahora) {
  let mejor = null

  for (const vinilo of vinilos) {
    const veces = timestampsEscuchas(vinilo).filter((t) => esEsteMes(t, ahora)).length
    if (veces === 0) continue

    const ultima = Math.max(...timestampsEscuchas(vinilo).filter((t) => esEsteMes(t, ahora)))
    if (
      !mejor
      || veces > mejor.veces
      || (veces === mejor.veces && ultima > mejor.ultima)
    ) {
      mejor = { vinilo, veces, ultima }
    }
  }

  return mejor ? { vinilo: mejor.vinilo, veces: mejor.veces } : null
}

function mejorGeneroDelMes(vinilos, ahora) {
  const porGenero = new Map()

  for (const vinilo of vinilos) {
    const nombre = normalizarGenero(vinilo.genero)
    if (!nombre) continue
    const clave = claveGenero(nombre)
    const veces = timestampsEscuchas(vinilo).filter((t) => esEsteMes(t, ahora)).length
    if (veces === 0) continue

    const actual = porGenero.get(clave) || { nombre, veces: 0 }
    actual.veces += veces
    porGenero.set(clave, actual)
  }

  let mejor = null
  for (const dato of porGenero.values()) {
    if (!mejor || dato.veces > mejor.veces) mejor = dato
  }
  return mejor
}

export function calcularEstadisticas(vinilos, ahora = new Date()) {
  const lista = vinilos || []
  let totalEscuchas = 0
  let vinilosEscuchadosMes = 0

  for (const vinilo of lista) {
    const fechas = timestampsEscuchas(vinilo)
    totalEscuchas += fechas.length
    if (fechas.some((t) => esEsteMes(t, ahora))) vinilosEscuchadosMes += 1
  }

  return {
    mesNombre: ahora.toLocaleDateString('es-ES', { month: 'long' }),
    totalEscuchas,
    vinilosEscuchadosMes,
    discoMes: mejorDiscoDelMes(lista, ahora),
    generoMes: mejorGeneroDelMes(lista, ahora),
  }
}

export function textoVeces(n) {
  return n === 1 ? '1 vez' : `${n} veces`
}
