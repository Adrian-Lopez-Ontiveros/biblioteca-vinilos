import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { tema } from './theme'
import BottomNav from './components/BottomNav'
import Inicio from './views/Inicio'
import Coleccion from './views/Coleccion'
import Anadir from './views/Anadir'
import Detalle from './views/Detalle' // IMPORTAMOS EL DETALLE

function App() {
  const [vistaActual, setVistaActual] = useState('inicio') 
  const [vinilos, setVinilos] = useState([])
  const [viniloSeleccionado, setViniloSeleccionado] = useState(null) // NUEVO ESTADO

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

  // FUNCIÓN PARA ABRIR LA FICHA DESDE CUALQUIER SITIO
  const abrirDetalle = (vinilo) => {
    setViniloSeleccionado(vinilo)
    setVistaActual('detalle')
  }

  return (
    
      
      
        {vistaActual === 'inicio' && (
          
        )}
        
        {vistaActual === 'coleccion' && (
          
        )}

        {vistaActual === 'añadir' && (
          
        )}

        {/* AQUÍ CARGAMOS LA VISTA DETALLE */}
        {vistaActual === 'detalle' && viniloSeleccionado && (
           setVistaActual('coleccion')} 
            refrescarVinilos={obtenerVinilos} 
          />
        )}
      

      
      
    
  )
}

const estilos = {
  app: { backgroundColor: tema.fondo, color: tema.textoPrincipal, minHeight: '100vh', fontFamily: tema.fuenteSecundaria, width: '100%', overflowX: 'hidden' },
  contenido: { paddingBottom: '90px' }
}

export default App