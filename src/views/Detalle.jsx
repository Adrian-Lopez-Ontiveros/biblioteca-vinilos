import { useState } from 'react'
import { supabase } from '../supabase'
import { tema } from '../theme'

export default function Detalle({ vinilo, volver, refrescarVinilos }) {
  const [registrando, setRegistrando] = useState(false)
  const [viniloActual, setViniloActual] = useState(vinilo)

  // Función para registrar la escucha
  const registrarEscucha = async () => {
    setRegistrando(true)
    const ahora = new Date().toISOString()
    const historialActual = viniloActual.historial_escuchas || []
    // Añadimos la nueva fecha al principio para que las más recientes salgan primero
    const nuevoHistorial = [ahora, ...historialActual]

    const { error } = await supabase
      .from('vinilos')
      .update({ 
        ultima_escucha: ahora,
        historial_escuchas: nuevoHistorial
      })
      .eq('id', viniloActual.id)

    if (!error) {
      setViniloActual({ ...viniloActual, ultima_escucha: ahora, historial_escuchas: nuevoHistorial })
      refrescarVinilos() 
      alert('¡Escucha registrada correctamente! 🎧')
    } else {
      alert('Hubo un error al registrar la escucha.')
      console.error(error)
    }
    setRegistrando(false)
  }

  const renderEstrellas = (valoracion) => {
    const puntos = valoracion || 0
    return '★'.repeat(puntos) + '☆'.repeat(5 - puntos)
  }

  // Preparamos las canciones
  const cancionesArray = viniloActual.canciones 
    ? viniloActual.canciones.split('\n').filter(c => c.trim() !== '') 
    : []

  // Función para poner la fecha bonita (ej: 3 ago 2026, 17:40)
  const formatearFecha = (isoString) => {
    const fecha = new Date(isoString)
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={estilos.contenedor}>
      
      {/* CABECERA: Botón volver y contador de escuchas con icono representativo */}
      <div style={estilos.header}>
        <button style={estilos.btnVolver} onClick={volver}>
          {"<"}
        </button>
        <div style={estilos.contadorEscuchas}>
          {viniloActual.historial_escuchas ? viniloActual.historial_escuchas.length : 0} 🎧
        </div>
      </div>

      {/* ARTISTA SUPERIOR */}
      <h2 style={estilos.artistaPrincipal}>{viniloActual.autor}</h2>

      {/* TARJETA HERO */}
      <div style={estilos.tarjetaHero}>
        <img 
          src={viniloActual.imagen_url || 'https://via.placeholder.com/150/1E1E1E/FFFFFF?text=🎵'} 
          alt={viniloActual.titulo} 
          style={estilos.portada} 
        />
        <div style={estilos.infoHero}>
          <h3 style={estilos.tituloHero}>{viniloActual.titulo}</h3>
          <p style={estilos.metaHero}>
            {viniloActual.año || 'Sin año'} • {viniloActual.genero || 'Sin género'}
          </p>
          <div style={estilos.estrellas}>
            {renderEstrellas(viniloActual.valoracion)}
          </div>
        </div>
      </div>

      {/* LISTA DE CANCIONES OSCURA (Sin el icono de Play) */}
      <h3 style={estilos.tituloSeccion}>Canciones</h3>
      <div style={estilos.cajaSeccion}>
        {cancionesArray.length > 0 ? (
          cancionesArray.map((cancion, index) => {
            const nombreLimpio = cancion.replace(/^\d+[\.\-]\s*/, '')
            const esUltimo = index === cancionesArray.length - 1

            return (
              <div 
                key={index} 
                style={{
                  ...estilos.itemLista, 
                  borderBottom: esUltimo ? 'none' : '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <span style={estilos.textoLista}>
                  {index + 1}. {nombreLimpio}
                </span>
              </div>
            )
          })
        ) : (
          <p style={estilos.textoVacio}>No hay canciones añadidas.</p>
        )}
      </div>

      {/* HISTORIAL DE ESCUCHAS */}
      <h3 style={estilos.tituloSeccion}>Historial de Escuchas</h3>
      <div style={estilos.cajaSeccion}>
        {viniloActual.historial_escuchas && viniloActual.historial_escuchas.length > 0 ? (
          viniloActual.historial_escuchas.map((fechaIso, index) => {
            const esUltimo = index === viniloActual.historial_escuchas.length - 1
            return (
              <div 
                key={index}
                style={{
                  ...estilos.itemLista,
                  borderBottom: esUltimo ? 'none' : '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <span style={estilos.textoLista}>
                  {formatearFecha(fechaIso)}
                </span>
              </div>
            )
          })
        ) : (
          <p style={estilos.textoVacio}>Aún no hay registros. ¡Dale al botón para estrenarlo!</p>
        )}
      </div>

      {/* BOTÓN INFERIOR */}
      <button 
        style={estilos.btnEscuchar} 
        onClick={registrarEscucha}
        disabled={registrando}
      >
        {registrando ? 'Registrando...' : '🎧 Registrar Escucha'}
      </button>

    </div>
  )
}

const estilos = {
  contenedor: {
    padding: '20px',
    color: tema.textoPrincipal,
    paddingBottom: '40px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  btnVolver: {
    background: 'none',
    border: 'none',
    color: tema.acento,
    fontSize: '24px',
    cursor: 'pointer',
    padding: 0,
    fontWeight: 'bold'
  },
  contadorEscuchas: {
    fontSize: '20px',
    color: tema.textoPrincipal,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  artistaPrincipal: {
    fontSize: '22px',
    color: tema.acento,
    margin: '0 0 15px 0',
    fontFamily: tema.fuentePrincipal
  },
  tarjetaHero: {
    backgroundColor: tema.superficieClara,
    borderRadius: '16px',
    padding: '15px',
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  },
  portada: {
    width: '95px',
    height: '95px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  infoHero: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1
  },
  tituloHero: {
    fontSize: '20px',
    margin: '0 0 6px 0',
    color: tema.acento,
    fontFamily: tema.fuentePrincipal
  },
  metaHero: {
    fontSize: '14px',
    color: tema.textoSecundario,
    margin: '0 0 8px 0'
  },
  estrellas: {
    color: tema.acento,
    letterSpacing: '2px',
    fontSize: '15px'
  },
  tituloSeccion: {
    fontSize: '18px',
    color: tema.textoPrincipal,
    marginBottom: '12px'
  },
  cajaSeccion: {
    backgroundColor: tema.superficieClara,
    borderRadius: '16px',
    padding: '10px 15px',
    marginBottom: '30px'
  },
  itemLista: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
  },
  textoLista: {
    fontSize: '15px',
    color: tema.textoPrincipal
  },
  textoVacio: {
    color: tema.textoSecundario,
    fontStyle: 'italic',
    fontSize: '14px',
    margin: '5px 0'
  },
  btnEscuchar: {
    width: '100%',
    padding: '16px',
    backgroundColor: tema.acento,
    color: '#000',
    border: 'none',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}