import { tema } from '../theme'

export default function Inicio({ vinilos, setVistaActual, abrirDetalle }) {
  // Cálculos rápidos para las estadísticas de Edu
  const artistasUnicos = new Set(vinilos.map(v => v.autor).filter(Boolean)).size
  const generosUnicos = new Set(vinilos.map(v => v.genero).filter(Boolean)).size
  const recientes = vinilos.slice(0, 5) // Mostramos solo los 5 más recientes

  return (
    <div style={estilos.contenedor}>
      <header style={estilos.cabecera}>
        <h1 style={estilos.titulo}>Mi Biblioteca<br/>de Vinilos</h1>
        <p style={estilos.subtitulo}>Tu música. Tu colección. Tu historia.</p>
      </header>

      {/* Tarjetas de estadísticas */}
      <div style={estilos.gridStats}>
        <div style={estilos.tarjetaStat}>
          <div style={estilos.iconoStat}>📀</div>
          <div style={estilos.valorStat}>{vinilos.length}</div>
          <div style={estilos.labelStat}>vinilos</div>
        </div>
        <div style={estilos.tarjetaStat}>
          <div style={estilos.iconoStat}>🎵</div>
          <div style={estilos.valorStat}>{artistasUnicos}</div>
          <div style={estilos.labelStat}>artistas</div>
        </div>
        <div style={estilos.tarjetaStat}>
          <div style={estilos.iconoStat}>🎛️</div>
          <div style={estilos.valorStat}>{generosUnicos}</div>
          <div style={estilos.labelStat}>géneros</div>
        </div>
      </div>

      {/* Colección Reciente (Carrusel Horizontal) */}
      <section style={estilos.seccion}>
        <div style={estilos.cabeceraSeccion}>
          <h2 style={estilos.tituloSeccion}>Colección reciente</h2>
          <button style={estilos.botonVerTodo} onClick={() => setVistaActual('coleccion')}>Ver todo</button>
        </div>
        
        <div style={estilos.carrusel}>
          {recientes.map(vinilo => (
            <div key={vinilo.id} style={estilos.tarjetaReciente} onClick={() => abrirDetalle(vinilo)}>
              <img 
                src={vinilo.imagen_url || 'https://via.placeholder.com/150/1E1E1E/FFFFFF?text=🎵'} 
                alt={vinilo.titulo} 
                style={estilos.portadaReciente} 
              />
              <h3 style={estilos.tituloVinilo}>{vinilo.titulo}</h3>
              <p style={estilos.autorVinilo}>{vinilo.autor}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const estilos = {
  contenedor: { padding: '20px' },
  cabecera: { marginBottom: '30px', marginTop: '10px' },
  titulo: { fontSize: '36px', margin: '0 0 10px 0', fontFamily: tema.fuentePrincipal, lineHeight: '1.1' },
  subtitulo: { fontSize: '14px', color: tema.textoSecundario, margin: 0 },
  
  gridStats: { display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' },
  tarjetaStat: { flex: '1', minWidth: '95px', backgroundColor: tema.superficieClara, padding: '15px 10px', borderRadius: '12px', textAlign: 'center' },
  iconoStat: { fontSize: '24px', marginBottom: '8px' },
  valorStat: { fontSize: '22px', fontWeight: 'bold', color: tema.textoPrincipal },
  labelStat: { fontSize: '12px', color: tema.textoSecundario },

  seccion: { marginBottom: '30px' },
  cabeceraSeccion: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  tituloSeccion: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
  botonVerTodo: { background: 'none', border: 'none', color: tema.textoSecundario, fontSize: '14px', cursor: 'pointer' },

  carrusel: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' },
  tarjetaReciente: { minWidth: '140px', width: '140px', scrollSnapAlign: 'start', cursor: 'pointer' },
  portadaReciente: { width: '140px', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', backgroundColor: tema.superficieClara },
  tituloVinilo: { fontSize: '14px', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  autorVinilo: { fontSize: '12px', color: tema.textoSecundario, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
}