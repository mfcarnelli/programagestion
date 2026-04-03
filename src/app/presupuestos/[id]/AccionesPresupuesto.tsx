'use client';

import { useState } from 'react';
import { updateEstadoPresupuesto, aprobarPresupuestoConArchivo } from '@/actions/presupuestos';
import { CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';

export default function AccionesPresupuesto({ id, estadoInicial }: { id: string, estadoInicial: string }) {
    const [estado, setEstado] = useState(estadoInicial);
    const [showAprobarModal, setShowAprobarModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRechazar = async () => {
        if (!confirm('¿Estás seguro de marcar este presupuesto como RECHAZADO?')) return;
        setLoading(true);
        const res = await updateEstadoPresupuesto(id, 'RECHAZADO');
        if (res.success) setEstado('RECHAZADO');
        setLoading(false);
    };

    const handleAprobarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        }

        const res = await aprobarPresupuestoConArchivo(id, formData);
        
        if (res.success) {
            setEstado('APROBADO');
            setShowAprobarModal(false);
        } else {
            setError(res.error || 'Error al aprobar presupuesto.');
        }
        setLoading(false);
    };

    if (estado !== 'PENDIENTE') return null;

    return (
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200">
            <button 
                onClick={() => setShowAprobarModal(true)}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
                <CheckCircle className="w-5 h-5" />
                <span>Aprobar Presupuesto</span>
            </button>

            <button 
                onClick={handleRechazar}
                disabled={loading}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors border border-red-200 disabled:opacity-50"
            >
                <XCircle className="w-5 h-5" />
                <span>Rechazar</span>
            </button>

            {/* Modal de Aprobación */}
            {showAprobarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">Aprobar Presupuesto</h2>
                            <p className="text-slate-500 mt-1">Sube un archivo de referencia para el área de diseño.</p>
                        </div>
                        
                        <form onSubmit={handleAprobarSubmit} className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Archivo Adjunto (Opcional)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                        <div className="flex text-sm text-slate-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Seleccionar archivo</span>
                                                <input 
                                                    id="file-upload" 
                                                    name="file-upload" 
                                                    type="file" 
                                                    accept=".jpg,.jpeg,.png,.pdf,.eps"
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                    className="sr-only" 
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            formatos aceptados: JPG, PNG, PDF, EPS
                                        </p>
                                    </div>
                                </div>
                                {file && (
                                    <div className="bg-blue-50 px-4 py-3 rounded-lg flex items-center justify-between border border-blue-100">
                                        <span className="text-sm font-medium text-blue-800 truncate">{file.name}</span>
                                        <button type="button" onClick={() => setFile(null)} className="text-blue-500 hover:text-blue-700">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAprobarModal(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Confirmar Aprobación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
