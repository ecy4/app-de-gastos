import { useState } from 'react';
import '../hojas-de-estilo/ControlPresupuesto.css';
import { FaWallet, FaEdit, FaPlus, FaCalendarAlt, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

function ControlPresupuesto({ presupuesto, onActualizarPresupuesto, onSumarPresupuesto, gastos }) {
    const [editando, setEditando] = useState(false);
    const [modoSumar, setModoSumar] = useState(false);
    const [montoInput, setMontoInput] = useState('');
    const [tipoInput, setTipoInput] = useState(presupuesto?.tipo || 'quincenal');

    // Calcular totales
    const totalGastado = gastos.reduce((acc, gasto) => acc + (Number(gasto.cantidad) || 0), 0);
    const montoPresupuesto = Number(presupuesto?.monto) || 0;
    const disponible = montoPresupuesto - totalGastado;
    
    // Porcentaje de presupuesto gastado
    const porcentajeGastado = montoPresupuesto > 0 
        ? Math.min(Math.round((totalGastado / montoPresupuesto) * 100), 100) 
        : 0;
    const porcentajeReal = montoPresupuesto > 0 ? (totalGastado / montoPresupuesto) * 100 : 0;

    const formatearCOP = (valor) => {
        return `$ ${new Intl.NumberFormat('es-CO').format(Math.abs(valor) || 0)}`;
    };

    const handleMontoChange = (e) => {
        const soloNumeros = e.target.value.replace(/\D/g, '');
        if (!soloNumeros) {
            setMontoInput('');
            return;
        }
        setMontoInput(new Intl.NumberFormat('es-CO').format(Number(soloNumeros)));
    };

    const iniciarEdicion = (esSumar = false) => {
        setModoSumar(esSumar);
        setMontoInput('');
        setTipoInput(presupuesto?.tipo || 'quincenal');
        setEditando(true);
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setMontoInput('');
    };

    const guardarPresupuesto = (e) => {
        e.preventDefault();
        const valorNumerico = parseFloat(montoInput.replace(/\./g, ''));
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            alert('Por favor ingrese un monto válido mayor a 0');
            return;
        }

        if (modoSumar) {
            onSumarPresupuesto(valorNumerico);
        } else {
            onActualizarPresupuesto({
                monto: valorNumerico,
                tipo: tipoInput
            });
        }
        setEditando(false);
        setMontoInput('');
    };

    // Color del estado
    const obtenerEstadoClase = () => {
        if (montoPresupuesto === 0) return 'neutral';
        if (disponible < 0) return 'peligro';
        if (porcentajeReal >= 85) return 'alerta';
        return 'saludable';
    };

    return (
        <div className={`control-presupuesto-tarjeta ${obtenerEstadoClase()}`}>
            <div className="cp-cabecera">
                <div className="cp-titulo-seccion">
                    <span className="cp-icono-principal"><FaWallet /></span>
                    <div>
                        <h3>Presupuesto {presupuesto?.tipo === 'quincenal' ? 'Quincenal' : 'Mensual'}</h3>
                        <span className="cp-periodo-tag">
                            <FaCalendarAlt /> {presupuesto?.tipo === 'quincenal' ? 'Cada 15 días (Quincena)' : 'Mensual (30 días)'}
                        </span>
                    </div>
                </div>

                {!editando && (
                    <div className="cp-botones-accion">
                        <button 
                            className="cp-btn-secundario" 
                            onClick={() => iniciarEdicion(true)}
                            title="Sumar dinero extra o quincena recibida"
                        >
                            <FaPlus /> Recibí dinero
                        </button>
                        <button 
                            className="cp-btn-icono" 
                            onClick={() => iniciarEdicion(false)}
                            title="Editar presupuesto base"
                            aria-label="Editar presupuesto"
                        >
                            <FaEdit />
                        </button>
                    </div>
                )}
            </div>

            {editando ? (
                <form onSubmit={guardarPresupuesto} className="cp-formulario-edicion">
                    <p className="cp-form-titulo">
                        {modoSumar ? '➕ Agregar ingreso / dinero recibido' : '✏️ Configurar presupuesto'}
                    </p>
                    
                    <div className="cp-campos-fila">
                        <div className="cp-campo">
                            <label>Monto (COP):</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={montoInput}
                                onChange={handleMontoChange}
                                placeholder="Ej. 1.200.000"
                                autoFocus
                            />
                        </div>

                        {!modoSumar && (
                            <div className="cp-campo">
                                <label>Periodicidad:</label>
                                <select 
                                    value={tipoInput} 
                                    onChange={(e) => setTipoInput(e.target.value)}
                                >
                                    <option value="quincenal">Quincenal (15nal)</option>
                                    <option value="mensual">Mensual</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="cp-form-acciones">
                        <button type="button" className="cp-btn-cancelar" onClick={cancelarEdicion}>
                            <FaTimes /> Cancelar
                        </button>
                        <button type="submit" className="cp-btn-guardar">
                            <FaCheck /> {modoSumar ? 'Sumar Dinero' : 'Guardar'}
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="cp-metricas-grid">
                        <div className="cp-metrica-card">
                            <span className="cp-metrica-label">Presupuesto</span>
                            <strong className="cp-metrica-valor cp-presupuesto">
                                {montoPresupuesto > 0 ? formatearCOP(montoPresupuesto) : '$ 0'}
                            </strong>
                        </div>

                        <div className="cp-metrica-card">
                            <span className="cp-metrica-label">Gastado</span>
                            <strong className="cp-metrica-valor cp-gastado">
                                {formatearCOP(totalGastado)}
                            </strong>
                        </div>

                        <div className="cp-metrica-card">
                            <span className="cp-metrica-label">Disponible</span>
                            <strong className={`cp-metrica-valor cp-disponible ${disponible < 0 ? 'negativo' : ''}`}>
                                {disponible < 0 ? `- ${formatearCOP(disponible)}` : formatearCOP(disponible)}
                            </strong>
                        </div>
                    </div>

                    {montoPresupuesto > 0 ? (
                        <div className="cp-barra-seccion">
                            <div className="cp-barra-info">
                                <span>Progreso de gastos</span>
                                <span className="cp-porcentaje-texto">
                                    {Math.round(porcentajeReal)}% {porcentajeReal > 100 && '(Excedido)'}
                                </span>
                            </div>
                            <div className="cp-barra-fondo">
                                <div 
                                    className={`cp-barra-progreso ${obtenerEstadoClase()}`}
                                    style={{ width: `${Math.min(porcentajeReal, 100)}%` }}
                                />
                            </div>
                            {disponible < 0 && (
                                <p className="cp-alerta-sobregiro">
                                    <FaExclamationTriangle /> ¡Cuidado! Has sobrepasado tu presupuesto por {formatearCOP(disponible)}.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="cp-sin-presupuesto">
                            <p>No has configurado tu presupuesto quincenal o mensual aún.</p>
                            <button className="cp-btn-iniciar" onClick={() => iniciarEdicion(false)}>
                                <FaPlus /> Asignar Presupuesto
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ControlPresupuesto;

