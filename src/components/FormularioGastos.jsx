import { useState } from "react";
import '../hojas-de-estilo/FormularioGastos.css'

function FormularioGastos({ onAgregarGasto }) {
    const [nombre, setNombre] = useState('')
    const [cantidad, setCantidad] = useState('')
    const [categoria, setCategoria] = useState('') 

    // Formatear automáticamente con puntos de miles al escribir
    const handleCantidadChange = (e) => {
        const soloNumeros = e.target.value.replace(/\D/g, '')
        if (!soloNumeros) {
            setCantidad('')
            return
        }
        const formateado = new Intl.NumberFormat('es-CO').format(Number(soloNumeros))
        setCantidad(formateado)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        const valorNumerico = parseFloat(cantidad.replace(/\./g, ''))
        
        if (!nombre.trim() || isNaN(valorNumerico) || valorNumerico <= 0) {
            alert('Por favor ingrese una descripción y una cantidad válida')
            return
        }

        if (!categoria) {
            alert('Por favor selecciona una categoría para el gasto')
            return
        }

        const nuevoGasto = {
            id: crypto.randomUUID(),
            nombre: nombre.trim(),
            cantidad: valorNumerico,
            categoria
        }
        
        onAgregarGasto(nuevoGasto)

        setNombre('')
        setCantidad('')
        setCategoria('')
    } 

    return (
        <form onSubmit={handleSubmit} className="formulario-gastos">
            <div className="campo-grupo">
                <label className="campo-label">Descripción del gasto</label>
                <input
                    className="campo-input"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Supermercado, Gasolina, Netflix..."
                />  
            </div>
            <div className="campo-grupo">
                <label className="campo-label">Cantidad (COP)</label>
                <input
                    className="campo-input"
                    type="text"
                    inputMode="numeric"
                    value={cantidad}
                    onChange={handleCantidadChange}
                    placeholder="Ej. 50.000"
                />
            </div>
            <div className="campo-grupo">   
                <label className="campo-label">Categoría</label>
                <select
                    className="campo-select"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                >
                    <option value="">-- Seleccionar categoría --</option>
                    <option value="deudas">💳 Deudas / Préstamos</option>
                    <option value="comida">🍔 Comida</option>
                    <option value="transporte">🚗 Transporte</option>
                    <option value="servicios">💡 Servicios</option>
                    <option value="hogar">🏠 Hogar</option>
                    <option value="entretenimiento">🎮 Entretenimiento</option>
                    <option value="compras">🛍️ Compras</option>
                    <option value="salud">💊 Salud</option>
                    <option value="otros">📦 Otros</option>
                </select>
            </div>  
            <button className="btn-agregar" type="submit">
                + Agregar Gasto
            </button>
        </form>    
    )
}

export default FormularioGastos
