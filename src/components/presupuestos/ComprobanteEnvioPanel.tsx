'use client';

import { useState } from 'react';
import { subirComprobanteEnvio } from '@/actions/presupuestos';
import { Upload, FileText, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ComprobanteEnvioPanel({ 
    id, 
    estadoProduccion, 
    sectorProduccion, 
    comprobanteEnvio, 
    textoComprobante,
    isExpedicionOrAdmin 
}: { 
    id: string, 
    estadoProduccion: string, 
    sectorProduccion?: string | null,
    comprobanteEnvio?: string | null,
    textoComprobante?: string | null,
    isExpedicionOrAdmin: boolean
}) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Solo se muestra si fue completado o si está en el sector EXPEDICION, o si ya tiene comprobante
    if (sectorProduccion !== 'EXPEDICION' && estadoProduccion !== 'ENTREGADO' && !comprobanteEnvio) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        setError('');
        setSuccess(false);

        const formData = new FormData();
        formData.append('file', file);

        const res = await subirComprobanteEnvio(id, formData);
        
        if (res.success) {
            setSuccess(true);
            setFile(null);
            router.refresh();
        } else {
            setError(res.error || 'Error al procesar el comprobante mediante OCR.');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Comprobante de Envío (Expedición)
            </h2>
            
            {(comprobanteEnvio && !success) ? (
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center h-full flex flex-col justify-center">
                            <a href={comprobanteEnvio} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-md border border-slate-200">
                                <img src={comprobanteEnvio} alt="Comprobante de Envío" className="w-full h-auto object-cover max-h-48 bg-white" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-medium flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg"><ImageIcon className="w-4 h-4"/> Ver ticket</span>
                                </div>
                            </a>
                            {isExpedicionOrAdmin && (
                                <button onClick={() => { setSuccess(true); }} className="mt-3 text-sm text-indigo-600 font-medium hover:underline">Reemplazar comprobante</button>
                            )}
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <h3 className="font-semibold text-slate-700 mb-2 border-b border-slate-100 pb-2 flex justify-between">
                            <span>Texto Escaneado (OCR)</span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-full">Indexado para Búsqueda</span>
                        </h3>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 font-mono text-sm text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                            {textoComprobante || <em className="text-slate-400">No se pudo extraer texto claro.</em>}
                        </div>
                    </div>
                </div>
            ) : (
                isExpedicionOrAdmin ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="border-2 border-slate-200 border-dashed rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <Upload className="w-10 h-10 text-slate-400" />
                                <div>
                                    <label htmlFor="comprobante-upload" className="cursor-pointer font-semibold text-blue-600 hover:text-blue-800">
                                        Selecciona una foto del ticket/remito
                                    </label>
                                    <span className="text-slate-500"> o arrástrala aquí</span>
                                    <input 
                                        id="comprobante-upload" 
                                        type="file" 
                                        accept="image/jpeg, image/png, image/jpg" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Formatos: JPG, PNG. El sistema usará OCR autónomo sobre Node para "pasar en limpio" el texto y permitir búsquedas rápidas de guías.</p>
                            </div>
                        </div>

                        {file && (
                            <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                                <span className="text-sm font-medium text-indigo-800 truncate">{file.name}</span>
                                <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {loading ? 'Escaneando OCR...' : 'Subir y Analizar'}
                                </button>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">{error}</p>}
                        {success && !file && <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center gap-2 font-medium"><CheckCircle className="w-4 h-4"/> ¡Listo para subir un nuevo archivo si lo deseas!</p>}
                    </form>
                ) : (
                    <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg italic text-center border border-slate-100">No hay comprobante cargado y no tienes permisos para subirlo.</div>
                )
            )}
        </div>
    );
}
