import { useState } from 'react'
import { borrarPortada, comentariosDe, guardarVinilo, mensajeErrorSupabase, subirPortada, prepararDatosVinilo } from '../lib/vinilos'

export default function Anadir({ setVistaActual, refrescarVinilos, viniloAEditar }) {
  const [titulo, setTitulo] = useState(viniloAEditar?.titulo || '')
  const [autor, setAutor] = useState(viniloAEditar?.autor || '')
  const [año, setAño] = useState(viniloAEditar?.año ?? '')
  const [genero, setGenero] = useState(viniloAEditar?.genero || '')
  const [valoracion, setValoracion] = useState(viniloAEditar?.valoracion || 0)
  const [comentarios, setComentarios] = useState(comentariosDe(viniloAEditar))
  const [archivo, setArchivo] = useState(null)
  const [previsualizacion, setPrevisualizacion] = useState(viniloAEditar?.imagen_url || '')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [esError, setEsError] = useState(false)

  const alElegirFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivo(file)
    setPrevisualizacion(URL.createObjectURL(file))
  }

  const onGuardar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')
    setEsError(false)

    let portadaSubida = null
    try {
      let imagenUrl = ''
      if (archivo) {
        try {
          portadaSubida = await subirPortada(archivo)
          imagenUrl = portadaSubida.url
        } catch (errorSubida) {
          setEsError(true)
          setMensaje(`${mensajeErrorSupabase(errorSubida)} Prueba a guardar de nuevo sin foto, o con otra imagen.`)
          setCargando(false)
          return
        }
      }

      const datos = prepararDatosVinilo({
        titulo,
        autor,
        año,
        genero,
        valoracion,
        comentarios,
        imagenUrl,
      })

      await guardarVinilo({
        datos,
        idEditar: viniloAEditar?.id,
      })

      setEsError(false)
      setMensaje(viniloAEditar ? 'Vinilo actualizado.' : 'Vinilo guardado en la colección.')
      await refrescarVinilos()
      setTimeout(() => setVistaActual('coleccion'), 900)
    } catch (error) {
      if (portadaSubida?.nombreArchivo) {
        await borrarPortada(portadaSubida.nombreArchivo)
      }
      setEsError(true)
      setMensaje(mensajeErrorSupabase(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="pagina">
      <header>
        <p className="kicker">{viniloAEditar ? 'Ficha del disco' : 'Nuevo disco'}</p>
        <h1 className="titulo-pagina">
          {viniloAEditar ? 'Editar vinilo' : 'Añadir a la colección'}
        </h1>
      </header>

      <form className="formulario" onSubmit={onGuardar}>
        <div className="grupo">
          <label className="label" htmlFor="titulo">Título del álbum</label>
          <input
            id="titulo"
            className="campo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="grupo">
          <label className="label" htmlFor="autor">Artista / grupo</label>
          <input
            id="autor"
            className="campo"
            type="text"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="fila-doble">
          <div className="grupo">
            <label className="label" htmlFor="año">Año</label>
            <input
              id="año"
              className="campo"
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              value={año}
              onChange={(e) => setAño(e.target.value)}
            />
          </div>
          <div className="grupo">
            <label className="label" htmlFor="genero">Género</label>
            <input
              id="genero"
              className="campo"
              type="text"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grupo">
          <span className="label">Valoración personal</span>
          <div className="estrellas" role="group" aria-label="Valoración del 1 al 5">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                className={`estrella ${num <= valoracion ? 'estrella-activa' : ''}`}
                onClick={() => setValoracion(num === valoracion ? 0 : num)}
                aria-label={`${num} estrellas`}
              >
                {num <= valoracion ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <div className="grupo">
          <label className="label" htmlFor="comentarios">Comentarios sobre el vinilo</label>
          <p className="ayuda">Notas, anécdotas, estado del disco, dónde lo encontraste…</p>
          <textarea
            id="comentarios"
            className="campo"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            rows={8}
            placeholder="Por ejemplo: comprado en el rastro, tapa un poco desgastada, suena muy bien…"
          />
        </div>

        <div className="grupo">
          <span className="label">
            {viniloAEditar ? 'Cambiar portada (opcional)' : 'Fotografía de la portada'}
          </span>
          <div className="selector-foto">
            {previsualizacion ? (
              <img src={previsualizacion} alt="Vista previa de la portada" />
            ) : (
              <p className="ayuda">Toca para hacer una foto o elegir una imagen</p>
            )}
            <input type="file" accept="image/*" onChange={alElegirFoto} />
          </div>
        </div>

        <button type="submit" className="boton boton-principal" disabled={cargando}>
          {cargando ? 'Guardando…' : (viniloAEditar ? 'Guardar cambios' : 'Guardar vinilo')}
        </button>

        {mensaje && (
          <p className={`aviso ${esError ? 'aviso-error' : 'aviso-ok'}`}>{mensaje}</p>
        )}
      </form>
    </div>
  )
}
