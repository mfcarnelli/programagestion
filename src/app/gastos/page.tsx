// @ts-nocheck
import { getGastos } from '@/actions/gastos';
import Link from 'next/link';
import { Plus, Search, DollarSign, PieChart, Info } from 'lucide-react';
import GastoActions from '@/components/gastos/GastoActions';

export const metadata = {
    title: 'Gastos y Consumos - Presupuestos IC',
};

export const dynamic = 'force-dynamic';

export default async function GastosPage() {
    const gastos = await getGastos();

    // Stats
    const gastosFijos = gastos.filter(g => g.categoria === 'FIJO').reduce((acc, curr) => acc + curr.monto, 0);
    const gastosVariables = gastos.filter(g => g.categoria === 'VARIABLE').reduce((acc, curr) => acc + curr.monto, 0);
    const total = gastosFijos + gastosVariables;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gastos y Consumos</h1>
                    <p className="text-slate-500 mt-1">Control mensual de costos fijos, variables y operativos.</p>
                </div>
                <Link
                    href="/gastos/nuevo"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>Registrar Gasto</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-slate-500 font-medium">Gastos Fijos del Mes</h3>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <PieChart className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">${gastosFijos.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-slate-500 font-medium">Gastos Variables del Mes</h3>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">${gastosVariables.toFixed(2)}</p>
                </div>
                <div className="bg-emerald-600 p-6 rounded-xl shadow-sm text-white">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-emerald-100 font-medium">Total Costo Operativo</h3>
                        <div className="p-2 bg-emerald-500/50 rounded-lg">
                            <Info className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">${total.toFixed(2)}</p>
                    <p className="text-sm text-emerald-100 mt-2">Prorrateo estimado por hp/producción</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar gasto por nombre..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="font-semibold py-3 px-4">Fecha</th>
                                <th className="font-semibold py-3 px-4">Concepto / Nombre</th>
                                <th className="font-semibold py-3 px-4">Categoría</th>
                                <th className="font-semibold py-3 px-4">Frecuencia</th>
                                <th className="font-semibold py-3 px-4 text-right">Monto</th>
                                <th className="font-semibold py-3 px-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {gastos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500">
                                        No hay gastos registrados este mes.
                                    </td>
                                </tr>
                            ) : (
                                gastos.map((gasto) => (
                                    <tr key={gasto.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 text-slate-600 text-sm">
                                            {new Date(gasto.fecha).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-800">{gasto.nombre}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${gasto.categoria === 'FIJO' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                                {gasto.categoria}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 text-sm">{gasto.frecuencia}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-slate-800">
                                            ${gasto.monto.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <GastoActions id={gasto.id} />
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
