'use client';

import { useState } from 'react';
import { createGasto } from '@/actions/gastos';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NuevoGastoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const result = await createGasto(data);

        if (result.success) {
            router.refresh();
            router.push('/gastos');
        } else {
            alert(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/gastos" className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Registrar Gasto</h1>
                    <p className="text-slate-500 mt-1">Ingresa un nuevo costo fijo o variable.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Concepto / Nombre del Gasto <span className="text-red-500">*</span></label>
                            <input required name="nombre" type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Ej: Sueldos, Alquiler, Luz, Internet..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Monto <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input required name="monto" type="number" step="0.01" min="0" className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Fecha del Gasto</label>
                                <input name="fecha" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 flex flex-col">
                                <label className="text-sm font-medium text-slate-700">Categoría <span className="text-red-500">*</span></label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                                        <input type="radio" name="categoria" value="FIJO" defaultChecked className="text-emerald-600 focus:ring-emerald-500" />
                                        <span className="font-medium text-slate-700">Costo Fijo</span>
                                    </label>
                                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                                        <input type="radio" name="categoria" value="VARIABLE" className="text-orange-600 focus:ring-orange-500" />
                                        <span className="font-medium text-slate-700">Variable</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Frecuencia</label>
                                <select name="frecuencia" className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                    <option value="MENSUAL">Mensual</option>
                                    <option value="UNICO">Pago Único</option>
                                    <option value="ANUAL">Anual</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Observaciones</label>
                            <textarea name="observaciones" rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Detalles adicionales sobre este gasto..."></textarea>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
                        <Link href="/gastos" className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            <span>{loading ? 'Guardando...' : 'Guardar Gasto'}</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
