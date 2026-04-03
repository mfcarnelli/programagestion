'use client';

import { useState } from 'react';
import { updateConfiguracion } from '@/actions/configuracion';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function GlobalConfigPanel({ initialMargen, initialImpuestos }: { initialMargen: number, initialImpuestos: number }) {
    const [margen, setMargen] = useState(initialMargen);
    const [impuestos, setImpuestos] = useState(initialImpuestos);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        const res = await updateConfiguracion(margen, impuestos);
        if (res.success) {
            setMessage('Configuración guardada exitosamente.');
        } else {
            setMessage('Error al guardar configuración.');
        }
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 mt-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-500" />
                Configuración Global de Rentabilidad
            </h2>
            <p className="text-slate-500 text-sm mb-6">
                Estos valores se aplicarán automáticamente a todos los presupuestos generados, bloqueando su edición para el equipo de ventas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Margen de Ganancia Base (%)</label>
                    <input 
                        type="number" 
                        step="0.1" 
                        value={margen} 
                        onChange={e => setMargen(Number(e.target.value))} 
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 font-bold text-emerald-700 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Impuestos / IVA Aplicado (%)</label>
                    <input 
                        type="number" 
                        step="0.1" 
                        value={impuestos} 
                        onChange={e => setImpuestos(Number(e.target.value))} 
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Configuración
                </button>
                {message && <span className="text-emerald-600 font-medium text-sm">{message}</span>}
            </div>
        </div>
    );
}
