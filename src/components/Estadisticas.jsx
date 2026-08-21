import { useMemo } from 'react'
import Portada from './Portada'
import { calcularEstadisticas, textoVeces } from '../lib/estadisticas'

export default function Estadisticas({ vinilos, abrirDetalle }) {
  const stats = useMemo(() => calcularEstadisticas(vinilos), [vinilos])

  if (!vinilos.length) return null

  const resumen = [
    {
      valor: stats.vinilosEscuchadosMes,
      etiqueta: stats.vinilosEscuchadosMes === 1 ? 'vinilo escuchado' : 'vinilos escuchados',
    },
    stats.generoMes && {
      valor: stats.generoMes.nombre,
      etiqueta: 'género más escuchado',
    },
  ].filter(Boolean)

  return (
    <section className="seccion-estadisticas">
      <h2 className="titulo-seccion">Cómo suena este mes</h2>

      {stats.totalEscuchas === 0 ? (
        <div className="vacio vacio-compacto">
          Registra las escuchas y aquí verás el resumen del mes.
        </div>
      ) : (
        <div className="caja caja-estadisticas">
          <div
            className="stats-resumen"
            data-cols={resumen.length}
            style={{ gridTemplateColumns: `repeat(${resumen.length}, minmax(0, 1fr))` }}
          >
            {resumen.map((item) => (
              <div key={item.etiqueta}>
                <strong>{item.valor}</strong>
                <span>{item.etiqueta}</span>
              </div>
            ))}
          </div>

          {stats.discoMes && (
            <button
              type="button"
              className="stats-disco"
              onClick={() => abrirDetalle(stats.discoMes.vinilo)}
            >
              <Portada src={stats.discoMes.vinilo.imagen_url} alt="" />
              <div className="stats-disco-texto">
                <span className="kicker">Más escuchado · {textoVeces(stats.discoMes.veces)}</span>
                <strong>{stats.discoMes.vinilo.titulo}</strong>
              </div>
            </button>
          )}
        </div>
      )}
    </section>
  )
}
