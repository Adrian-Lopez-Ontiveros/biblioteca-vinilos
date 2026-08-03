import { useState } from 'react'
import { supabase } from '../supabase'
import { tema } from '../theme'

export default function Detalle({ vinilo, volver, refrescarVinilos }) {
  const [viniloActual, setViniloActual] = useState(vinilo)
  const [registrando, setRegistrando] = useState(false)

  const registrarEscucha = async () => {
    setRegistrando(true)
    const ahora = new Date().toISOString()
    const historialActual = viniloActual.historial_escuchas || []
    const nuevoHistorial = [ahora, ...historialActual]
    
    const { error } = await supabase
      .from('vinilos')
      .update({ 
        ultima_escucha: ahora,
        historial_escuchas: nuevoHistorial
      })
      .eq('id', viniloActual.id)

    if (!error) {
      setViniloActual({ ...viniloActual, ultima_escucha: ahora, historial_escuchas: nuevoHistorial })
      refrescarVinilos() // Actualiza la app por detrás
    } else {
      alert('Hubo un error al guardar la escucha')
    }
    setRegistrando(false)
  }

  const renderEstrellas = (valoracion) => {
    const puntos = valoracion || 0
    return '★'.repeat(puntos) + '☆'.repeat(5 - puntos)
  }

  const formatearFechaHora = (fechaISO) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    
      
        ‹ Volver
      

      
        
        {viniloActual.titulo}
        {viniloActual.autor}
        
        
          {viniloActual.año || 'Sin año'}
          •
          {viniloActual.genero || 'Sin género'}
          •
          {renderEstrellas(viniloActual.valoracion)}
        
        
        
          {registrando ? '...' : '▶ Registrar escucha'}
        
      

      
        {viniloActual.canciones && (
          
            Lista de Títulos
            
              {viniloActual.canciones.split('\n').map((cancion, index) => {
                if(!cancion.trim()) return null;
                return (
                  
                    {index + 1}
                    {cancion}
                  
                )
              })}
            
          
        )}

        
          Historial de Escuchas
          {(!viniloActual.historial_escuchas || viniloActual.historial_escuchas.length === 0) ? (
            Aún no se ha registrado ninguna escucha.
          ) : (
            
              {viniloActual.historial_escuchas.map((fecha, index) => (
                
                  🎧
                  {formatearFechaHora(fecha)}
                
              ))}
            
          )}
        
      
    
  )
}

const estilos = {
  contenedor: { padding: '20px', paddingBottom: '40px' },
  botonVolver: { background: 'none', border: 'none', color: tema.textoPrincipal, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: 0, marginBottom: '20px' },
  cabeceraVis: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '30px' },
  portadaGigante: { width: '220px', height: '220px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: '20px', backgroundColor: tema.superficieClara },
  titulo: { fontSize: '26px', margin: '0 0 5px 0', fontFamily: tema.fuentePrincipal, color: tema.textoPrincipal },
  autor: { fontSize: '18px', color: tema.textoSecundario, margin: '0 0 15px 0' },
  metaDatos: { display: 'flex', gap: '10px', fontSize: '14px', color: tema.textoSecundario, alignItems: 'center', marginBottom: '25px' },
  estrellas: { color: tema.acento, letterSpacing: '2px' },
  botonPlay: { backgroundColor: tema.acento, color: '#000', border: 'none', borderRadius: '30px', padding: '14px 30px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '0 auto' },
  secciones: { display: 'flex', flexDirection: 'column', gap: '30px' },
  seccion: { backgroundColor: tema.superficie, padding: '20px', borderRadius: '12px' },
  tituloSeccion: { fontSize: '18px', margin: '0 0 15px 0', color: tema.textoPrincipal, borderBottom: `1px solid ${tema.borde}`, paddingBottom: '10px' },
  listaCanciones: { listStyle: 'none', padding: 0, margin: 0 },
  itemCancion: { display: 'flex', gap: '15px', padding: '12px 0', borderBottom: `1px solid ${tema.borde}`, fontSize: '15px' },
  numeroCancion: { color: tema.textoSecundario, minWidth: '20px' },
  textoCancion: { color: tema.textoPrincipal },
  textoVacio: { fontStyle: 'italic', color: tema.textoSecundario, fontSize: '14px' },
  listaHistorial: { listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' },
  itemHistorial: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: `1px solid ${tema.borde}`, fontSize: '15px', color: tema.textoPrincipal },
  puntoLista: { fontSize: '18px' }
}