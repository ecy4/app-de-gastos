import { useState } from 'react';
import '../hojas-de-estilo/Deudas.css';
import { FaCreditCard, FaTrashAlt, FaCheckCircle, FaCalendarAlt, FaPlus, FaMoneyBillWave, FaTimes, FaHandHoldingUsd } from 'react-icons/fa';

function SeccionDeudas({ deudas, onAgregarDeuda, onRegistrarAbono, onEliminarDeuda }) {
    const [nombre, setNombre] = useState('');
    const [monto, setMonto] = useState('');
    const [fechaLimite, setFechaLimite] = useState('');
    const [filtro, setFiltro] = useState('todas'); // 'todas' | 'pendientes' | 'pagadas'

    // Estado para modal / form de abono
    const [deudaSeleccionadaParaAbono, setDeudaSeleccionadaParaAbono] = useState(null);
    const [montoAbonoInput, setMontoAbonoInput] = useState('');

    // Formatear valor con puntos de miles al escribir
    const handleMontoChange = (e, setter) => {
        const soloNumeros = e.target.value.replace(/\D/g, '');
        if (!soloNumeros) {
            setter('');
            return;
        }
        setter(new Intl.NumberFormat('es-CO').format(Number(soloNumeros)));
    };

    const handleCrearDeuda = (e) => {
        e.preventDefault();
        const valorNumerico = parseFloat(monto.replace(/\./g, ''));

        if (!nombre.trim() || isNaN(valorNumerico) || valorNumerico <= 0) {
            alert('Por favor ingrese un nombre de deuda y un monto válido');
            return;
        }

        const nuevaDeuda = {
            id: crypto.randomUUID(),
            nombre: nombre.trim(),
            monto: valorNumerico,
            abonado: 0,
            fechaLimite: fechaLimite || null,
            pagada: false,
            fechaCreacion: new Date().toISOString()
        };

        onAgregarDeuda(nuevaDeuda);
        setNombre('');
        setMonto('');
        setFechaLimite('');
    };

    const formatearCOP = (valor) => {
        return `$ ${new Intl.NumberFormat('es-CO').format(Math.max(0, valor) || 0)}`;
    };

    const abrirModalAbono = (deuda) => {
        setDeudaSeleccionadaParaAbono(deuda);
        const restante = Math.max(0, deuda.monto - (deuda.abonado || 0));
        setMontoAbonoInput(new Intl.NumberFormat('es-CO').format(restante));
    };

    const cerrarModalAbono = () => {
        setDeudaSeleccionadaParaAbono(null);
        setMontoAbonoInput('');
    };

    const handleConfirmarAbono = (e) => {
        e.preventDefault();
        if (!deudaSeleccionadaParaAbono) return;

        const valorAbono = parseFloat(montoAbonoInput.replace(/\./g, ''));
        const restante = Math.max(0, deudaSeleccionadaParaAbono.monto - (deudaSeleccionadaParaAbono.abonado || 0));

        if (isNaN(valorAbono) || valorAbono <= 0) {
            alert('Por favor ingrese un monto de abono válido');
            return;
        }

        if (valorAbono > restante) {
            const confirmar = window.confirm(`El monto ($ ${new Intl.NumberFormat('es-CO').format(valorAbono)}) supera el saldo pendiente ($ ${new Intl.NumberFormat('es-CO').format(restante)}). ¿Deseas pagar el total de $ ${new Intl.NumberFormat('es-CO').format(restante)}?`);
            if (!confirmar) return;
            onRegistrarAbono(deudaSeleccionadaParaAbono.id, restante, deudaSeleccionadaParaAbono.nombre);
        } else {
            onRegistrarAbono(deudaSeleccionadaParaAbono.id, valorAbono, deudaSeleccionadaParaAbono.nombre);
        }

        cerrarModalAbono();
    };

    // Cálculos globales de deudas
    const totalDeudasOriginal = deudas.reduce((acc, d) => acc + (Number(d.monto) || 0), 0);
    const totalAbonado = deudas.reduce((acc, d) => acc + (Number(d.abonado) || 0), 0);
    const totalPendiente = Math.max(0, totalDeudasOriginal - totalAbonado);

    const deudasFiltradas = deudas.filter(d => {
        const esPagada = d.pagada || (d.abonado >= d.monto);
        if (filtro === 'pendientes') return !esPagada;
        if (filtro === 'pagadas') return esPagada;
        return true;
    });

    return (
        <div className="seccion-deudas">
            {/* Resumen de Deudas */}
            <div className="deudas-resumen-grid">
                <div className="deuda-card-metrica pendiente">
                    <span className="deuda-metrica-label">Saldo Pendiente por Pagar</span>
                    <strong className="deuda-metrica-valor">{formatearCOP(totalPendiente)}</strong>
                    <span className="deuda-metrica-sub">
                        {deudas.filter(d => !d.pagada && ((d.abonado || 0) < d.monto)).length} compromisos pendientes
                    </span>
                </div>

                <div className="deuda-card-metrica pagada">
                    <span className="deuda-metrica-label">Total Abonado / Pagado</span>
                    <strong className="deuda-metrica-valor">{formatearCOP(totalAbonado)}</strong>
                    <span className="deuda-metrica-sub">
                        Reflejado en tu registro de gastos
                    </span>
                </div>
            </div>

            {/* Formulario Agregar Deuda */}
            <form onSubmit={handleCrearDeuda} className="formulario-deudas">
                <div className="form-deudas-header">
                    <span className="form-deudas-icono"><FaCreditCard /></span>
                    <div>
                        <h4>Registrar Nueva Deuda o Compromiso</h4>
                        <p className="form-deudas-sub">Cada abono que hagas se descontará automáticamente de tu presupuesto</p>
                    </div>
                </div>

                <div className="deuda-campo-grupo">
                    <label>Acreedor o Concepto</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Tarjeta Bancolombia, Préstamo familiar, Cuota moto..."
                        required
                    />
                </div>

                <div className="deuda-campos-grid">
                    <div className="deuda-campo-grupo">
                        <label>Monto total de la deuda (COP)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={monto}
                            onChange={(e) => handleMontoChange(e, setMonto)}
                            placeholder="Ej. 500.000"
                            required
                        />
                    </div>

                    <div className="deuda-campo-grupo">
                        <label>Fecha límite de pago</label>
                        <input
                            type="date"
                            value={fechaLimite}
                            onChange={(e) => setFechaLimite(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-agregar-deuda">
                    <FaPlus /> Registrar Deuda
                </button>
            </form>

            {/* Modal / Formulario Flotante de Abono */}
            {deudaSeleccionadaParaAbono && (
                <div className="modal-abono-overlay">
                    <div className="modal-abono-card">
                        <div className="modal-abono-cabecera">
                            <h4>💸 Realizar Pago / Abono</h4>
                            <button className="btn-cerrar-modal" onClick={cerrarModalAbono}>
                                <FaTimes />
                            </button>
                        </div>
                        <p className="modal-abono-desc">
                            Deuda: <strong>{deudaSeleccionadaParaAbono.nombre}</strong>
                        </p>
                        <div className="modal-abono-info-saldo">
                            <span>Saldo pendiente:</span>
                            <strong>
                                {formatearCOP(deudaSeleccionadaParaAbono.monto - (deudaSeleccionadaParaAbono.abonado || 0))}
                            </strong>
                        </div>

                        <form onSubmit={handleConfirmarAbono} className="modal-abono-form">
                            <div className="deuda-campo-grupo">
                                <label>Monto a pagar / abonar hoy (COP):</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={montoAbonoInput}
                                    onChange={(e) => handleMontoChange(e, setMontoAbonoInput)}
                                    placeholder="0"
                                    autoFocus
                                    required
                                />
                            </div>

                            <p className="modal-abono-aviso">
                                💡 Este pago se registrará automáticamente como un <strong>Gasto (Categoría: Deudas)</strong> y se descontará de tu presupuesto disponible.
                            </p>

                            <div className="modal-abono-acciones">
                                <button type="button" className="btn-modal-cancelar" onClick={cerrarModalAbono}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-modal-confirmar">
                                    <FaMoneyBillWave /> Confirmar Pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filtros y Lista */}
            <div className="deudas-lista-seccion">
                <div className="deudas-cabecera-lista">
                    <h3>Mis Deudas y Pagos</h3>
                    <div className="deudas-filtros">
                        <button 
                            className={`deuda-filtro-btn ${filtro === 'todas' ? 'activo' : ''}`}
                            onClick={() => setFiltro('todas')}
                            type="button"
                        >
                            Todas ({deudas.length})
                        </button>
                        <button 
                            className={`deuda-filtro-btn ${filtro === 'pendientes' ? 'activo' : ''}`}
                            onClick={() => setFiltro('pendientes')}
                            type="button"
                        >
                            Pendientes ({deudas.filter(d => !(d.pagada || (d.abonado >= d.monto))).length})
                        </button>
                        <button 
                            className={`deuda-filtro-btn ${filtro === 'pagadas' ? 'activo' : ''}`}
                            onClick={() => setFiltro('pagadas')}
                            type="button"
                        >
                            Pagadas ({deudas.filter(d => d.pagada || (d.abonado >= d.monto)).length})
                        </button>
                    </div>
                </div>

                {deudas.length === 0 ? (
                    <div className="deudas-vacia">
                        <span className="icono-deuda-vacia">🎉</span>
                        <p className="texto-vacio-principal">No tienes deudas registradas</p>
                        <p className="texto-vacio-secundario">Puedes registrar compromisos, tarjetas o cuotas arriba.</p>
                    </div>
                ) : deudasFiltradas.length === 0 ? (
                    <div className="deudas-vacia">
                        <span className="icono-deuda-vacia">🔍</span>
                        <p className="texto-vacio-principal">No hay deudas en esta sección</p>
                    </div>
                ) : (
                    <ul className="lista-deudas">
                        {deudasFiltradas.map((deuda) => {
                            const abonado = Number(deuda.abonado) || 0;
                            const montoTotal = Number(deuda.monto) || 0;
                            const pendiente = Math.max(0, montoTotal - abonado);
                            const esPagada = deuda.pagada || (abonado >= montoTotal && montoTotal > 0);
                            const porcentaje = montoTotal > 0 ? Math.min(100, Math.round((abonado / montoTotal) * 100)) : 0;

                            return (
                                <li key={deuda.id} className={`deuda-item-card ${esPagada ? 'pagada' : 'pendiente'}`}>
                                    <div className="deuda-cabecera-item">
                                        <div className="deuda-titulo-bloque">
                                            <span className={`deuda-nombre ${esPagada ? 'tachado' : ''}`}>
                                                {deuda.nombre}
                                            </span>
                                            <div className="deuda-badges-fila">
                                                {deuda.fechaLimite && (
                                                    <span className="deuda-fecha">
                                                        <FaCalendarAlt /> Vence: {deuda.fechaLimite}
                                                    </span>
                                                )}
                                                <span className={`deuda-estado-tag ${esPagada ? 'tag-pagado' : 'tag-pendiente'}`}>
                                                    {esPagada ? '100% SALDADA' : `${porcentaje}% PAGADO`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="deuda-montos-bloque">
                                            <div className="deuda-saldo-info">
                                                <span className="deuda-saldo-label">Pendiente:</span>
                                                <strong className={`deuda-monto ${esPagada ? 'monto-pagado' : ''}`}>
                                                    {formatearCOP(pendiente)}
                                                </strong>
                                            </div>
                                            <button 
                                                className="btn-eliminar-deuda"
                                                onClick={() => onEliminarDeuda(deuda.id)}
                                                title="Eliminar deuda"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Barra de progreso de la deuda */}
                                    <div className="deuda-barra-contenedor">
                                        <div className="deuda-barra-fondo">
                                            <div 
                                                className={`deuda-barra-progreso ${esPagada ? 'completa' : ''}`}
                                                style={{ width: `${porcentaje}%` }}
                                            />
                                        </div>
                                        <div className="deuda-barra-detalle">
                                            <span>Abonado: {formatearCOP(abonado)}</span>
                                            <span>Total: {formatearCOP(montoTotal)}</span>
                                        </div>
                                    </div>

                                    {/* Acciones de la deuda */}
                                    {!esPagada && (
                                        <div className="deuda-acciones-fila">
                                            <button 
                                                className="btn-abonar-deuda"
                                                onClick={() => abrirModalAbono(deuda)}
                                            >
                                                <FaHandHoldingUsd /> Realizar Abono / Pago
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default SeccionDeudas;

