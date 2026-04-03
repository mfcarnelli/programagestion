'use client';

import { useState } from 'react';
import { createInsumo } from '@/actions/insumos';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NuevoInsumoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tipo, setTipo] = useState('PAPEL');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        data.tipo = tipo;

        // TODO: Asociar a una categoría real, esto es un placeholder.
        // data.categoriaId = "ID_CATEGORIA"; 

        const result = await createInsumo(data);

        if (result.success) {
            router.push('/insumos');
        } else {
            alert(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/insumos" className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Nuevo Insumo</h1>
                    <p className="text-slate-500 mt-1">Registra un nuevo material para tus presupuestos.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex gap-4">
                    <button
                        onClick={() => setTipo('PAPEL')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${tipo === 'PAPEL' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
                    >
                        Papel / Sustrato
                    </button>
                    <button
                        onClick={() => setTipo('TEXTIL')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${tipo === 'TEXTIL' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
                    >
                        Prenda Textil
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipo('OTRO')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${tipo === 'OTRO' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
                    >
                        Otro (Tinta, etc.)
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipo('CARGO_FIJO')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${tipo === 'CARGO_FIJO' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
                    >
                        Cargo Fijo (Millar, Puesta...)
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nombre del Insumo / Producto <span className="text-red-500">*</span></label>
                            <input required name="nombre" type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Papel Ilustración 300g..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Proveedor</label>
                            <input name="proveedor" type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nombre completo del proveedor" />
                        </div>
                    </div>

                    {tipo === 'PAPEL' && (
                        <div className="bg-blue-50 p-6 rounded-lg space-y-4 border border-blue-100">
                            <h3 className="font-semibold text-blue-800">Características de Papelería</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Gramaje</label>
                                    <input name="gramaje" type="number" step="0.01" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Ej: 300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Ancho (cm)</label>
                                    <input name="medidaAncho" type="number" step="0.01" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Ej: 70" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Largo (cm)</label>
                                    <input name="medidaLargo" type="number" step="0.01" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Ej: 100" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Hojas por Paq.</label>
                                    <input name="cantidadPaquete" type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Ej: 100" />
                                </div>
                            </div>
                        </div>
                    )}

                    {tipo === 'TEXTIL' && (
                        <div className="bg-purple-50 p-6 rounded-lg space-y-4 border border-purple-100">
                            <h3 className="font-semibold text-purple-800">Variantes Textiles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Talles Disponibles</label>
                                    <input name="talles" type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Ej: S, M, L, XL, XXL" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Colores</label>
                                    <input name="colores" type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Ej: Blanco, Negro, Gris Melange" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Costo Unitario <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <input required name="costoUnitario" type="number" step="0.01" min="0" className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 font-medium" placeholder="0.00" />
                            </div>
                            <p className="text-xs text-slate-500">El costo en tu moneda local (peso, d&oacute;lar, etc.)</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Unidad de Medida</label>
                            <select name="unidadMedida" className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white">
                                <option value="UNIDAD">Unidad</option>
                                <option value="HOJA">Hoja / Pliego</option>
                                <option value="PAQUETE">Paquete</option>
                                <option value="LITRO">Litro</option>
                                <option value="METRO">Metro / Rollo</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Stock Actual</label>
                            <input name="stockActual" type="number" step="0.01" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="0" />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
                        <Link href="/insumos" className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            <span>{loading ? 'Guardando...' : 'Guardar Insumo'}</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
