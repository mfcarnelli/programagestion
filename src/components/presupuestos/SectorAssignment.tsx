'use client';

import { useState } from 'react';
import { asignarSectorProduccion, actualizarEstadoProduccion } from '@/actions/presupuestos';
import { Layers, Play, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TraceabilityTimers from './TraceabilityTimers';

export default function SectorAssignment({ 
    id, 
    currentSector,
    estadoProduccion,
    tiempoPreparacion,
    tiempoImpresion,
    tiempoPausado,
    estadoTrazabilidad,
    inicioActividad,
    historial
}: { 
    id: string, 
    currentSector?: string | null,
    estadoProduccion?: string,
    tiempoPreparacion?: number,
    tiempoImpresion?: number,
    tiempoPausado?: number,
    estadoTrazabilidad?: string,
    inicioActividad?: Date | null,
    historial?: any[]
}) {
    const router = useRouter();
    const { data: session } = useSession();
    
    const [sector, setSector] = useState(currentSector || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        if (!sector) return;
        setLoading(true);
        setMessage('');
        const res = await asignarSectorProduccion(id, sector);
        if (res.success) {
            setMessage('Sector asignado correctamente.');
        } else {
            setMessage(res.error || 'Error al asignar sector');
        }
        setLoading(false);
    };

    const handleActualizarTarea = async (nuevoEstado: string) => {
        setLoading(true);
        setMessage('');
        const operario = session?.user?.name || '';
        const res = await actualizarEstadoProduccion(id, nuevoEstado, operario);
        if (res.success) {
            setMessage(`Tarea ${nuevoEstado === 'EN_PRODUCCION' ? 'iniciada' : 'finalizada'} correctamente.`);
            router.refresh();
        } else {
            setMessage(res.error || 'Error al actualizar estado');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                Sector Productivo y Trazabilidad
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <select 
                    value={sector} 
                    onChange={e => setSector(e.target.value)}
                    className="flex-1 w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={loading}
                >
                    <option value="">-- Seleccionar Sector --</option>
                    <option value="DISENO">Diseño (Retoques)</option>
                    <option value="OFFSET">Offset</option>
                    <option value="SERIGRAFIA">Serigrafía</option>
                    <option value="IMPRESION_DIGITAL">Impresión Digital</option>
                    <option value="CARTELERIA">Cartelería</option>
                    <option value="SUBLIMACION">Sublimación</option>
                    <option value="EXPEDICION">Expedición</option>
                    <option value="OTRO">Otro</option>
                </select>
                <button 
                    onClick={handleSave}
                    disabled={loading || !sector || sector === currentSector}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    {loading ? 'Guardando...' : 'Asignar Sector'}
                </button>
            </div>

            {currentSector && (
                <TraceabilityTimers 
                    id={id}
                    tiempoPreparacion={tiempoPreparacion || 0}
                    tiempoImpresion={tiempoImpresion || 0}
                    tiempoPausado={tiempoPausado || 0}
                    estadoTrazabilidad={estadoTrazabilidad || 'NO_INICIADO'}
                    inicioActividad={inicioActividad || null}
                />
            )}

            {message && <p className={`mt-4 text-sm font-medium ${message.includes('Error') ? 'text-red-600' : 'text-emerald-600'}`}>{message}</p>}
            
            {historial && historial.length > 0 && (
                <div className="mt-8 border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        Historial de Operaciones
                    </h3>
                    <div className="space-y-3">
                        {historial.map((h: any) => {
                            const prep = formatTimeLimit(h.tiempoPreparacion);
                            const imp = formatTimeLimit(h.tiempoImpresion);
                            const paus = formatTimeLimit(h.tiempoPausado);
                            const total = formatTimeLimit(h.tiempoTotal);
                            
                            return (
                                <div key={h.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="font-bold text-slate-800">{h.sector}</div>
                                        <div className="text-sm text-slate-500">Operario: {h.operario || 'Desconocido'} • {new Date(h.fechaRegistro).toLocaleDateString()} {new Date(h.fechaRegistro).toLocaleTimeString()}</div>
                                    </div>
                                    <div className="flex gap-4 text-xs font-medium text-slate-600">
                                        <div className="text-center"><div className="text-slate-400">Prep:</div><div>{prep}</div></div>
                                        <div className="text-center"><div className="text-slate-400">Imp/Prod:</div><div>{imp}</div></div>
                                        <div className="text-center"><div className="text-slate-400">Pausa:</div><div>{paus}</div></div>
                                        <div className="text-center font-bold text-slate-800 bg-slate-200 px-2 py-1 rounded"><div className="text-slate-500 text-[10px]">Total:</div><div>{total}</div></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatTimeLimit(sec: number) {
    const min = Math.floor(sec / 60);
    const m = String(min).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}
