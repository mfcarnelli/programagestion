// @ts-nocheck
import { getInsumos } from '@/actions/insumos';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';

export const metadata = {
    title: 'Insumos - Presupuestos IC',
};

export default async function InsumosPage() {
    const insumos = await getInsumos();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Insumos y Materiales</h1>
                    <p className="text-slate-500 mt-1">Gesti&oacute;n de precios, stock y medidas de todos los materiales.</p>
                </div>
                <Link
                    href="/insumos/nuevo"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Insumo</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar insumo por nombre, tipo o proveedor..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filtrar</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="font-semibold py-3 px-4">Nombre</th>
                                <th className="font-semibold py-3 px-4">Categoría</th>
                                <th className="font-semibold py-3 px-4">Tipo</th>
                                <th className="font-semibold py-3 px-4 text-right">Costo Unit.</th>
                                <th className="font-semibold py-3 px-4 text-right">Stock</th>
                                <th className="font-semibold py-3 px-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {insumos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500">
                                        No hay insumos registrados. Crea tu primer insumo para empezar.
                                    </td>
                                </tr>
                            ) : (
                                insumos.map((insumo) => (
                                    <tr key={insumo.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-slate-800">{insumo.nombre}</td>
                                        <td className="py-3 px-4 text-slate-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {insumo.categoria?.nombre || 'Sin categoría'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">{insumo.tipo}</td>
                                        <td className="py-3 px-4 text-right font-medium text-slate-800">${insumo.costoUnitario.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right text-slate-600">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${insumo.stockActual <= insumo.stockMinimo ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {insumo.stockActual} {insumo.unidadMedida}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <Link href={`/insumos/${insumo.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
