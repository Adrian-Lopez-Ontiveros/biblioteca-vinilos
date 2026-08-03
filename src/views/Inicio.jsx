import { tema } from '../theme'

export default function Inicio({ vinilos, setVistaActual, abrirDetalle }) {
  const totalVinilos = vinilos.length
  const totalEscuchas = vinilos.reduce((total, v) => total + (v.historial_escuchas ? v.historial_escuchas.length : 0), 0)
  
  // Cogemos los 5 últimos añadidos para el carrusel
  const recientes = vinilos.slice(0, 5)

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.tituloPrincipal}>Los Vinilos De Edu</h1>
      
      <div style={estilos.statsContainer}>
        <div style={estilos.statCard}>
          <span style={estilos.statNumero}>{totalVinilos}</span>
          <span style={estilos.statTexto}>Vinilos</span>
        </div>
        <div style={estilos.statCard}>
          <span style={estilos.statNumero}>{totalEscuchas}</span>
          <span style={estilos.statTexto}>Escuchas</span>
        </div>
      </div>

      <div style={estilos.seccionHeader}>
        <h2 style={estilos.subtitulo}>Últimos añadidos</h2>
        <button style={estilos.btnVerTodos} onClick={() => setVistaActual('coleccion')}>
          Ver todos
        </button>
      </div>

      <div style={estilos.carrusel}>
        {recientes.length === 0 ? (
          <p style={estilos.textoVacio}>Añade tu primer vinilo para verlo aquí.</p>
        ) : (
          recientes.map(vinilo => (
            <div key={vinilo.id} style={estilos.tarjetaCarrusel} onClick={() => abrirDetalle(vinilo)}>
              <img 
                src={vinilo.imagen_url || 'https://via.placeholder.com/150/1E1E1E/FFFFFF?text=🎵'} 
                alt={vinilo.titulo} 
                style={estilos.portadaCarrusel} 
              />
              <p style={estilos.tituloCarrusel}>{vinilo.titulo}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const estilos = {
  contenedor: { padding: '20px' },
  tituloPrincipal: { color: tema.acento, fontFamily: tema.fuentePrincipal, fontSize: '32px', marginBottom: '25px', textAlign: 'center' },
  statsContainer: { display: 'flex', gap: '15px', marginBottom: '35px' },
  statCard: { flex: 1, backgroundColor: tema.superficieClara, borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  statNumero: { color: tema.acento, fontSize: '36px', fontWeight: 'bold', fontFamily: tema.fuentePrincipal, marginBottom: '5px' },
  statTexto: { color: tema.textoSecundario, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' },
  seccionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  subtitulo: { color: tema.textoPrincipal, fontSize: '20px', margin: 0 },
  btnVerTodos: { background: 'none', border: 'none', color: tema.acento, fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' },
  carrusel: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' },
  tarjetaCarrusel: { minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' },
  portadaCarrusel: { width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' },
  tituloCarrusel: { color: tema.textoPrincipal, fontSize: '14px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' },
  textoVacio: { color: tema.textoSecundario, fontStyle: 'italic' }
}