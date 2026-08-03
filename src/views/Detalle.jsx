import { useState } from 'react'
import { supabase } from '../supabase'
import { tema } from '../theme'

export default function Detalle({ vinilo, volver, refrescarVinilos }) {
  const [registrando, setRegistrando] = useState(false)
  const [viniloActual, setViniloActual] = useState(vinilo)

  // FUNCIÓN CORREGIDA: Guarda en el array de la propia tabla vinilos
  const registrarEscucha = async () => {
    setRegistrando(true)
    const ahora = new Date().toISOString()
    const historialActual = viniloActual.historial_escuchas || []
    const nuevoHistorial = [ahora, ...historialActual]

    const { error } = await supabase
      .from('vinilos')
      .update({ 
        ultima_escucha: ahora,
        historial_escuchas: nuevoHistorial
      })
      .eq('id', viniloActual.id)

    if (!error) {
      // Actualizamos la vista al instante sin tener que recargar
      setViniloActual({ ...viniloActual, ultima_escucha: ahora, historial_escuchas: nuevoHistorial })
      refrescarVinilos() // Actualiza la lista principal de fondo
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

  // Preparamos las canciones (quitamos líneas vacías)
  const cancionesArray = viniloActual.canciones 
    ? viniloActual.canciones.split('\n').filter(c => c.trim() !== '') 
    : []

  return (
    <div style={estilos.contenedor}>
      
      {/* CABECERA: Botón volver y contador de escuchas */}
      <div style={estilos.header}>
        <button style={estilos.btnVolver} onClick={volver}>
          {"<"}
        </button>
        <div style={estilos.corazon}>
          {viniloActual.historial_escuchas ? viniloActual.historial_escuchas.length : 0} 🤍
        </div>
      </div>

      {/* ARTISTA SUPERIOR */}
      <h2 style={estilos.artistaPrincipal}>{viniloActual.autor}</h2>

      {/* TARJETA HERO (Diseño horizontal exacto a tu imagen 3) */}
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

      {/* LISTA DE CANCIONES OSCURA */}
      <h3 style={estilos.tituloSeccion}>Canciones</h3>
      <div style={estilos.cajaCanciones}>
        {cancionesArray.length > 0 ? (
          cancionesArray.map((cancion, index) => {
            // Limpiamos si Edu ya le puso el "1." para no duplicar números
            const nombreLimpio = cancion.replace(/^\d+[\.\-]\s*/, '')
            const esUltimo = index === cancionesArray.length - 1

            return (
              <div 
                key={index} 
                style={{
                  ...estilos.itemCancion, 
                  borderBottom: esUltimo ? 'none' : `1px solid ${tema.borde}`
                }}
              >
                <span style={estilos.textoCancion}>
                  {index + 1}. {nombreLimpio}
                </span>
                <span style={estilos.iconoPlay}>▶</span>
              </div>
            )
          })
        ) : (
          <p style={estilos.textoVacio}>No hay canciones añadidas.</p>
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
  corazon: {
    fontSize: '20px',
    color: tema.textoPrincipal,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  artistaPrincipal: {
    fontSize: '22px',
    color: tema.acento, // Color dorado/champagne
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
  cajaCanciones: {
    backgroundColor: tema.superficieClara,
    borderRadius: '16px',
    padding: '10px 15px',
    marginBottom: '30px'
  },
  itemCancion: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
  },
  textoCancion: {
    fontSize: '15px',
    color: tema.textoPrincipal
  },
  iconoPlay: {
    color: tema.acento,
    fontSize: '12px',
    backgroundColor: tema.superficie,
    padding: '6px 8px',
    borderRadius: '50%'
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
    backgroundColor: tema.acento, // Fondo dorado
    color: '#000', // Texto negro para contraste
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