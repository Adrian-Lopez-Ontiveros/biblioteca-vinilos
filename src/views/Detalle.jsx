import { useState } from 'react'
import { supabase } from '../supabase'
import { tema } from '../theme'

export default function Detalle({ vinilo, volver, refrescarVinilos }) {
  const [registrando, setRegistrando] = useState(false)

  // Función para registrar la escucha en la base de datos
  const registrarEscucha = async () => {
    setRegistrando(true)
    
    const { error } = await supabase
      .from('historial_escuchas')
      .insert([{ vinilo_id: vinilo.id, fecha: new Date().toISOString() }])
    
    if (!error) {
      await refrescarVinilos()
      alert('¡Escucha registrada correctamente!')
    } else {
      alert('Hubo un error al registrar la escucha.')
      console.error(error)
    }
    
    setRegistrando(false)
  }

  return (
    <div style={estilos.contenedor}>
      {/* Aquí está el botón corregido para que Vercel no dé error */}
      <button style={estilos.btnVolver} onClick={volver}>
        {"< Volver"}
      </button>

      <div style={estilos.tarjeta}>
        <div style={estilos.portadaPlaceholder}>
          <span style={{ fontSize: '50px' }}>💿</span>
        </div>
        
        <h2 style={estilos.titulo}>{vinilo.titulo}</h2>
        <h3 style={estilos.autor}>{vinilo.autor}</h3>
        
        <div style={estilos.infoGrid}>
          <p style={estilos.infoTexto}><strong>Año:</strong> {vinilo.year || 'Desconocido'}</p>
          <p style={estilos.infoTexto}><strong>Género:</strong> {vinilo.genero || 'Sin clasificar'}</p>
          <p style={estilos.infoTexto}><strong>Valoración:</strong> {vinilo.rating ? `${vinilo.rating}/5` : 'Sin valorar'}</p>
        </div>

        {vinilo.canciones && (
          <div style={estilos.seccionCanciones}>
            <h4 style={estilos.subtitulo}>Lista de Canciones</h4>
            <p style={estilos.canciones}>{vinilo.canciones}</p>
          </div>
        )}

        <button 
          style={estilos.btnEscuchar} 
          onClick={registrarEscucha}
          disabled={registrando}
        >
          {registrando ? 'Registrando...' : '🎧 Registrar Escucha'}
        </button>
      </div>
    </div>
  )
}

const estilos = {
  contenedor: {
    padding: '20px',
    color: tema.textoPrincipal
  },
  btnVolver: {
    background: 'none',
    border: 'none',
    color: tema.primario,
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold'
  },
  tarjeta: {
    backgroundColor: '#1E1E1E', // Fondo oscuro tipo tarjeta
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
  },
  portadaPlaceholder: {
    width: '100%',
    height: '250px',
    backgroundColor: '#2A2A2A',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px'
  },
  titulo: {
    margin: '0 0 5px 0',
    color: tema.textoPrincipal,
    fontSize: '24px'
  },
  autor: {
    margin: '0 0 20px 0',
    color: tema.textoSecundario,
    fontSize: '18px',
    fontWeight: 'normal'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '20px'
  },
  infoTexto: {
    margin: 0,
    fontSize: '14px',
    color: tema.textoSecundario
  },
  seccionCanciones: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#2A2A2A',
    borderRadius: '8px'
  },
  subtitulo: {
    margin: '0 0 10px 0',
    color: tema.primario, // Tono champagne/dorado
    fontSize: '16px'
  },
  canciones: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: tema.textoPrincipal,
    lineHeight: '1.5'
  },
  btnEscuchar: {
    width: '100%',
    padding: '15px',
    backgroundColor: tema.primario,
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10px'
  }
}