import { tema } from '../theme'

export default function BottomNav({ vistaActual, setVistaActual }) {
  const botones = [
    { id: 'inicio', icono: '🏠', texto: 'Inicio' },
    { id: 'coleccion', icono: '📀', texto: 'Colección' },
    { id: 'buscar', icono: '🔍', texto: 'Buscar' },
    { id: 'añadir', icono: '➕', texto: 'Añadir' }
  ]

  return (
    <div style={estilos.contenedor}>
      {botones.map((boton) => {
        const activo = vistaActual === boton.id;
        return (
          <button 
            key={boton.id} 
            style={estilos.boton} 
            onClick={() => setVistaActual(boton.id)}
          >
            <span style={{ 
              fontSize: '22px', 
              opacity: activo ? 1 : 0.5,
              filter: activo ? 'none' : 'grayscale(100%)'
            }}>
              {boton.icono}
            </span>
            <span style={{ 
              ...estilos.texto, 
              color: activo ? tema.textoPrincipal : tema.textoSecundario 
            }}>
              {boton.texto}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const estilos = {
  contenedor: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70px',
    backgroundColor: '#000000',
    borderTop: `1px solid ${tema.borde}`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 'env(safe-area-inset-bottom)', // Protege contra la barra del iPhone
    zIndex: 1000
  },
  boton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    width: '60px'
  },
  texto: {
    fontSize: '10px',
    fontFamily: tema.fuenteSecundaria,
    fontWeight: '500'
  }
}