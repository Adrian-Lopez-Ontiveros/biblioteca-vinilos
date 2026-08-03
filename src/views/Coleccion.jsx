import { useState } from 'react'
import { supabase } from '../supabase'
import { tema } from '../theme'

export default function Coleccion({ vinilos, abrirDetalle, refrescarVinilos, irAEditar }) {
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [busqueda, setBusqueda] = useState('') // Estado para la barra de búsqueda

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

  // Filtramos los vinilos basándonos en lo que escriba (por título o por autor)
  const vinilosFiltrados = vinilos.filter(vinilo => 
    vinilo.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (vinilo.autor && vinilo.autor.toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <div style={estilos.contenedor} onClick={() => setMenuAbierto(null)}>
      <h2 style={estilos.tituloPrincipal}>Mi Colección</h2>
      
      {/* Barra de búsqueda */}
      <input 
        type="text" 
        placeholder="🔍 Buscar por nombre o autor..." 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={estilos.inputBusqueda}
      />
      
      <div style={estilos.lista}>
        {vinilosFiltrados.length === 0 ? (
          <p style={estilos.textoVacio}>
            {busqueda ? 'No se encontraron vinilos con ese nombre.' : 'Aún no hay vinilos en la colección.'}
          </p>
        ) : (
          vinilosFiltrados.map(vinilo => (
            <div key={vinilo.id} style={estilos.tarjeta} onClick={() => abrirDetalle(vinilo)}>
              
              <img 
                src={vinilo.imagen_url || 'https://via.placeholder.com/150/1E1E1E/FFFFFF?text=🎵'} 
                alt={vinilo.titulo} 
                style={estilos.portada} 
              />
              
              <div style={estilos.info}>
                <h4 style={estilos.titulo}>{vinilo.titulo}</h4>
                <p style={estilos.autor}>{vinilo.autor}</p>
              </div>

              <div style={estilos.menuContenedor}>
                <button style={estilos.btnPuntos} onClick={(e) => toggleMenu(e, vinilo.id)}>
                  ⋮
                </button>
                
                {menuAbierto === vinilo.id && (
                  <div style={estilos.dropdown}>
                    <button style={{...estilos.btnOpcion, color: '#4CAF50'}} onClick={(e) => clickEditar(e, vinilo)}>
                      Editar
                    </button>
                    <div style={estilos.separador}></div>
                    <button style={{...estilos.btnOpcion, color: '#F44336'}} onClick={(e) => clickBorrar(e, vinilo)}>
                      Borrar
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

const estilos = {
  contenedor: { padding: '20px', minHeight: '100vh' },
  tituloPrincipal: { color: tema.acento, fontFamily: tema.fuentePrincipal, fontSize: '24px', marginBottom: '15px' },
  inputBusqueda: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: '12px',
    border: `1px solid ${tema.borde}`,
    backgroundColor: tema.superficieClara,
    color: tema.textoPrincipal,
    fontSize: '16px',
    marginBottom: '25px',
    outline: 'none'
  },
  lista: { display: 'flex', flexDirection: 'column', gap: '15px' },
  textoVacio: { color: tema.textoSecundario, fontStyle: 'italic', textAlign: 'center', marginTop: '20px' },
  tarjeta: { 
    backgroundColor: tema.superficieClara, 
    borderRadius: '12px', 
    padding: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  portada: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' },
  info: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  titulo: { margin: '0 0 4px 0', color: tema.textoPrincipal, fontSize: '16px', fontWeight: 'bold', fontFamily: tema.fuentePrincipal },
  autor: { margin: 0, color: tema.textoSecundario, fontSize: '14px' },
  menuContenedor: { position: 'relative' },
  btnPuntos: { 
    background: 'none', border: 'none', color: tema.textoSecundario, 
    fontSize: '24px', padding: '5px 10px', cursor: 'pointer', 
    fontWeight: 'bold', lineHeight: '1'
  },
  dropdown: { 
    position: 'absolute', right: '10px', top: '35px', 
    backgroundColor: tema.superficie, borderRadius: '8px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 10, 
    display: 'flex', flexDirection: 'column', minWidth: '100px', 
    border: `1px solid ${tema.borde}`, overflow: 'hidden'
  },
  btnOpcion: { 
    background: 'none', border: 'none', padding: '12px 16px', 
    fontSize: '15px', cursor: 'pointer', textAlign: 'left', 
    fontWeight: 'bold', width: '100%'
  },
  separador: { height: '1px', backgroundColor: tema.borde, margin: 0 }
}