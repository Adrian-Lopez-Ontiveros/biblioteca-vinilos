import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { tema } from '../theme'

export default function Anadir({ setVistaActual, refrescarVinilos, viniloAEditar }) {
  // Si existe viniloAEditar, rellenamos los campos con sus datos
  const [titulo, setTitulo] = useState(viniloAEditar ? viniloAEditar.titulo : '')
  const [autor, setAutor] = useState(viniloAEditar ? viniloAEditar.autor : '')
  const [año, setAño] = useState(viniloAEditar ? (viniloAEditar.año || '') : '')
  const [genero, setGenero] = useState(viniloAEditar ? (viniloAEditar.genero || '') : '')
  const [valoracion, setValoracion] = useState(viniloAEditar ? (viniloAEditar.valoracion || 0) : 0)
  const [canciones, setCanciones] = useState(viniloAEditar ? (viniloAEditar.canciones || '') : '')
  
  const [archivo, setArchivo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const guardarVinilo = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    try {
      let imagenUrl = ''
      
      if (archivo) {
        const extension = archivo.name.split('.').pop()
        const nombreArchivo = `${Date.now()}.${extension}`
        
        const { error: errorSubida } = await supabase.storage.from('portadas').upload(nombreArchivo, archivo)
        if (errorSubida) throw errorSubida

        const { data: urlData } = supabase.storage.from('portadas').getPublicUrl(nombreArchivo)
        imagenUrl = urlData.publicUrl
      }

      const datosBase = { titulo, autor, año, genero, valoracion, canciones }
      if (imagenUrl) datosBase.imagen_url = imagenUrl

      if (viniloAEditar) {
        // MODO ACTUALIZAR
        const { error } = await supabase.from('vinilos').update(datosBase).eq('id', viniloAEditar.id)
        if (error) throw error
        setMensaje('¡Disco actualizado! 💿')
      } else {
        // MODO CREAR NUEVO
        datosBase.historial_escuchas = []
        const { error } = await supabase.from('vinilos').insert([datosBase])
        if (error) throw error
        setMensaje('¡Disco añadido a la colección! 💿')
      }
      
      refrescarVinilos() 
      setTimeout(() => setVistaActual('coleccion'), 1500)

    } catch (error) {
      setMensaje('Error: ' + error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.tituloPagina}>
        {viniloAEditar ? 'Editar Vinilo' : 'Añadir a la colección'}
      </h1>
      
      <form onSubmit={guardarVinilo} style={estilos.formulario}>
        <div style={estilos.grupo}>
          <label style={estilos.label}>Título del álbum</label>
          <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={estilos.input} />
        </div>
        <div style={estilos.grupo}>
          <label style={estilos.label}>Artista / Grupo</label>
          <input type="text" value={autor} onChange={(e) => setAutor(e.target.value)} required style={estilos.input} />
        </div>
        <div style={estilos.filaDoble}>
          <div style={estilos.grupo}>
            <label style={estilos.label}>Año</label>
            <input type="number" value={año} onChange={(e) => setAño(e.target.value)} style={estilos.input} />
          </div>
          <div style={estilos.grupo}>
            <label style={estilos.label}>Género</label>
            <input type="text" value={genero} onChange={(e) => setGenero(e.target.value)} style={estilos.input} />
          </div>
        </div>

        <div style={estilos.grupo}>
          <label style={estilos.label}>Valoración personal</label>
          <div style={estilos.contenedorEstrellas}>
            {[1, 2, 3, 4, 5].map((num) => (
              <span 
                key={num} onClick={() => setValoracion(num)}
                style={{ ...estilos.estrella, color: num <= valoracion ? tema.acento : tema.borde }}
              >
                {num <= valoracion ? '★' : '☆'}
              </span>
            ))}
          </div>
        </div>

        <div style={estilos.grupo}>
          <label style={estilos.label}>Lista de canciones (Una por línea)</label>
          <textarea value={canciones} onChange={(e) => setCanciones(e.target.value)} style={estilos.textarea} rows="4" />
        </div>

        <div style={estilos.grupo}>
          <label style={estilos.label}>
            {viniloAEditar ? 'Cambiar portada (Opcional)' : 'Fotografía de la portada'}
          </label>
          <input type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files[0])} style={estilos.inputArchivo} />
        </div>

        <button type="submit" disabled={cargando} style={estilos.botonGuardar}>
          {cargando ? 'Guardando...' : (viniloAEditar ? 'Actualizar Vinilo' : 'Añadir Vinilo')}
        </button>

        {mensaje && <p style={estilos.mensaje}>{mensaje}</p>}
      </form>
    </div>
  )
}

const estilos = {
  contenedor: { padding: '20px' },
  tituloPagina: { fontSize: '28px', margin: '10px 0 30px 0', fontFamily: tema.fuentePrincipal, color: tema.textoPrincipal },
  formulario: { display: 'flex', flexDirection: 'column', gap: '20px' },
  grupo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  filaDoble: { display: 'flex', gap: '15px' },
  label: { fontSize: '13px', color: tema.textoSecundario, textTransform: 'uppercase', letterSpacing: '1px' },
  input: { padding: '14px', borderRadius: '8px', border: `1px solid ${tema.borde}`, backgroundColor: tema.superficie, color: tema.textoPrincipal, fontSize: '16px', outline: 'none' },
  textarea: { padding: '14px', borderRadius: '8px', border: `1px solid ${tema.borde}`, backgroundColor: tema.superficie, color: tema.textoPrincipal, fontSize: '16px', resize: 'vertical', outline: 'none' },
  inputArchivo: { color: tema.textoSecundario, marginTop: '5px' },
  contenedorEstrellas: { display: 'flex', gap: '10px', fontSize: '32px', cursor: 'pointer', userSelect: 'none' },
  estrella: { transition: 'color 0.2s' },
  botonGuardar: { marginTop: '10px', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: tema.acento, color: '#000', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' },
  mensaje: { textAlign: 'center', color: tema.acento, marginTop: '10px', fontWeight: 'bold' }
}