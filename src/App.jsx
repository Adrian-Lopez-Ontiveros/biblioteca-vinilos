import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [vista, setVista] = useState('galeria') 
  const [vinilos, setVinilos] = useState([])
  const [viniloSeleccionado, setViniloSeleccionado] = useState(null)
  
  // Nuevos estados para el menú y la edición
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [idEditando, setIdEditando] = useState(null)
  
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [duracion, setDuracion] = useState('')
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
      
      // Si subimos un archivo nuevo, lo guardamos en el storage
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
        // MODO EDICIÓN
        const datosActualizados = { titulo, autor, duracion }
        if (imagenUrl) datosActualizados.imagen_url = imagenUrl // Solo actualiza imagen si subió una nueva

        const { error: errorBaseDatos } = await supabase
          .from('vinilos')
          .update(datosActualizados)
          .eq('id', idEditando)

        if (errorBaseDatos) throw errorBaseDatos
        setMensaje('Obra actualizada correctamente 🎵')

      } else {
        // MODO CREACIÓN
        const { error: errorBaseDatos } = await supabase
          .from('vinilos')
          .insert([{ 
            titulo, 
            autor, 
            duracion, 
            imagen_url: imagenUrl,
            historial_escuchas: [] 
          }])

        if (errorBaseDatos) throw errorBaseDatos
        setMensaje('Obra añadida al archivo 🎵')
      }

      // Limpiamos todo
      setTitulo('')
      setAutor('')
      setDuracion('')
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
    e.stopPropagation() // Evita que se abra el detalle al pulsar borrar
    setMenuAbierto(null)
    
    const confirmar = window.confirm("¿Seguro que quieres borrar este disco del archivo?")
    if (confirmar) {
      const { error } = await supabase
        .from('vinilos')
        .delete()
        .eq('id', id)
        
      if (!error) {
        obtenerVinilos() // Recargamos la lista
      } else {
        alert("Error al borrar el vinilo")
      }
    }
  }

  const iniciarEdicion = (e, vinilo) => {
    e.stopPropagation() // Evita que se abra el detalle al pulsar editar
    setMenuAbierto(null)
    
    // Rellenamos el formulario con los datos actuales
    setTitulo(vinilo.titulo)
    setAutor(vinilo.autor)
    setDuracion(vinilo.duracion || '')
    setIdEditando(vinilo.id)
    setArchivo(null)
    
    setVista('añadir') // Reutilizamos la vista del formulario
  }

  const toggleMenu = (e, id) => {
    e.stopPropagation()
    // Si el menú ya estaba abierto lo cierra, si no, lo abre
    setMenuAbierto(menuAbierto === id ? null : id)
  }

  // Si hacemos click fuera de las tarjetas, cerramos el menú
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
    } else {
      alert('Hubo un error al registrar la escucha')
    }
  }

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Sin catalogar'
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const formatearFechaHora = (fechaISO) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const abrirDetalle = (vinilo) => {
    setViniloSeleccionado(vinilo)
    setVista('detalle')
  }

  return (
    <div style={estilos.fondoGlobal} onClick={cerrarMenuGlobal}>
      <div style={estilos.contenedor}>
        
        {/* CABECERA ESTILO BIBLIOTECA */}
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
                // Al darle al botón de añadir, limpiamos cualquier estado de edición previo
                setIdEditando(null)
                setTitulo('')
                setAutor('')
                setDuracion('')
                setArchivo(null)
                setVista('añadir')
              }}>
              Añadir Obra
            </button>
          </div>
        )}

        {/* VISTA 1: GALERÍA */}
        {vista === 'galeria' && (
          <div>
            {vinilos.length === 0 ? (
              <p style={estilos.mensajeCentral}>La estantería está vacía.</p>
            ) : (
              <div style={estilos.cuadricula}>
                {vinilos.map((vinilo) => (
                  <div key={vinilo.id} style={estilos.tarjeta} onClick={() => abrirDetalle(vinilo)}>
                    
                    {/* BOTÓN DE 3 PUNTOS (KEBAB MENU) */}
                    <button style={estilos.botonOpciones} onClick={(e) => toggleMenu(e, vinilo.id)}>
                      ⋮
                    </button>
                    
                    {/* MENÚ DESPLEGABLE DE OPCIONES */}
                    {menuAbierto === vinilo.id && (
                      <div style={estilos.menuDesplegable}>
                        <div style={estilos.opcionMenu} onClick={(e) => iniciarEdicion(e, vinilo)}>
                          ✏️ Editar
                        </div>
                        <div style={{...estilos.opcionMenu, color: '#D32F2F', borderTop: '1px solid #EAE6DF'}} onClick={(e) => eliminarVinilo(e, vinilo.id)}>
                          🗑️ Borrar
                        </div>
                      </div>
                    )}

                    {vinilo.imagen_url ? (
                      <img src={vinilo.imagen_url} alt={vinilo.titulo} style={estilos.portadita} />
                    ) : (
                      <div style={estilos.portadaVacia}>🎵</div>
                    )}
                    <div style={estilos.infoTarjeta}>
                      <h3 style={estilos.tituloTarjeta}>{vinilo.titulo}</h3>
                      <p style={estilos.autorTarjeta}>{vinilo.autor}</p>
                      
                      <div style={estilos.etiquetaEscucha}>
                        <span>Última escucha:</span>
                        <strong>{vinilo.ultima_escucha ? formatearFecha(vinilo.ultima_escucha) : 'Nunca'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA 2: FORMULARIO (SIRVE PARA AÑADIR Y EDITAR) */}
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

        {/* VISTA 3: FICHA DEL VINILO */}
        {vista === 'detalle' && viniloSeleccionado && (
          <div style={estilos.fichaDetalle}>
            <button style={estilos.botonVolver} onClick={() => setVista('galeria')}>
              ⟵ Volver al catálogo
            </button>
            
            <div style={estilos.marcoPortada}>
              {viniloSeleccionado.imagen_url ? (
                <img src={viniloSeleccionado.imagen_url} alt={viniloSeleccionado.titulo} style={estilos.portadaGigante} />
              ) : (
                <div style={estilos.portadaVaciaGigante}>🎵</div>
              )}
            </div>
            
            <h2 style={estilos.tituloFicha}>{viniloSeleccionado.titulo}</h2>
            <h3 style={estilos.autorFicha}>{viniloSeleccionado.autor}</h3>
            
            {viniloSeleccionado.duracion && (
              <p style={estilos.duracionFicha}>Duración: {viniloSeleccionado.duracion}</p>
            )}

            <button style={estilos.botonEscuchar} onClick={registrarEscucha}>
              Añadir al reproductor hoy
            </button>

            <div style={estilos.cajaHistorial}>
              <h4 style={estilos.tituloHistorial}>Registro de audiciones</h4>
              
              {(!viniloSeleccionado.historial_escuchas || viniloSeleccionado.historial_escuchas.length === 0) ? (
                <p style={estilos.textoVacio}>Aún no se ha registrado ninguna escucha.</p>
              ) : (
                <ul style={estilos.listaHistorial}>
                  {viniloSeleccionado.historial_escuchas.map((fecha, index) => (
                    <li key={index} style={estilos.itemHistorial}>
                      <span style={estilos.puntoLista}>•</span>
                      {formatearFechaHora(fecha)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ESTILOS ACTUALIZADOS CON EL MENÚ
const estilos = {
  fondoGlobal: { backgroundColor: '#F4F1EA', minHeight: '100vh', width: '100%', margin: 0, padding: 0 },
  contenedor: { fontFamily: '"Georgia", "Times New Roman", serif', maxWidth: '500px', margin: '0 auto', padding: '20px', color: '#2C2A29', paddingBottom: '60px' },
  
  cabecera: { textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #D6D0C4' },
  tituloApp: { fontSize: '38px', margin: '0 0 5px 0', color: '#1A1818', fontWeight: 'bold', fontStyle: 'italic', letterSpacing: '1px', textShadow: '2px 2px 0px #D6D0C4' },
  subtituloApp: { fontSize: '16px', margin: 0, color: '#8B7355', fontStyle: 'italic' },
  
  navegacion: { display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center' },
  botonNav: { background: 'none', border: 'none', fontSize: '18px', fontFamily: 'inherit', padding: '10px 15px', cursor: 'pointer', transition: 'all 0.2s' },
  
  // Galería y Menú de Opciones
  cuadricula: { display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }, 
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: '4px', display: 'flex', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', border: '1px solid #EAE6DF', cursor: 'pointer', position: 'relative' }, // position: relative es clave aquí
  
  botonOpciones: { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', color: '#888', cursor: 'pointer', padding: '0 10px', fontWeight: 'bold' },
  menuDesplegable: { position: 'absolute', top: '40px', right: '15px', backgroundColor: '#FFF', border: '1px solid #EAE6DF', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px' },
  opcionMenu: { padding: '12px 15px', fontSize: '15px', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  
  portadita: { width: '90px', height: '90px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #EAE6DF', flexShrink: 0 },
  portadaVacia: { width: '90px', height: '90px', backgroundColor: '#F4F1EA', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EAE6DF' },
  infoTarjeta: { marginLeft: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0, paddingRight: '20px' },
  tituloTarjeta: { fontSize: '18px', margin: '0 0 5px 0', color: '#1A1818', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  autorTarjeta: { fontSize: '15px', color: '#666', margin: '0 0 12px 0', fontStyle: 'italic' },
  etiquetaEscucha: { fontSize: '12px', color: '#8B7355', borderTop: '1px solid #F0ECE3', paddingTop: '8px', display: 'flex', flexDirection: 'column' },
  
  // Formulario
  formulario: { backgroundColor: '#FFFFFF', padding: '25px', borderRadius: '4px', border: '1px solid #EAE6DF', boxShadow: '0 4px 6px rgba(0,0,0,0.04)' },
  tituloFormulario: { fontSize: '20px', color: '#1A1818', borderBottom: '1px solid #EAE6DF', paddingBottom: '15px', marginBottom: '20px', fontStyle: 'italic', textAlign: 'center' },
  grupo: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' },
  label: { fontSize: '14px', color: '#4A4846', textTransform: 'uppercase', letterSpacing: '1px' },
  input: { padding: '12px', borderRadius: '2px', border: '1px solid #D6D0C4', fontSize: '16px', fontFamily: 'inherit', backgroundColor: '#FAFAF8' },
  inputArchivo: { padding: '10px 0', fontFamily: 'inherit' },
  botonAccion: { width: '100%', padding: '15px', border: 'none', backgroundColor: '#2C2A29', color: '#F4F1EA', fontSize: '18px', fontFamily: 'inherit', cursor: 'pointer', marginTop: '10px' },
  mensajeCentral: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: '50px' },
  mensajeConfirmacion: { textAlign: 'center', color: '#4CAF50', marginTop: '15px', fontStyle: 'italic' },

  // Ficha Detalle
  fichaDetalle: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  botonVolver: { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#8B7355', fontSize: '16px', fontFamily: 'inherit', padding: '10px 0', cursor: 'pointer', marginBottom: '20px' },
  marcoPortada: { padding: '10px', backgroundColor: '#FFF', border: '1px solid #EAE6DF', boxShadow: '0 8px 16px rgba(0,0,0,0.08)', marginBottom: '25px' },
  portadaGigante: { width: '100%', maxWidth: '300px', aspectRatio: '1/1', objectFit: 'cover' },
  portadaVaciaGigante: { width: '100%', maxWidth: '300px', aspectRatio: '1/1', backgroundColor: '#F4F1EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' },
  tituloFicha: { fontSize: '26px', margin: '0 0 10px 0', textAlign: 'center', color: '#1A1818' },
  autorFicha: { fontSize: '20px', color: '#666', margin: '0 0 15px 0', fontStyle: 'italic', textAlign: 'center' },
  duracionFicha: { fontSize: '15px', color: '#4A4846', margin: '0 0 30px 0' },
  
  botonEscuchar: { width: '100%', padding: '16px', border: '1px solid #2C2A29', backgroundColor: '#2C2A29', color: '#F4F1EA', fontSize: '18px', fontFamily: 'inherit', cursor: 'pointer', marginBottom: '30px', transition: 'background-color 0.2s' },
  
  // Historial
  cajaHistorial: { width: '100%', backgroundColor: '#FFFFFF', padding: '25px', border: '1px solid #EAE6DF', boxShadow: '0 4px 6px rgba(0,0,0,0.04)' },
  tituloHistorial: { fontSize: '16px', color: '#1A1818', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #EAE6DF', paddingBottom: '10px', margin: '0 0 15px 0' },
  listaHistorial: { listStyle: 'none', padding: 0, margin: 0, maxHeight: '250px', overflowY: 'auto' },
  itemHistorial: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F4F1EA', fontSize: '16px', color: '#4A4846' },
  puntoLista: { color: '#8B7355', marginRight: '10px', fontSize: '20px' },
  textoVacio: { fontStyle: 'italic', color: '#888', fontSize: '15px' }
}

export default App