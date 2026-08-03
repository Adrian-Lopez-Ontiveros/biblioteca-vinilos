import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [vista, setVista] = useState('galeria') 
  const [vinilos, setVinilos] = useState([])
  const [viniloSeleccionado, setViniloSeleccionado] = useState(null)
  
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [idEditando, setIdEditando] = useState(null)
  
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [duracion, setDuracion] = useState('')
  const [canciones, setCanciones] = useState('') // NUEVO: Estado para las canciones
  const [archivo, setArchivo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (vista === 'galeria') {
      obtenerVinilos()
    }
  }, [vista])

  const obtenerVinilos = async () => {
    const { data, error } = await supabase
      .from('vinilos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setVinilos(data)
  }

  const guardarVinilo = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    try {
      let imagenUrl = ''
      
      if (archivo) {
        const extension = archivo.name.split('.').pop()
        const nombreArchivo = `${Date.now()}.${extension}`
        
        const { error: errorSubida } = await supabase.storage
          .from('portadas')
          .upload(nombreArchivo, archivo)

        if (errorSubida) throw errorSubida

        const { data: urlData } = supabase.storage
          .from('portadas')
          .getPublicUrl(nombreArchivo)
          
        imagenUrl = urlData.publicUrl
      }

      if (idEditando) {
        const datosActualizados = { titulo, autor, duracion, canciones }
        if (imagenUrl) datosActualizados.imagen_url = imagenUrl 

        const { error: errorBaseDatos } = await supabase
          .from('vinilos')
          .update(datosActualizados)
          .eq('id', idEditando)

        if (errorBaseDatos) throw errorBaseDatos
        setMensaje('Obra actualizada correctamente 🎵')

      } else {
        const { error: errorBaseDatos } = await supabase
          .from('vinilos')
          .insert([{ 
            titulo, 
            autor, 
            duracion, 
            canciones, // Guardamos la lista de canciones
            imagen_url: imagenUrl,
            historial_escuchas: [] 
          }])

        if (errorBaseDatos) throw errorBaseDatos
        setMensaje('Obra añadida al archivo 🎵')
      }

      setTitulo('')
      setAutor('')
      setDuracion('')
      setCanciones('')
      setArchivo(null)
      setIdEditando(null)
      if (e.target) e.target.reset()
      
      setTimeout(() => {
        setVista('galeria')
        setMensaje('')
      }, 2000)

    } catch (error) {
      setMensaje('Error: ' + error.message)
    } finally {
      setCargando(false)
    }
  }

  const eliminarVinilo = async (e, id) => {
    e.stopPropagation() 
    setMenuAbierto(null)
    
    const confirmar = window.confirm("¿Seguro que quieres borrar este disco del archivo?")
    if (confirmar) {
      const { error } = await supabase
        .from('vinilos')
        .delete()
        .eq('id', id)
        
      if (!error) obtenerVinilos() 
    }
  }

  const iniciarEdicion = (e, vinilo) => {
    e.stopPropagation() 
    setMenuAbierto(null)
    
    setTitulo(vinilo.titulo)
    setAutor(vinilo.autor)
    setDuracion(vinilo.duracion || '')
    setCanciones(vinilo.canciones || '') // Cargamos las canciones
    setIdEditando(vinilo.id)
    setArchivo(null)
    
    setVista('añadir') 
  }

  const toggleMenu = (e, id) => {
    e.stopPropagation()
    setMenuAbierto(menuAbierto === id ? null : id)
  }

  const cerrarMenuGlobal = () => {
    if (menuAbierto) setMenuAbierto(null)
  }

  const registrarEscucha = async () => {
    const ahora = new Date().toISOString()
    const historialActual = viniloSeleccionado.historial_escuchas || []
    const nuevoHistorial = [ahora, ...historialActual]
    
    const { error } = await supabase
      .from('vinilos')
      .update({ 
        ultima_escucha: ahora,
        historial_escuchas: nuevoHistorial
      })
      .eq('id', viniloSeleccionado.id)

    if (!error) {
      setViniloSeleccionado({ 
        ...viniloSeleccionado, 
        ultima_escucha: ahora, 
        historial_escuchas: nuevoHistorial 
      })
    }
  }

  const abrirDetalle = (vinilo) => {
    setViniloSeleccionado(vinilo)
    setVista('detalle')
  }

  return (
    <div style={estilos.fondoGlobal} onClick={cerrarMenuGlobal}>
      <div style={estilos.contenedor}>
        
        <header style={estilos.cabecera}>
          <h1 style={estilos.tituloApp}>Los Vinilos de Edu</h1>
          <p style={estilos.subtituloApp}>Colección Personal</p>
        </header>

        {vista !== 'detalle' && (
          <div style={estilos.navegacion}>
            <button style={{...estilos.botonNav, borderBottom: vista === 'galeria' ? '3px solid #8B7355' : '3px solid transparent', color: vista === 'galeria' ? '#2C2A29' : '#888'}} onClick={() => setVista('galeria')}>
              Colección
            </button>
            <button style={{...estilos.botonNav, borderBottom: vista === 'añadir' ? '3px solid #8B7355' : '3px solid transparent', color: vista === 'añadir' ? '#2C2A29' : '#888'}} 
              onClick={() => {
                setIdEditando(null)
                setTitulo('')
                setAutor('')
                setDuracion('')
                setCanciones('')
                setArchivo(null)
                setVista('añadir')
              }}>
              Añadir Obra
            </button>
          </div>
        )}

        {/* VISTA 1: GALERÍA (TARJETAS ESTILO PÓSTER VERTICAL) */}
        {vista === 'galeria' && (
          <div>
            {vinilos.length === 0 ? (
              <p style={estilos.mensajeCentral}>La estantería está vacía.</p>
            ) : (
              <div style={estilos.cuadricula}>
                {vinilos.map((vinilo) => (
                  <div key={vinilo.id} style={estilos.tarjeta} onClick={() => abrirDetalle(vinilo)}>
                    
                    <button style={estilos.botonOpciones} onClick={(e) => toggleMenu(e, vinilo.id)}>
                      <div style={estilos.fondoBotonOpciones}>⋮</div>
                    </button>
                    
                    {menuAbierto === vinilo.id && (
                      <div style={estilos.menuDesplegable}>
                        <div style={estilos.opcionMenu} onClick={(e) => iniciarEdicion(e, vinilo)}>✏️ Editar</div>
                        <div style={{...estilos.opcionMenu, color: '#D32F2F', borderTop: '1px solid #EAE6DF'}} onClick={(e) => eliminarVinilo(e, vinilo.id)}>🗑️ Borrar</div>
                      </div>
                    )}

                    {/* IMAGEN ARRIBA */}
                    {vinilo.imagen_url ? (
                      <img src={vinilo.imagen_url} alt={vinilo.titulo} style={estilos.portadaPoster} />
                    ) : (
                      <div style={estilos.portadaVaciaPoster}>🎵</div>
                    )}
                    
                    {/* INFO ABAJO */}
                    <div style={estilos.infoTarjetaPoster}>
                      <h3 style={estilos.tituloTarjeta}>{vinilo.titulo}</h3>
                      <p style={estilos.autorTarjeta}>{vinilo.autor}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA 2: FORMULARIO */}
        {vista === 'añadir' && (
          <form onSubmit={guardarVinilo} style={estilos.formulario}>
            <h2 style={estilos.tituloFormulario}>
              {idEditando ? 'Editar información del disco' : 'Añadir nueva obra al archivo'}
            </h2>
            
            <div style={estilos.grupo}>
              <label style={estilos.label}>Título del álbum</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={estilos.input} />
            </div>
            <div style={estilos.grupo}>
              <label style={estilos.label}>Autor / Intérprete</label>
              <input type="text" value={autor} onChange={(e) => setAutor(e.target.value)} required style={estilos.input} />
            </div>
            <div style={estilos.grupo}>
              <label style={estilos.label}>Duración total (opcional)</label>
              <input type="text" value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="Ej: 45 min" style={estilos.input} />
            </div>
            
            {/* NUEVO CAMPO: CANCIONES */}
            <div style={estilos.grupo}>
              <label style={estilos.label}>Lista de Títulos (Una canción por línea)</label>
              <textarea 
                value={canciones} 
                onChange={(e) => setCanciones(e.target.value)} 
                placeholder="1. Nightcall&#10;2. Pacific Coast Highway" 
                style={estilos.textarea} 
                rows="5"
              />
            </div>

            <div style={estilos.grupo}>
              <label style={estilos.label}>
                {idEditando ? 'Cambiar fotografía (opcional)' : 'Fotografía de la portada'}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files[0])} style={estilos.inputArchivo} />
            </div>
            <button type="submit" disabled={cargando} style={estilos.botonAccion}>
              {cargando ? 'Guardando...' : (idEditando ? 'Actualizar Vinilo' : 'Catalogar Vinilo')}
            </button>
            {mensaje && <p style={estilos.mensajeConfirmacion}>{mensaje}</p>}
          </form>
        )}

        {/* VISTA 3: FICHA DEL VINILO (DISEÑO ESTILO DISCOGS) */}
        {vista === 'detalle' && viniloSeleccionado && (
          <div style={estilos.fichaDetalle}>
            <button style={estilos.botonVolver} onClick={() => setVista('galeria')}>
              ⟵ Volver al catálogo
            </button>
            
            {/* Cabecera del Detalle: Título y Autor grandes */}
            <div style={estilos.cabeceraDetalle}>
              <h2 style={estilos.tituloFicha}>
                <span style={{color: '#2858A6', fontWeight: 'bold'}}>{viniloSeleccionado.autor}</span> — {viniloSeleccionado.titulo}
              </h2>
            </div>

            <div style={estilos.infoDetalleLayout}>
              <div style={estilos.marcoPortada}>
                {viniloSeleccionado.imagen_url ? (
                  <img src={viniloSeleccionado.imagen_url} alt={viniloSeleccionado.titulo} style={estilos.portadaGigante} />
                ) : (
                  <div style={estilos.portadaVaciaGigante}>🎵</div>
                )}
              </div>
              
              <div style={estilos.datosMeta}>
                {viniloSeleccionado.duracion && (
                  <div style={estilos.filaMeta}>
                    <span style={estilos.etiquetaMeta}>Formato:</span>
                    <span style={estilos.valorMeta}>Vinilo, {viniloSeleccionado.duracion}</span>
                  </div>
                )}
                <button style={estilos.botonEscuchar} onClick={registrarEscucha}>
                  ▶ Registrar Escucha Hoy
                </button>
              </div>
            </div>

            {/* SECCIÓN: LISTA DE TÍTULOS */}
            <div style={estilos.seccionCanciones}>
              <h3 style={estilos.tituloSeccion}>Lista de Títulos</h3>
              {viniloSeleccionado.canciones ? (
                <ul style={estilos.listaCanciones}>
                  {viniloSeleccionado.canciones.split('\n').map((cancion, index) => {
                    if (!cancion.trim()) return null; // Evita líneas vacías
                    return (
                      <li key={index} style={estilos.itemCancion}>
                        <span style={estilos.numeroCancion}>{index + 1}</span>
                        <span style={estilos.textoCancion}>{cancion}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p style={estilos.textoVacio}>No se han añadido canciones a este disco.</p>
              )}
            </div>
            
          </div>
        )}

      </div>
    </div>
  )
}

const estilos = {
  fondoGlobal: { backgroundColor: '#F4F1EA', minHeight: '100vh', width: '100%', margin: 0, padding: 0 },
  contenedor: { fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto', padding: '20px', color: '#1A1818', paddingBottom: '60px' },
  
  cabecera: { textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #D6D0C4' },
  tituloApp: { fontSize: '38px', margin: '0 0 5px 0', color: '#1A1818', fontFamily: '"Georgia", serif', fontWeight: 'bold', fontStyle: 'italic', letterSpacing: '1px', textShadow: '2px 2px 0px #D6D0C4' },
  subtituloApp: { fontSize: '16px', margin: 0, color: '#8B7355', fontFamily: '"Georgia", serif', fontStyle: 'italic' },
  
  navegacion: { display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center' },
  botonNav: { background: 'none', border: 'none', fontSize: '18px', fontFamily: '"Georgia", serif', padding: '10px 15px', cursor: 'pointer', transition: 'all 0.2s' },
  
  // TARJETAS VERTICALES
  cuadricula: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }, 
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: '4px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', position: 'relative', overflow: 'hidden' },
  
  botonOpciones: { position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 2 },
  fondoBotonOpciones: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#000', fontWeight: 'bold' },
  menuDesplegable: { position: 'absolute', top: '45px', right: '10px', backgroundColor: '#FFF', border: '1px solid #EAE6DF', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, minWidth: '120px' },
  opcionMenu: { padding: '12px 15px', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  
  portadaPoster: { width: '100%', aspectRatio: '1/1', objectFit: 'cover' },
  portadaVaciaPoster: { width: '100%', aspectRatio: '1/1', backgroundColor: '#EAE6DF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  
  infoTarjetaPoster: { padding: '12px', display: 'flex', flexDirection: 'column' },
  tituloTarjeta: { fontSize: '16px', margin: '0 0 4px 0', color: '#1A1818', fontWeight: 'bold' },
  autorTarjeta: { fontSize: '14px', color: '#666', margin: 0 },
  
  // FORMULARIO
  formulario: { backgroundColor: '#FFFFFF', padding: '25px', borderRadius: '4px', border: '1px solid #EAE6DF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  tituloFormulario: { fontSize: '20px', borderBottom: '1px solid #EAE6DF', paddingBottom: '15px', marginBottom: '20px', fontFamily: '"Georgia", serif', fontStyle: 'italic' },
  grupo: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' },
  label: { fontSize: '13px', color: '#4A4846', fontWeight: 'bold' },
  input: { padding: '10px', borderRadius: '2px', border: '1px solid #CCC', fontSize: '15px', backgroundColor: '#FFF' },
  textarea: { padding: '10px', borderRadius: '2px', border: '1px solid #CCC', fontSize: '15px', backgroundColor: '#FFF', resize: 'vertical' },
  inputArchivo: { padding: '10px 0' },
  botonAccion: { width: '100%', padding: '15px', border: 'none', backgroundColor: '#1A1818', color: '#FFF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  mensajeCentral: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: '50px' },
  mensajeConfirmacion: { textAlign: 'center', color: '#4CAF50', marginTop: '15px' },

  // DETALLE ESTILO DISCOGS
  fichaDetalle: { display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#FFF', padding: '20px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  botonVolver: { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2858A6', fontSize: '15px', padding: '0 0 20px 0', cursor: 'pointer', textDecoration: 'underline' },
  
  cabeceraDetalle: { marginBottom: '20px' },
  tituloFicha: { fontSize: '24px', margin: 0, color: '#000' },
  
  infoDetalleLayout: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' },
  marcoPortada: { width: '100%', maxWidth: '250px', alignSelf: 'center' },
  portadaGigante: { width: '100%', aspectRatio: '1/1', objectFit: 'cover', border: '1px solid #CCC' },
  portadaVaciaGigante: { width: '100%', aspectRatio: '1/1', backgroundColor: '#EAE6DF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', border: '1px solid #CCC' },
  
  datosMeta: { display: 'flex', flexDirection: 'column', gap: '8px' },
  filaMeta: { display: 'flex', fontSize: '15px' },
  etiquetaMeta: { width: '80px', color: '#666' },
  valorMeta: { color: '#2858A6' },
  
  botonEscuchar: { marginTop: '15px', padding: '12px', border: 'none', backgroundColor: '#2858A6', color: '#FFF', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '3px' },
  
  // SECCIÓN CANCIONES
  seccionCanciones: { marginTop: '10px', borderTop: '2px solid #EEE', paddingTop: '20px' },
  tituloSeccion: { fontSize: '20px', margin: '0 0 15px 0', color: '#000' },
  listaCanciones: { listStyle: 'none', padding: 0, margin: 0 },
  itemCancion: { display: 'flex', gap: '15px', padding: '10px 0', borderBottom: '1px solid #F4F4F4', fontSize: '15px' },
  numeroCancion: { color: '#888', minWidth: '20px' },
  textoCancion: { color: '#000' },
  textoVacio: { fontStyle: 'italic', color: '#888', fontSize: '15px' }
}

export default App