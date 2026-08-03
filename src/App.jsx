import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { tema } from './theme'
import BottomNav from './components/BottomNav'

// Importaremos las vistas en el siguiente paso
// import Inicio from './views/Inicio'
// import Coleccion from './views/Coleccion'

function App() {
  const [vistaActual, setVistaActual] = useState('inicio') 
  const [vinilos, setVinilos] = useState([])

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

  return (
    <div style={estilos.app}>
      
      {/* Contenedor principal de las vistas */}
      <div style={estilos.contenido}>
        {vistaActual === 'inicio' && (
          <div style={{padding: '20px'}}>Cargando Inicio...</div>
          {/* <Inicio vinilos={vinilos} setVistaActual={setVistaActual} /> */}
        )}
        
        {vistaActual === 'coleccion' && (
          <div style={{padding: '20px'}}>Cargando Colección...</div>
          {/* <Coleccion vinilos={vinilos} setVistaActual={setVistaActual} /> */}
        )}

        {vistaActual === 'añadir' && (
          <div style={{padding: '20px'}}>Aquí irá el formulario oscuro...</div>
        )}
      </div>

      {/* Barra de navegación inferior */}
      <BottomNav vistaActual={vistaActual} setVistaActual={setVistaActual} />
      
    </div>
  )
}

const estilos = {
  app: {
    backgroundColor: tema.fondo,
    color: tema.textoPrincipal,
    minHeight: '100vh',
    fontFamily: tema.fuenteSecundaria,
    width: '100%',
    overflowX: 'hidden'
  },
  contenido: {
    paddingBottom: '90px', // Espacio para que el BottomNav no tape el contenido
  }
}

export default App