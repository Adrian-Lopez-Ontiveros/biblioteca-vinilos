import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import BottomNav from './components/BottomNav'
import Inicio from './views/Inicio'
import Coleccion from './views/Coleccion'
import Anadir from './views/Anadir'
import Detalle from './views/Detalle'

export default function App() {
  const [vistaActual, setVistaActual] = useState('inicio')
  const [vinilos, setVinilos] = useState([])
  const [viniloSeleccionado, setViniloSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  useEffect(() => {
    obtenerVinilos()
  }, [])

  const obtenerVinilos = async () => {
    const { data, error } = await supabase
      .from('vinilos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorCarga('No se ha podido cargar la colección.')
      setVinilos([])
    } else {
      setErrorCarga('')
      setVinilos(data || [])
    }
    setCargando(false)
  }

  const abrirDetalle = (vinilo) => {
    setViniloSeleccionado(vinilo)
    setVistaActual('detalle')
  }

  const irAEditar = (vinilo) => {
    setViniloSeleccionado(vinilo)
    setVistaActual('editar')
  }

  const cambiarVista = (vista) => {
    if (vista === 'añadir') setViniloSeleccionado(null)
    setVistaActual(vista)
  }

  return (
    <div className="app">
      <div className="app-contenido">
        {errorCarga && <p className="aviso aviso-error">{errorCarga}</p>}

        {vistaActual === 'inicio' && (
          <Inicio
            vinilos={vinilos}
            cargando={cargando}
            setVistaActual={cambiarVista}
            abrirDetalle={abrirDetalle}
          />
        )}

        {vistaActual === 'coleccion' && (
          <Coleccion vinilos={vinilos} abrirDetalle={abrirDetalle} />
        )}

        {vistaActual === 'añadir' && (
          <Anadir
            key="crear"
            setVistaActual={cambiarVista}
            refrescarVinilos={obtenerVinilos}
          />
        )}

        {vistaActual === 'editar' && viniloSeleccionado && (
          <Anadir
            key={viniloSeleccionado.id}
            setVistaActual={cambiarVista}
            refrescarVinilos={obtenerVinilos}
            viniloAEditar={viniloSeleccionado}
          />
        )}

        {vistaActual === 'detalle' && viniloSeleccionado && (
          <Detalle
            vinilo={viniloSeleccionado}
            volver={() => setVistaActual('coleccion')}
            refrescarVinilos={obtenerVinilos}
            irAEditar={irAEditar}
            onActualizado={setViniloSeleccionado}
          />
        )}
      </div>

      <BottomNav vistaActual={vistaActual} setVistaActual={cambiarVista} />
    </div>
  )
}
