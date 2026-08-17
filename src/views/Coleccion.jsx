import { useMemo, useState } from 'react'
import Portada from '../components/Portada'
import { ordenarPorUltimaEscucha, textoUltimaEscucha } from '../lib/vinilos'

export default function Coleccion({ vinilos, abrirDetalle }) {
  const [busqueda, setBusqueda] = useState('')
  const [agrupacion, setAgrupacion] = useState('recientes')

  const vinilosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const filtrados = !q
      ? vinilos
      : vinilos.filter((vinilo) =>
        [vinilo.titulo, vinilo.autor, vinilo.genero]
          .filter(Boolean)
          .some((campo) => String(campo).toLowerCase().includes(q))
      )

    if (agrupacion === 'sinOirMas') return ordenarPorUltimaEscucha(filtrados, 'mas')
    if (agrupacion === 'sinOirMenos') return ordenarPorUltimaEscucha(filtrados, 'menos')
    return filtrados
  }, [vinilos, busqueda, agrupacion])

  const renderTarjeta = (vinilo) => (
    <button
      key={vinilo.id}
      type="button"
      className="tarjeta-vinilo"
      onClick={() => abrirDetalle(vinilo)}
    >
      <Portada src={vinilo.imagen_url} alt={vinilo.titulo} />
      <div className="info">
        <h3>{vinilo.titulo}</h3>
        <p className="meta-suave">
          {vinilo.autor}
          {vinilo.año ? ` · ${vinilo.año}` : ''}
        </p>
        <p className="meta-escucha">{textoUltimaEscucha(vinilo)}</p>
      </div>
    </button>
  )

  const renderGrupos = (claveDeGrupo) => {
    const grupos = {}
    vinilosFiltrados.forEach((vinilo) => {
      const clave = claveDeGrupo(vinilo)
      if (!grupos[clave]) grupos[clave] = []
      grupos[clave].push(vinilo)
    })

    return Object.keys(grupos)
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map((clave) => (
        <div key={clave} className="grupo-lista">
          <h3 className="titulo-grupo">{clave}</h3>
          {grupos[clave].map(renderTarjeta)}
        </div>
      ))
  }

  const renderContenido = () => {
    if (vinilosFiltrados.length === 0) {
      return (
        <div className="vacio">
          {busqueda ? 'No se ha encontrado ningún vinilo con esa búsqueda.' : 'La estantería está vacía.'}
        </div>
      )
    }

    if (agrupacion === 'letra') {
      return renderGrupos((v) => {
        const letra = (v.titulo || '').trim().charAt(0).toUpperCase()
        return /[A-ZÁÉÍÓÚÑ]/.test(letra) ? letra : '#'
      })
    }

    if (agrupacion === 'autor') {
      return renderGrupos((v) => v.autor || 'Sin artista')
    }

    if (agrupacion === 'genero') {
      return renderGrupos((v) => v.genero || 'Sin género')
    }

    return <div className="lista-vinilos">{vinilosFiltrados.map(renderTarjeta)}</div>
  }

  const filtros = [
    { id: 'recientes', label: 'Añadidos' },
    { id: 'letra', label: 'A — Z' },
    { id: 'autor', label: 'Artista' },
    { id: 'genero', label: 'Género' },
    { id: 'sinOirMas', label: 'Más tiempo sin oír' },
    { id: 'sinOirMenos', label: 'Menos tiempo sin oír' },
  ]

  return (
    <div className="pagina">
      <header>
        <p className="kicker">{vinilos.length} en la estantería</p>
        <h1 className="titulo-pagina">Mi colección</h1>
      </header>

      <input
        className="busqueda"
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por título, artista o género"
        aria-label="Buscar vinilos"
      />

      <div className="filtros" role="tablist" aria-label="Ordenar colección">
        {filtros.map((filtro) => (
          <button
            key={filtro.id}
            type="button"
            className={`chip ${agrupacion === filtro.id ? 'chip-activo' : ''}`}
            onClick={() => setAgrupacion(filtro.id)}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {renderContenido()}
    </div>
  )
}
