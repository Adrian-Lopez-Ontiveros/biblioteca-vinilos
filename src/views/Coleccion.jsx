import { tema } from '../theme'

export default function Coleccion({ vinilos, abrirDetalle }) {
  
  const renderEstrellas = (valoracion) => {
    const max = 5;
    const puntos = valoracion || 0;
    return '★'.repeat(puntos) + '☆'.repeat(max - puntos);
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.cabeceraFija}>
        <h1 style={estilos.titulo}>Mi colección</h1>
        <div style={estilos.filtros}>
          <span style={estilos.conteo}>{vinilos.length} vinilos</span>
          <button style={estilos.botonFiltro}>A-Z ⌄</button>
        </div>
      </div>

      <div style={estilos.lista}>
        {vinilos.map(vinilo => (
          <div 
            key={vinilo.id} 
            style={{...estilos.tarjetaLista, cursor: 'pointer'}} 
            onClick={() => abrirDetalle(vinilo)}
          >
            <img 
              src={vinilo.imagen_url || 'https://via.placeholder.com/150/1E1E1E/FFFFFF?text=🎵'} 
              alt={vinilo.titulo} 
              style={estilos.portada} 
            />
            <div style={estilos.info}>
              <h3 style={estilos.tituloVinilo}>{vinilo.titulo}</h3>
              <p style={estilos.autor}>{vinilo.autor}</p>
              <p style={estilos.meta}>
                {vinilo.año || 'Sin año'} • {vinilo.genero || 'Sin género'}
              </p>
              <div style={estilos.estrellas}>
                {renderEstrellas(vinilo.valoracion)}
              </div>
            </div>
            <button style={estilos.opciones} onClick={(e) => e.stopPropagation()}>•••</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const estilos = {
  contenedor: { padding: '20px' },
  cabeceraFija: { marginBottom: '25px', paddingTop: '10px' },
  titulo: { fontSize: '24px', margin: '0 0 20px 0', textAlign: 'center', fontFamily: tema.fuentePrincipal },
  filtros: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  conteo: { fontSize: '14px', color: tema.textoSecundario },
  botonFiltro: { background: 'none', border: 'none', color: tema.textoSecundario, fontSize: '14px', cursor: 'pointer' },
  
  lista: { display: 'flex', flexDirection: 'column', gap: '15px' },
  tarjetaLista: { display: 'flex', alignItems: 'center', backgroundColor: tema.superficie, padding: '12px', borderRadius: '8px', gap: '15px' },
  portada: { width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover', backgroundColor: tema.superficieClara },
  info: { flex: 1, overflow: 'hidden' },
  tituloVinilo: { fontSize: '16px', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: tema.textoPrincipal },
  autor: { fontSize: '14px', color: tema.textoSecundario, margin: '0 0 4px 0' },
  meta: { fontSize: '12px', color: tema.textoSecundario, margin: '0 0 6px 0' },
  estrellas: { fontSize: '14px', color: tema.acento, letterSpacing: '2px' },
  opciones: { background: 'none', border: 'none', color: tema.textoSecundario, fontSize: '20px', cursor: 'pointer', padding: '10px' }
}