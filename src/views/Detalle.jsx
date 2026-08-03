import { useState } from 'react'
import { supabase } from '../supabase'
import { tema } from '../theme'

export default function Detalle({ vinilo, volver, refrescarVinilos, irAEditar }) {
  const [registrando, setRegistrando] = useState(false)
  const [viniloActual, setViniloActual] = useState(vinilo)

  // 1. REGISTRAR ESCUCHA
  const registrarEscucha = async () => {
    setRegistrando(true)
    const ahora = new Date().toISOString()
    const historialActual = viniloActual.historial_escuchas || []
    const nuevoHistorial = [ahora, ...historialActual]

    const { error } = await supabase.from('vinilos').update({ ultima_escucha: ahora, historial_escuchas: nuevoHistorial }).eq('id', viniloActual.id)

    if (!error) {
      setViniloActual({ ...viniloActual, ultima_escucha: ahora, historial_escuchas: nuevoHistorial })
      refrescarVinilos() 
    }
    setRegistrando(false)
  }

  // 2. BORRAR ESCUCHA INDIVIDUAL
  const borrarEscucha = async (fechaABorrar) => {
    if (window.confirm("¿Quieres eliminar este registro de escucha?")) {
      const nuevoHistorial = viniloActual.historial_escuchas.filter(fecha => fecha !== fechaABorrar)
      
      const { error } = await supabase.from('vinilos').update({ historial_escuchas: nuevoHistorial }).eq('id', viniloActual.id)
      
      if (!error) {
        setViniloActual({ ...viniloActual, historial_escuchas: nuevoHistorial })
        refrescarVinilos()
      }
    }
  }

  // 3. BORRAR VINILO COMPLETO
  const borrarVinilo = async () => {
    if (window.confirm(`¿Seguro que quieres borrar "${viniloActual.titulo}" de tu colección? Esta acción no se puede deshacer.`)) {
      await supabase.from('vinilos').delete().eq('id', viniloActual.id)
      refrescarVinilos()
      volver() // Nos devuelve a la galería automáticamente
    }
  }

  const renderEstrellas = (valoracion) => {
    const puntos = valoracion || 0
    return '★'.repeat(puntos) + '☆'.repeat(5 - puntos)
  }

  const cancionesArray = viniloActual.canciones ? viniloActual.canciones.split('\n').filter(c => c.trim() !== '') : []

  const formatearFecha = (isoString) => {
    const fecha = new Date(isoString)
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={estilos.contenedor}>
      
      {/* CABECERA */}
      <div style={estilos.header}>
        <button style={estilos.btnVolver} onClick={volver}>{"<"}</button>
        <div style={estilos.contadorEscuchas}>
          {viniloActual.historial_escuchas ? viniloActual.historial_escuchas.length : 0} 🎧
        </div>
        <div style={estilos.accionesDerecha}>
          <button style={estilos.btnAccionMini} onClick={irAEditar}>✏️</button>
          <button style={estilos.btnAccionMini} onClick={borrarVinilo}>🗑️</button>
        </div>
      </div>

      <div style={estilos.tarjetaHero}>
        <img src={viniloActual.imagen_url || 'https://via.placeholder.com/150/1E1E1E/FFFFFF?text=🎵'} alt={viniloActual.titulo} style={estilos.portada} />
        <div style={estilos.infoHero}>
          <h3 style={estilos.tituloHero}>{viniloActual.titulo}</h3>
          <p style={estilos.metaHero}>{viniloActual.año || 'Sin año'} • {viniloActual.genero || 'Sin género'}</p>
          <p style={estilos.autorHero}>Autor: {viniloActual.autor || 'Desconocido'}</p>
          <div style={estilos.estrellas}>{renderEstrellas(viniloActual.valoracion)}</div>
        </div>
      </div>

      <h3 style={estilos.tituloSeccion}>Canciones</h3>
      <div style={estilos.cajaSeccion}>
        {cancionesArray.length > 0 ? (
          cancionesArray.map((cancion, index) => {
            const nombreLimpio = cancion.replace(/^\d+[\.\-]\s*/, '')
            const esUltimo = index === cancionesArray.length - 1
            return (
              <div key={index} style={{ ...estilos.itemLista, borderBottom: esUltimo ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                <span style={estilos.textoLista}>{index + 1}. {nombreLimpio}</span>
              </div>
            )
          })
        ) : (
          <p style={estilos.textoVacio}>No hay canciones añadidas.</p>
        )}
      </div>

      <h3 style={estilos.tituloSeccion}>Historial de Escuchas</h3>
      <div style={estilos.cajaSeccion}>
        {viniloActual.historial_escuchas && viniloActual.historial_escuchas.length > 0 ? (
          viniloActual.historial_escuchas.map((fechaIso, index) => {
            const esUltimo = index === viniloActual.historial_escuchas.length - 1
            return (
              <div key={index} style={{ ...estilos.itemLista, borderBottom: esUltimo ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                <span style={estilos.textoLista}>{formatearFecha(fechaIso)}</span>
                <button style={estilos.btnBorrarEscucha} onClick={() => borrarEscucha(fechaIso)}>✕</button>
              </div>
            )
          })
        ) : (
          <p style={estilos.textoVacio}>Aún no hay registros. ¡Dale al botón para estrenarlo!</p>
        )}
      </div>

      <button style={estilos.btnEscuchar} onClick={registrarEscucha} disabled={registrando}>
        {registrando ? 'Registrando...' : '🎧 Registrar Escucha'}
      </button>

    </div>
  )
}

const estilos = {
  contenedor: { padding: '20px', color: tema.textoPrincipal, paddingBottom: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnVolver: { background: 'none', border: 'none', color: tema.acento, fontSize: '24px', cursor: 'pointer', padding: 0, fontWeight: 'bold', width: '30px', textAlign: 'left' },
  contadorEscuchas: { fontSize: '20px', color: tema.textoPrincipal, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' },
  accionesDerecha: { display: 'flex', gap: '15px', width: '60px', justifyContent: 'flex-end' },
  btnAccionMini: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: 0, filter: 'grayscale(0.3)' },
  tarjetaHero: { backgroundColor: tema.superficieClara, borderRadius: '16px', padding: '15px', display: 'flex', gap: '15px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  portada: { width: '95px', height: '95px', borderRadius: '8px', objectFit: 'cover' },
  infoHero: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 },
  tituloHero: { fontSize: '20px', margin: '0 0 6px 0', color: tema.acento, fontFamily: tema.fuentePrincipal },
  metaHero: { fontSize: '14px', color: tema.textoSecundario, margin: '0 0 4px 0' },
  autorHero: { fontSize: '14px', color: tema.textoSecundario, margin: '0 0 8px 0' },
  estrellas: { color: tema.acento, letterSpacing: '2px', fontSize: '15px' },
  tituloSeccion: { fontSize: '18px', color: tema.textoPrincipal, marginBottom: '12px' },
  cajaSeccion: { backgroundColor: tema.superficieClara, borderRadius: '16px', padding: '10px 15px', marginBottom: '30px' },
  itemLista: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' },
  textoLista: { fontSize: '15px', color: tema.textoPrincipal },
  btnBorrarEscucha: { background: 'none', border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer', padding: '0 5px' },
  textoVacio: { color: tema.textoSecundario, fontStyle: 'italic', fontSize: '14px', margin: '5px 0' },
  btnEscuchar: { width: '100%', padding: '16px', backgroundColor: tema.acento, color: '#000', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }
}