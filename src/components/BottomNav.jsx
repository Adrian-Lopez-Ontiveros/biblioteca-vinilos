import { tema } from '../theme'

export default function BottomNav({ vistaActual, setVistaActual }) {
  return (
    <div style={estilos.nav}>
      <button 
        style={vistaActual === 'inicio' ? estilos.btnActivo : estilos.btn} 
        onClick={() => setVistaActual('inicio')}
      >
        🏠<span style={estilos.texto}>Inicio</span>
      </button>
      
      <button 
        style={vistaActual === 'coleccion' || vistaActual === 'detalle' ? estilos.btnActivo : estilos.btn} 
        onClick={() => setVistaActual('coleccion')}
      >
        💿<span style={estilos.texto}>Colección</span>
      </button>

      <button 
        style={vistaActual === 'añadir' || vistaActual === 'editar' ? estilos.btnActivo : estilos.btn} 
        onClick={() => setVistaActual('añadir')}
      >
        ➕<span style={estilos.texto}>Añadir</span>
      </button>
    </div>
  )
}

const estilos = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: tema.superficie,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0 20px 0',
    borderTop: `1px solid ${tema.borde}`,
    zIndex: 1000
  },
  btn: {
    background: 'none',
    border: 'none',
    color: tema.textoSecundario,
    fontSize: '22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    filter: 'grayscale(1)'
  },
  btnActivo: {
    background: 'none',
    border: 'none',
    color: tema.acento,
    fontSize: '22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer'
  },
  texto: {
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: tema.fuenteSecundaria
  }
}