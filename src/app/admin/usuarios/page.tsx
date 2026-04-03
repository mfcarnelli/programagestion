import { getUsuarios } from '@/actions/usuarios';
import { getConfiguracion } from '@/actions/configuracion';
import Link from 'next/link';
import { Plus, Users, Shield, ShieldCheck, UserCheck, UserX, Phone } from 'lucide-react';
import UsuarioActions from '@/components/usuarios/UsuarioActions';
import GlobalConfigPanel from '@/components/admin/GlobalConfigPanel';

export const metadata = {
    title: 'Usuarios y Roles - Presupuestos IC',
};

export default async function UsuariosPage() {
    const usuarios = await getUsuarios();
    const config = await getConfiguracion();

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        Usuarios y Roles
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Gestiona los accesos del equipo, perfiles y datos de contacto.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/usuarios/nuevo" 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Añadir Usuario</span>
                    </Link>
                </div>
            </div>

            <GlobalConfigPanel initialMargen={config.margenGanancia} initialImpuestos={config.impuestos} />

            {/* TABLA / LISTADO */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {usuarios.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Users className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-700">No hay usuarios</h3>
                        <p className="mt-1">Crea el primer usuario para comenzar.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {usuarios.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{user.nombre}</div>
                                        <div className="text-sm text-slate-500 mt-0.5">@{user.username}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.celular ? (
                                            <div className="text-sm text-slate-700 flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                {user.celular}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">Sin celular</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            <Shield className="w-3.5 h-3.5" />
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.activo ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <UserCheck className="w-3.5 h-3.5" />
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                                <UserX className="w-3.5 h-3.5" />
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <UsuarioActions id={user.id} />
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
