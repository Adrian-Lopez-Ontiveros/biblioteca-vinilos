export default function BottomNav({ vistaActual, setVistaActual }) {
  const items = [
    {
      id: 'inicio',
      label: 'Inicio',
      activo: vistaActual === 'inicio',
      icono: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11.5 12 4l8 7.5" />
          <path d="M6.5 10.8V20h11V10.8" />
        </svg>
      ),
    },
    {
      id: 'coleccion',
      label: 'Colección',
      activo: vistaActual === 'coleccion' || vistaActual === 'detalle',
      icono: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="2.2" />
        </svg>
      ),
    },
    {
      id: 'añadir',
      label: 'Añadir',
      activo: vistaActual === 'añadir' || vistaActual === 'editar',
      icono: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8.2v7.6M8.2 12h7.6" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="nav-inferior" aria-label="Navegación principal">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-btn ${item.activo ? 'nav-btn-activo' : ''}`}
          onClick={() => setVistaActual(item.id)}
        >
          {item.icono}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
