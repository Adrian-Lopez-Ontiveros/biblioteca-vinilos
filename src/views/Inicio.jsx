import Portada from '../components/Portada'
import Estadisticas from '../components/Estadisticas'

export default function Inicio({ vinilos, cargando, setVistaActual, abrirDetalle }) {
  const artistasUnicos = new Set(vinilos.map((v) => v.autor).filter(Boolean)).size
  const generosUnicos = new Set(vinilos.map((v) => v.genero).filter(Boolean)).size
  const recientes = vinilos.slice(0, 6)

  return (
    <div className="pagina">
      <header className="cabecera-home">
        <h1 className="logo-titulo">
          <img
            className="logo-principal"
            src="/logo-vinilos-edu.png"
            alt="Los vinilos de Edu"
            width="1024"
            height="1024"
          />
        </h1>
      </header>

      <div className="grid-stats">
        <div className="tarjeta-stat">
          <strong>{cargando ? '—' : vinilos.length}</strong>
          <span>vinilos</span>
        </div>
        <div className="tarjeta-stat">
          <strong>{cargando ? '—' : artistasUnicos}</strong>
          <span>artistas</span>
        </div>
        <div className="tarjeta-stat">
          <strong>{cargando ? '—' : generosUnicos}</strong>
          <span>géneros</span>
        </div>
      </div>

      {!cargando && (
        <Estadisticas vinilos={vinilos} abrirDetalle={abrirDetalle} />
      )}

      <section>
        <div className="seccion-cabecera">
          <h2 className="titulo-seccion">Últimos añadidos</h2>
          <button type="button" className="enlace" onClick={() => setVistaActual('coleccion')}>
            Ver todos
          </button>
        </div>

        {recientes.length === 0 ? (
          <div className="vacio">
            {cargando ? 'Cargando la estantería…' : 'Todavía no hay vinilos. Añade el primero cuando quieras.'}
          </div>
        ) : (
          <div className="carrusel">
            {recientes.map((vinilo) => (
              <button
                key={vinilo.id}
                type="button"
                className="tarjeta-reciente"
                onClick={() => abrirDetalle(vinilo)}
              >
                <Portada src={vinilo.imagen_url} alt={vinilo.titulo} />
                <h3>{vinilo.titulo}</h3>
                <p>{vinilo.autor}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <button type="button" className="boton boton-principal" onClick={() => setVistaActual('añadir')}>
        Añadir un vinilo
      </button>
    </div>
  )
}
