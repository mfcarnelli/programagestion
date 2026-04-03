'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registrarPagoPresupuesto, actualizarEstadoProduccion } from '@/actions/presupuestos';
import { CreditCard, Truck, Package, Factory, Loader2, DollarSign } from 'lucide-react';

interface TrackingProps {
    id: string;
    precioFinal: number;
    montoPagado: number;
    estadoPago: string;
    estadoProduccion: string;
    estado: string; // PENDIENTE, APROBADO, RECHAZADO
    canViewFinancials?: boolean;
}

export default function TrackingPanel({ 
    id, precioFinal, montoPagado, estadoPago, estadoProduccion, estado, canViewFinancials = true
}: TrackingProps) {
    const router = useRouter();
    const [loadingP, setLoadingP] = useState(false);
    const [loadingS, setLoadingS] = useState(false);
    const [nuevoPago, setNuevoPago] = useState('');

    const restante = precioFinal - montoPagado;
    
    // Si no está aprobado, no se puede producir ni pagar
    if (estado !== 'APROBADO') {
        return null;
    }

    const handleRegistrarPago = async (e: React.FormEvent) => {
        e.preventDefault();
        const monto = parseFloat(nuevoPago);
        if (isNaN(monto) || monto <= 0 || monto > restante) {
            alert('Monto inválido. Debe ser mayor a 0 y no exceder el total restante.');
            return;
        }

        if (!confirm(`¿Confirmas el registro del ingreso de $${monto}?`)) return;

        setLoadingP(true);
        const res = await registrarPagoPresupuesto(id, monto);
        if (res.success) {
            setNuevoPago('');
            router.refresh();
        } else {
            alert(res.error);
        }
        setLoadingP(false);
    };

    const handleCambiarEstado = async (nuevoEstado: string) => {
        setLoadingS(true);
        const res = await actualizarEstadoProduccion(id, nuevoEstado);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error);
        }
        setLoadingS(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Control de Producción {canViewFinancials && 'y Cobranza'}</h2>
            </div>
            
            <div className={`grid grid-cols-1 ${canViewFinancials ? 'md:grid-cols-2 divide-y md:divide-x' : ''} divide-slate-100`}>
                
                {/* Panel de Cobranza */}
                {canViewFinancials && (
                <div className="p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-600" />
                            Estado de Cuenta
                        </h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Total a Pagar:</span>
                                <span className="font-bold text-slate-800">${precioFinal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Abonado:</span>
                                <span className="font-bold text-emerald-600">${montoPagado.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span className="font-medium text-slate-700">Saldo Restante:</span>
                                <span className="font-black text-red-600 text-lg">${restante.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {estadoPago !== 'PAGADO' ? (
                        <form onSubmit={handleRegistrarPago} className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Registrar Ingreso (Seña / Cancelación)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="number"
                                        step="0.01"
                                        required
                                        value={nuevoPago}
                                        onChange={(e) => setNuevoPago(e.target.value)}
                                        placeholder={`Máximo $${restante.toFixed(2)}`}
                                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loadingP || restante <= 0}
                                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    {loadingP ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Acreditar'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-semibold flex items-center justify-center">
                            Orden cancelada en su totalidad.
                        </div>
                    )}
                </div>
                )}

                {/* Panel de Producción */}
                <div className="p-6">
                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Factory className="w-5 h-5 text-indigo-600" />
                        Circuito de Producción
                    </h3>

                    <div className="space-y-3 relative">
                        {/* Líneas conectoras visuales opcionales o simplemente stack botones */}
                        
                        <button
                            onClick={() => handleCambiarEstado('EN_ESPERA')}
                            disabled={loadingS}
                            className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-colors ${
                                estadoProduccion === 'EN_ESPERA' 
                                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${estadoProduccion === 'EN_ESPERA' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                            En Espera (Diseño / Preprensa)
                        </button>

                        <button
                            onClick={() => handleCambiarEstado('EN_PRODUCCION')}
                            disabled={loadingS}
                            className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-colors ${
                                estadoProduccion === 'EN_PRODUCCION' 
                                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Factory className={`w-4 h-4 ${estadoProduccion === 'EN_PRODUCCION' ? 'text-blue-500' : 'text-slate-400'}`} />
                            En Producción Activa
                        </button>

                        <button
                            onClick={() => handleCambiarEstado('TERMINADO')}
                            disabled={loadingS}
                            className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-colors ${
                                estadoProduccion === 'TERMINADO' 
                                    ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Package className={`w-4 h-4 ${estadoProduccion === 'TERMINADO' ? 'text-purple-500' : 'text-slate-400'}`} />
                            Trabajo Terminado (Listo)
                        </button>

                        <button
                            onClick={() => handleCambiarEstado('ENTREGADO')}
                            disabled={loadingS}
                            className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-colors ${
                                estadoProduccion === 'ENTREGADO' 
                                    ? 'bg-slate-800 border-slate-900 text-white font-bold shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Truck className={`w-4 h-4 ${estadoProduccion === 'ENTREGADO' ? 'text-slate-300' : 'text-slate-400'}`} />
                            Entregado al Cliente
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}
