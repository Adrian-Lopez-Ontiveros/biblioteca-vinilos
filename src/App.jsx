import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { tema } from './theme'
import BottomNav from './components/BottomNav'
import Inicio from './views/Inicio'
import Coleccion from './views/Coleccion'
import Anadir from './views/Anadir'
import Detalle from './views/Detalle'

function App() {
  const [vistaActual, setVistaActual] = useState('inicio') 
  const [vinilos, setVinilos] = useState([])
  const [viniloSeleccionado, setViniloSeleccionado] = useState(null)

  useEffect(() => {
    obtenerVinilos()
  }, [])

  const obtenerVinilos = async () => {
    const { data, error } = await supabase
      .from('vinilos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setVinilos(data)
  }

  const abrirDetalle = (vinilo) => {
    setViniloSeleccionado(vinilo)
    setVistaActual('detalle')
  }

  return (
    <div style={estilos.app}>
      
      <div style={estilos.contenido}>
        {vistaActual === 'inicio' && (
          <Inicio vinilos={vinilos} setVistaActual={setVistaActual} abrirDetalle={abrirDetalle} />
        )}
        
        {vistaActual === 'coleccion' && (
          <Coleccion 
            vinilos={vinilos} 
            abrirDetalle={abrirDetalle} 
            refrescarVinilos={obtenerVinilos}
            irAEditar={(vinilo) => {
              setViniloSeleccionado(vinilo)
              setVistaActual('editar')
            }}
          />
        )}

        {vistaActual === 'añadir' && (
          <Anadir key="crear" setVistaActual={setVistaActual} refrescarVinilos={obtenerVinilos} />
        )}

        {vistaActual === 'editar' && viniloSeleccionado && (
          <Anadir key="editar" setVistaActual={setVistaActual} refrescarVinilos={obtenerVinilos} viniloAEditar={viniloSeleccionado} />
        )}

        {vistaActual === 'detalle' && viniloSeleccionado && (
          <Detalle 
            vinilo={viniloSeleccionado} 
            volver={() => setVistaActual('coleccion')} 
            refrescarVinilos={obtenerVinilos} 
          />
        )}
      </div>

      <BottomNav vistaActual={vistaActual} setVistaActual={setVistaActual} />
      
    </div>
  )
}

const estilos = {
  app: { backgroundColor: tema.fondo, color: tema.textoPrincipal, minHeight: '100vh', fontFamily: tema.fuenteSecundaria, width: '100%', overflowX: 'hidden' },
  contenido: { paddingBottom: '90px' }
}

export default App