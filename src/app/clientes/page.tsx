import { getClientes } from '@/actions/clientes';
import Link from 'next/link';
import { Plus, Users, LayoutGrid, Search, ChevronRight, Phone, Building2 } from 'lucide-react';

export const metadata = {
    title: 'Clientes - Presupuestos IC',
};

export default async function ClientesPage() {
    const clientes = await getClientes();

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        Cartera de Clientes
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Gestiona tus contactos, consulta su historial y mantén su información actualizada.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link 
                        href="/clientes/nuevo" 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nuevo Cliente</span>
                    </Link>
                </div>
            </div>

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, empresa o teléfono..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    {/* Más filtros si se requieren a futuro */}
                </div>
            </div>

            {/* TABLA / LISTADO */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {clientes.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Users className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-700">Aún no hay clientes registrados</h3>
                        <p className="mt-1">Empieza agregando tu primer cliente para organizar tus presupuestos.</p>
                        <Link href="/clientes/nuevo" className="mt-6 text-blue-600 hover:underline font-medium">
                            + Crear primer cliente
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Nombre y Empresa
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Registrado
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {clientes.map((cliente) => (
                                <tr key={cliente.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{cliente.nombre}</div>
                                        {cliente.empresa && (
                                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {cliente.empresa}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {cliente.telefono ? (
                                            <div className="text-sm text-slate-700 flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                {cliente.telefono}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">Sin teléfono</span>
                                        )}
                                        {cliente.email && (
                                            <div className="text-sm text-slate-500 mt-1">{cliente.email}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(cliente.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={`/clientes/${cliente.id}`} 
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            Ver Perfil <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
