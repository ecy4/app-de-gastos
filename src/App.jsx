import { useState, useEffect } from 'react'
import FormularioGastos from './components/FormularioGastos'
import ListaGastos from './components/ListaGastos'
import ControlPresupuesto from './components/ControlPresupuesto'
import SeccionDeudas from './components/SeccionDeudas'
import './App.css'

function App() {
  const [gastos, setGastos] = useState(() => {
    const gastosGuardados = localStorage.getItem('gastos')
    return gastosGuardados ? JSON.parse(gastosGuardados) : []
  })

  const [presupuesto, setPresupuesto] = useState(() => {
    const presupuestoGuardado = localStorage.getItem('presupuesto')
    return presupuestoGuardado ? JSON.parse(presupuestoGuardado) : { monto: 0, tipo: 'quincenal' }
  })

  const [deudas, setDeudas] = useState(() => {
    const deudasGuardadas = localStorage.getItem('deudas')
    return deudasGuardadas ? JSON.parse(deudasGuardadas) : []
  })

  const [pestanaActiva, setPestanaActiva] = useState('gastos') // 'gastos' | 'deudas'

  useEffect(() => {
    localStorage.setItem('gastos', JSON.stringify(gastos))
  }, [gastos])

  useEffect(() => {
    localStorage.setItem('presupuesto', JSON.stringify(presupuesto))
  }, [presupuesto])

  useEffect(() => {
    localStorage.setItem('deudas', JSON.stringify(deudas))
  }, [deudas])
 
  const agregarGasto = (gasto) => {
    setGastos([gasto, ...gastos])
  }

  const eliminarGasto = (id) => {
    const gastoAEliminar = gastos.find(gasto => gasto.id === id)
    // Si el gasto provenía de un abono a una deuda, revertir el abono
    if (gastoAEliminar && gastoAEliminar.deudaId) {
      setDeudas(prevDeudas => prevDeudas.map(d => {
        if (d.id === gastoAEliminar.deudaId) {
          const nuevoAbonado = Math.max(0, (Number(d.abonado) || 0) - gastoAEliminar.cantidad)
          return {
            ...d,
            abonado: nuevoAbonado,
            pagada: nuevoAbonado >= (Number(d.monto) || 0) && Number(d.monto) > 0
          }
        }
        return d
      }))
    }
    const gastosFiltrados = gastos.filter(gasto => gasto.id !== id)
    setGastos(gastosFiltrados)
  }

  const actualizarPresupuesto = (nuevoPresupuesto) => {
    setPresupuesto(nuevoPresupuesto)
  }

  const sumarPresupuesto = (montoExtra) => {
    setPresupuesto(prev => ({
      ...prev,
      monto: (Number(prev.monto) || 0) + montoExtra
    }))
  }

  // Manejo de Deudas
  const agregarDeuda = (deuda) => {
    setDeudas([deuda, ...deudas])
  }

  // Registrar abono/pago de deuda -> Descuenta del presupuesto y se registra como gasto
  const registrarAbonoDeuda = (deudaId, montoAbono, nombreDeuda) => {
    // 1. Actualizar el monto abonado de la deuda
    setDeudas(prevDeudas => prevDeudas.map(d => {
      if (d.id === deudaId) {
        const nuevoAbonado = (Number(d.abonado) || 0) + montoAbono
        const total = Number(d.monto) || 0
        return {
          ...d,
          abonado: nuevoAbonado,
          pagada: nuevoAbonado >= total
        }
      }
      return d
    }))

    // 2. Crear y registrar automáticamente el gasto en la categoría "deudas"
    const nuevoGasto = {
      id: crypto.randomUUID(),
      nombre: `Pago deuda: ${nombreDeuda}`,
      cantidad: montoAbono,
      categoria: 'deudas',
      deudaId: deudaId,
      fecha: new Date().toISOString()
    }
    setGastos(prevGastos => [nuevoGasto, ...prevGastos])
  }

  const eliminarDeuda = (id) => {
    setDeudas(deudas.filter(d => d.id !== id))
  }

  const deudasPendientesCount = deudas.filter(d => !(d.pagada || ((d.abonado || 0) >= d.monto))).length

  const exportarDatos = () => {
    const data = {
      gastos,
      presupuesto,
      deudas,
      fechaExportacion: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `copia-seguridad-gastos-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importarDatos = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.gastos) setGastos(data.gastos)
        if (data.presupuesto) setPresupuesto(data.presupuesto)
        if (data.deudas) setDeudas(data.deudas)
        alert('¡Copia de seguridad restaurada correctamente!')
      } catch {
        alert('El archivo seleccionado no es válido')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className='app-container'>
      <div className='tarjeta-principal'>
        <header className='app-header'>
          <div className='icono-header'>💰</div>
          <div>
            <h1>Control de Finanzas</h1>
            <p className='subtitulo'>Gastos, presupuestos y compromisos</p>
          </div>
        </header>

        {/* Barra de pestañas principales */}
        <nav className='nav-pestanas'>
          <button 
            className={`btn-pestana ${pestanaActiva === 'gastos' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('gastos')}
          >
            📊 Gastos & Presupuesto
          </button>
          <button 
            className={`btn-pestana ${pestanaActiva === 'deudas' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('deudas')}
          >
            💳 Deudas por Pagar
            {deudasPendientesCount > 0 && (
              <span className='badge-deudas-alerta'>{deudasPendientesCount}</span>
            )}
          </button>
        </nav>

        {pestanaActiva === 'gastos' ? (
          <>
            <ControlPresupuesto 
              presupuesto={presupuesto}
              onActualizarPresupuesto={actualizarPresupuesto}
              onSumarPresupuesto={sumarPresupuesto}
              gastos={gastos}
            />

            <FormularioGastos onAgregarGasto={agregarGasto} />
            <ListaGastos gastos={gastos} onEliminarGasto={eliminarGasto} />
          </>
        ) : (
          <SeccionDeudas 
            deudas={deudas}
            onAgregarDeuda={agregarDeuda}
            onRegistrarAbono={registrarAbonoDeuda}
            onEliminarDeuda={eliminarDeuda}
          />
        )}

        {/* Barra de utilidades de copia de seguridad */}
        <footer className='app-footer'>
          <button onClick={exportarDatos} className='btn-footer-backup' title='Descargar copia de seguridad en JSON'>
            💾 Descargar Copia
          </button>
          <label className='btn-footer-backup btn-importar' title='Restaurar copia de seguridad desde un archivo JSON'>
            📂 Restaurar Copia
            <input type='file' accept='.json' onChange={importarDatos} style={{ display: 'none' }} />
          </label>
        </footer>
      </div>
    </div>
  )
} 

export default App
