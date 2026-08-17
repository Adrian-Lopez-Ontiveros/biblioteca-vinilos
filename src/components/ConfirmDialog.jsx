export default function ConfirmDialog({ abierto, titulo, texto, confirmarLabel = 'Confirmar', cancelarLabel = 'Cancelar', peligro = false, onConfirmar, onCancelar }) {
  if (!abierto) return null

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="dialog-titulo">
      <div className="modal">
        <h2 id="dialog-titulo" className="modal-titulo">{titulo}</h2>
        <p className="modal-texto">{texto}</p>
        <div className="modal-acciones">
          <button type="button" className="boton boton-secundario" onClick={onCancelar}>
            {cancelarLabel}
          </button>
          <button
            type="button"
            className={`boton ${peligro ? 'boton-peligro' : 'boton-principal'}`}
            onClick={onConfirmar}
          >
            {confirmarLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
