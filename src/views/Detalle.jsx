import { useState } from 'react'
import { supabase } from '../supabase'
import { comentariosDe, mensajeErrorSupabase } from '../lib/vinilos'
import Portada from '../components/Portada'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Detalle({ vinilo, volver, refrescarVinilos, irAEditar, onActualizado }) {
  const [viniloActual, setViniloActual] = useState(vinilo)
  const [registrando, setRegistrando] = useState(false)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [aviso, setAviso] = useState('')

  const comentarios = comentariosDe(viniloActual)
  const historial = viniloActual.historial_escuchas || []

  const actualizar = async (cambios) => {
    const { error } = await supabase.from('vinilos').update(cambios).eq('id', viniloActual.id)
    if (error) throw error
    const siguiente = { ...viniloActual, ...cambios }
    setViniloActual(siguiente)
    onActualizado?.(siguiente)
    await refrescarVinilos()
  }

  const registrarEscucha = async () => {
    setRegistrando(true)
    setAviso('')
    try {
      const ahora = new Date().toISOString()
      await actualizar({
        ultima_escucha: ahora,
        historial_escuchas: [ahora, ...historial],
      })
    } catch (error) {
      setAviso(mensajeErrorSupabase(error))
    } finally {
      setRegistrando(false)
    }
  }

  const borrarEscucha = async (fechaABorrar) => {
    try {
      await actualizar({
        historial_escuchas: historial.filter((fecha) => fecha !== fechaABorrar),
      })
    } catch (error) {
      setAviso(mensajeErrorSupabase(error))
    }
  }

  const borrarVinilo = async () => {
    const { error } = await supabase.from('vinilos').delete().eq('id', viniloActual.id)
    if (error) {
      setAviso(mensajeErrorSupabase(error))
      setConfirmarBorrado(false)
      return
    }
    await refrescarVinilos()
    volver()
  }

  const formatearFecha = (isoString) => {
    const fecha = new Date(isoString)
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const estrellas = '★'.repeat(viniloActual.valoracion || 0) + '☆'.repeat(5 - (viniloActual.valoracion || 0))

  return (
    <div className="pagina">
      <div className="detalle-top">
        <button type="button" className="boton boton-secundario boton-icono" onClick={volver} aria-label="Volver">
          ←
        </button>
        <p className="subtitulo">{historial.length} {historial.length === 1 ? 'escucha' : 'escuchas'}</p>
      </div>

      <div className="detalle-hero">
        <Portada src={viniloActual.imagen_url} alt={viniloActual.titulo} className="portada-hero" />
        <div>
          <h1 className="titulo-detalle">{viniloActual.titulo}</h1>
          <p className="subtitulo" style={{ marginTop: 6 }}>
            {viniloActual.autor}
            {viniloActual.año ? ` · ${viniloActual.año}` : ''}
            {viniloActual.genero ? ` · ${viniloActual.genero}` : ''}
          </p>
          <p className="estrellas-texto" aria-label={`Valoración ${viniloActual.valoracion || 0} de 5`}>
            {estrellas}
          </p>
        </div>
      </div>

      <section>
        <h2 className="titulo-seccion">Comentarios sobre el vinilo</h2>
        {comentarios ? (
          <div className="nota">{comentarios}</div>
        ) : (
          <div className="vacio">Todavía no hay notas en este disco.</div>
        )}
      </section>

      <section>
        <h2 className="titulo-seccion">Historial de escuchas</h2>
        <div className="caja">
          {historial.length > 0 ? historial.map((fechaIso) => (
            <div key={fechaIso} className="item-lista">
              <span>{formatearFecha(fechaIso)}</span>
              <button
                type="button"
                className="enlace"
                onClick={() => borrarEscucha(fechaIso)}
                aria-label="Eliminar esta escucha"
              >
                Quitar
              </button>
            </div>
          )) : (
            <div className="item-lista">
              <span className="meta-suave">Aún no hay registros. Dale al botón cuando lo pongas.</span>
            </div>
          )}
        </div>
      </section>

      <div className="acciones-detalle">
        <button type="button" className="boton boton-principal" onClick={registrarEscucha} disabled={registrando}>
          {registrando ? 'Registrando…' : 'Registrar escucha'}
        </button>
        <button type="button" className="boton boton-madera" onClick={() => irAEditar(viniloActual)}>
          Editar ficha
        </button>
        <button type="button" className="boton boton-secundario" onClick={() => setConfirmarBorrado(true)}>
          Borrar vinilo
        </button>
        {aviso && <p className="aviso aviso-error">{aviso}</p>}
      </div>

      <ConfirmDialog
        abierto={confirmarBorrado}
        titulo="¿Borrar este vinilo?"
        texto={`Se eliminará “${viniloActual.titulo}” de la colección. Esta acción no se puede deshacer.`}
        confirmarLabel="Borrar"
        cancelarLabel="Cancelar"
        peligro
        onCancelar={() => setConfirmarBorrado(false)}
        onConfirmar={borrarVinilo}
      />
    </div>
  )
}
