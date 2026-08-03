import { useState } from 'react'
import { supabase } from '../supabase'
import { tema } from '../theme'

export default function Coleccion({ vinilos, abrirDetalle, refrescarVinilos, irAEditar }) {
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [agrupacion, setAgrupacion] = useState('recientes') // 'recientes', 'letra', 'autor'

  const toggleMenu = (e, id) => {
    e.stopPropagation() 
    setMenuAbierto(menuAbierto === id ? null : id)
  }

  const clickEditar = (e, vinilo) => {
    e.stopPropagation()
    setMenuAbierto(null)
    irAEditar(vinilo)
  }

  const clickBorrar = async (e, vinilo) => {
    e.stopPropagation()
    setMenuAbierto(null)
    if (window.confirm(`¿Seguro que quieres borrar "${vinilo.titulo}"? Esta acción no se puede deshacer.`)) {
      await supabase.from('vinilos').delete().eq('id', vinilo.id)
      refrescarVinilos()
    }
  }

  // 1. Filtramos por la barra de búsqueda
  const vinilosFiltrados = vinilos.filter(vinilo => 
    vinilo.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (vinilo.autor && vinilo.autor.toLowerCase().includes(busqueda.toLowerCase()))
  )

  // Función auxiliar para dibujar una tarjeta de vinilo (así no repetimos código)
  const renderTarjeta = (vinilo) => (
    <div key={vinilo.id} style={estilos.tarjeta} onClick={() => abrirDetalle(vinilo)}>
      <img 
        src={vinilo.imagen_url || 'https://via.placeholder.com/150/1E1E1E/FFFFFF?text=🎵'} 
        alt={vinilo.titulo} 
        style={estilos.portada} 
      />
      <div style={estilos.info}>
        <h4 style={estilos.tituloVinilo}>{vinilo.titulo}</h4>
        <p style={estilos.autorVinilo}>{vinilo.autor}</p>
      </div>
      <div style={estilos.menuContenedor}>
        <button style={estilos.btnPuntos} onClick={(e) => toggleMenu(e, vinilo.id)}>⋮</button>
        {menuAbierto === vinilo.id && (
          <div style={estilos.dropdown}>
            <button style={{...estilos.btnOpcion, color: '#4CAF50'}} onClick={(e) => clickEditar(e, vinilo)}>Editar</button>
            <div style={estilos.separador}></div>
            <button style={{...estilos.btnOpcion, color: '#F44336'}} onClick={(e) => clickBorrar(e, vinilo)}>Borrar</button>
          </div>
        )}
      </div>
    </div>
  )

  // 2. Lógica para agrupar el contenido según el filtro seleccionado
  const renderContenido = () => {
    if (vinilosFiltrados.length === 0) {
      return <p style={estilos.textoVacio}>{busqueda ? 'No se encontraron vinilos.' : 'Aún no hay vinilos.'}</p>
    }

    if (agrupacion === 'recientes') {
      return <div style={estilos.lista}>{vinilosFiltrados.map(renderTarjeta)}</div>
    }

    if (agrupacion === 'letra') {
      // Agrupar por primera letra
      const grupos = {}
      vinilosFiltrados.forEach(v => {
        const letra = v.titulo.charAt(0).toUpperCase()
        if (!grupos[letra]) grupos[letra] = []
        grupos[letra].push(v)
      })
      const letrasOrdenadas = Object.keys(grupos).sort()

      return (
        <div style={estilos.lista}>
          {letrasOrdenadas.map(letra => (
            <div key={letra} style={estilos.grupoContenedor}>
              <h3 style={estilos.tituloGrupo}>{letra}</h3>
              <div style={estilos.listaCarpeta}>{grupos[letra].map(renderTarjeta)}</div>
            </div>
          ))}
        </div>
      )
    }

    if (agrupacion === 'autor') {
      // Agrupar por autor
      const grupos = {}
      vinilosFiltrados.forEach(v => {
        const autor = v.autor || 'Desconocido'
        if (!grupos[autor]) grupos[autor] = []
        grupos[autor].push(v)
      })
      const autoresOrdenados = Object.keys(grupos).sort()

      return (
        <div style={estilos.lista}>
          {autoresOrdenados.map(autor => (
            <div key={autor} style={estilos.grupoContenedor}>
              <h3 style={estilos.tituloGrupo}>{autor}</h3>
              <div style={estilos.listaCarpeta}>{grupos[autor].map(renderTarjeta)}</div>
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <div style={estilos.contenedor} onClick={() => setMenuAbierto(null)}>
      <h2 style={estilos.tituloPrincipal}>Mi Colección</h2>
      
      {/* Barra de búsqueda (Sin emoji) */}
      <input 
        type="text" 
        placeholder="Buscar por nombre o autor..." 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={estilos.inputBusqueda}
      />

      {/* Botones de filtro */}
      <div style={estilos.filtros}>
        <button 
          style={agrupacion === 'recientes' ? estilos.chipActivo : estilos.chip} 
          onClick={() => setAgrupacion('recientes')}
        >
          Añadidos
        </button>
        <button 
          style={agrupacion === 'letra' ? estilos.chipActivo : estilos.chip} 
          onClick={() => setAgrupacion('letra')}
        >
          Por Letra
        </button>
        <button 
          style={agrupacion === 'autor' ? estilos.chipActivo : estilos.chip} 
          onClick={() => setAgrupacion('autor')}
        >
          Por Autor
        </button>
      </div>
      
      {/* Lista de vinilos o carpetas */}
      {renderContenido()}
      
    </div>
  )
}

const estilos = {
  contenedor: { padding: '20px', minHeight: '100vh' },
  tituloPrincipal: { color: tema.acento, fontFamily: tema.fuentePrincipal, fontSize: '24px', marginBottom: '15px' },
  inputBusqueda: { width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${tema.borde}`, backgroundColor: tema.superficieClara, color: tema.textoPrincipal, fontSize: '16px', marginBottom: '15px', outline: 'none' },
  
  filtros: { display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' },
  chip: { padding: '8px 16px', borderRadius: '20px', border: `1px solid ${tema.borde}`, backgroundColor: 'transparent', color: tema.textoSecundario, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' },
  chipActivo: { padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: tema.acento, color: '#000', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' },
  
  lista: { display: 'flex', flexDirection: 'column', gap: '15px' },
  textoVacio: { color: tema.textoSecundario, fontStyle: 'italic', textAlign: 'center', marginTop: '20px' },
  
  grupoContenedor: { marginBottom: '15px' },
  tituloGrupo: { color: tema.textoSecundario, fontSize: '18px', marginBottom: '10px', borderBottom: `1px solid ${tema.borde}`, paddingBottom: '5px' },
  listaCarpeta: { display: 'flex', flexDirection: 'column', gap: '15px', paddingLeft: '10px', borderLeft: `2px solid ${tema.borde}` },
  
  tarjeta: { backgroundColor: tema.superficieClara, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
  portada: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' },
  info: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  tituloVinilo: { margin: '0 0 4px 0', color: tema.textoPrincipal, fontSize: '16px', fontWeight: 'bold', fontFamily: tema.fuentePrincipal },
  autorVinilo: { margin: 0, color: tema.textoSecundario, fontSize: '14px' },
  menuContenedor: { position: 'relative' },
  btnPuntos: { background: 'none', border: 'none', color: tema.textoSecundario, fontSize: '24px', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold', lineHeight: '1' },
  dropdown: { position: 'absolute', right: '10px', top: '35px', backgroundColor: tema.superficie, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '100px', border: `1px solid ${tema.borde}`, overflow: 'hidden' },
  btnOpcion: { background: 'none', border: 'none', padding: '12px 16px', fontSize: '15px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', width: '100%' },
  separador: { height: '1px', backgroundColor: tema.borde, margin: 0 }
}