import { useState } from 'react';
import '../hojas-de-estilo/ListaGastos.css'
import { FaTrashAlt } from 'react-icons/fa';

const CATEGORIAS_INFO = {
    deudas: { nombre: 'Deudas', icono: '💳', color: '#be123c', bg: '#ffe4e6' },
    comida: { nombre: 'Comida', icono: '🍔', color: '#b45309', bg: '#fef3c7' },
    transporte: { nombre: 'Transporte', icono: '🚗', color: '#1d4ed8', bg: '#dbeafe' },
    servicios: { nombre: 'Servicios', icono: '💡', color: '#047857', bg: '#d1fae5' },
    hogar: { nombre: 'Hogar', icono: '🏠', color: '#0e7490', bg: '#cffafe' },
    entretenimiento: { nombre: 'Entretenimiento', icono: '🎮', color: '#6d28d9', bg: '#ede9fe' },
    compras: { nombre: 'Compras', icono: '🛍️', color: '#be185d', bg: '#fce7f3' },
    salud: { nombre: 'Salud', icono: '💊', color: '#b91c1c', bg: '#fee2e2' },
    otros: { nombre: 'Otros', icono: '📦', color: '#475569', bg: '#f1f5f9' },
};

function ListaGastos({ gastos,  onEliminarGasto }) {
    const [filtroCategoria, setFiltroCategoria] = useState('todas')
    
    const gastosFiltrados = filtroCategoria === 'todas'
        ? gastos
        : gastos.filter(g => (g.categoria || 'otros') === filtroCategoria)

    const total = gastosFiltrados.reduce((acc, gasto) => acc + (Number(gasto.cantidad) || 0), 0)

    const formatearCOP = (valor) => {
        return `$ ${new Intl.NumberFormat('es-CO').format(valor || 0)}`
    }

    const obtenerCategoria = (catKey) => {
        return CATEGORIAS_INFO[catKey] || CATEGORIAS_INFO.otros
    }
    
    return (
        <div className="lista-gastos-seccion">
            <div className="lista-cabecera">
                <h2>Mis Gastos</h2>
                <span className="badge-contador">{gastos.length} {gastos.length === 1 ? 'registro' : 'registros'}</span>
            </div>

            {gastos.length > 0 && (
                <div className="filtros-categoria-contenedor">
                    <span className="filtros-titulo">Filtrar por categoría:</span>
                    <div className="filtros-categoria">
                        <button 
                            className={`chip-filtro ${filtroCategoria === 'todas' ? 'activo' : ''}`}
                            onClick={() => setFiltroCategoria('todas')}
                            type="button"
                        >
                            Todas ({gastos.length})
                        </button>
                        {Object.entries(CATEGORIAS_INFO).map(([key, config]) => {
                            const cantidadEnCat = gastos.filter(g => (g.categoria || 'otros') === key).length;
                            if (cantidadEnCat === 0) return null;
                            return (
                                <button
                                    key={key}
                                    className={`chip-filtro ${filtroCategoria === key ? 'activo' : ''}`}
                                    onClick={() => setFiltroCategoria(key)}
                                    type="button"
                                >
                                    <span>{config.icono}</span> {config.nombre} ({cantidadEnCat})
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {gastos.length === 0 ? (
                <div className="lista-vacia">
                    <span className="icono-vacio">🧾</span>
                    <p className="texto-vacio-principal">No hay gastos registrados aún</p>
                    <p className="texto-vacio-secundario">Agrega tus gastos usando el formulario superior</p>
                </div>
            ) : gastosFiltrados.length === 0 ? (
                <div className="lista-vacia">
                    <span className="icono-vacio">🔍</span>
                    <p className="texto-vacio-principal">No hay gastos en esta categoría</p>
                    <p className="texto-vacio-secundario">Prueba seleccionando otra categoría o "Todas"</p>
                </div>
            ) : (
                <ul className="lista-gasto">
                    {gastosFiltrados.map((gasto) => {
                        const cat = obtenerCategoria(gasto.categoria);
                        return (
                            <li key={gasto.id} className="gasto-item">
                                <div className="gasto-info-principal">
                                    <span className="gasto-nombre">{gasto.nombre}</span>
                                    <span 
                                        className="gasto-categoria-badge"
                                        style={{ 
                                            backgroundColor: cat.bg, 
                                            color: cat.color 
                                        }}
                                    >
                                        <span className="badge-icono">{cat.icono}</span>
                                        {cat.nombre}
                                    </span>
                                </div>
                                <div className="gasto-derecha">
                                    <span className="gasto-cantidad">{formatearCOP(gasto.cantidad)}</span>
                                    <button 
                                        className="btn-eliminar" 
                                        onClick={() => onEliminarGasto(gasto.id)}
                                        title="Eliminar gasto"
                                        aria-label="Eliminar gasto"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}  

            <div className="tarjeta-total">
                <span className="total-label">
                    {filtroCategoria === 'todas' ? 'Total de Gastos:' : `Total (${obtenerCategoria(filtroCategoria).nombre}):`}
                </span>
                <span className="total-monto">{formatearCOP(total)}</span>
            </div>
        </div>
    )
}

export default ListaGastos