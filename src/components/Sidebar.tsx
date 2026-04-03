'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, Package, DollarSign, Calculator, BarChart3, Settings, Users, LogOut, UserCircle, Layers, Printer } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (pathname === '/login') return null;

    const rol = session?.user?.rol || '';

    // Permisos
    const canViewAll = rol === 'ADMIN';
    const isVendedor = rol === 'VENDEDOR';
    // Otras áreas como DISENO, OFFSET, SERIGRAFIA, EXPEDICION verán lo mínimo por ahora (Ej. solo Presupuestos/Trabajos)

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-tight text-blue-400">Presupuestos IC</h1>
                <p className="text-xs text-slate-400 mt-1">Gestión Productiva</p>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2">
                <Link href="/" className="tour-dashboard flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {(canViewAll || isVendedor || ['DISENO', 'OFFSET', 'SERIGRAFIA', 'EXPEDICION'].includes(rol)) && (
                    <Link href="/presupuestos" className="tour-ordenes flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <Calculator className="w-5 h-5" />
                        <span>{isVendedor || canViewAll ? 'Órdenes' : 'Trabajos'}</span>
                    </Link>
                )}

                {(canViewAll || isVendedor) && (
                    <>
                        <Link href="/clientes" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <Users className="w-5 h-5" />
                            <span>Clientes</span>
                        </Link>
                        <Link href="/ventas" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <DollarSign className="w-5 h-5" />
                            <span>Mis Ventas</span>
                        </Link>
                    </>
                )}

                {(canViewAll || isVendedor || ['EXPEDICION'].includes(rol)) && (
                    <Link href="/etiquetas" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <Printer className="w-5 h-5" />
                        <span>Imprimir Etiquetas</span>
                    </Link>
                )}

                {canViewAll && (
                    <>
                        <Link href="/sectores" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <Layers className="w-5 h-5" />
                            <span>Sectores Prod.</span>
                        </Link>
                        <Link href="/insumos" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <Package className="w-5 h-5" />
                            <span>Insumos</span>
                        </Link>
                        <Link href="/gastos" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <DollarSign className="w-5 h-5" />
                            <span>Gastos y Consumos</span>
                        </Link>
                        <Link href="/reportes" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <BarChart3 className="w-5 h-5" />
                            <span>Reportes</span>
                        </Link>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                {session?.user && (
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-400 border-b border-slate-800 mb-2">
                        <UserCircle className="w-5 h-5 text-blue-400" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{session.user.nombre}</p>
                            <p className="text-xs uppercase tracking-wider">{session.user.rol}</p>
                        </div>
                    </div>
                )}
                {canViewAll && (
                    <Link href="/admin/usuarios" className="flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors text-left">
                        <Settings className="w-5 h-5" />
                        <span>Usuarios y Roles</span>
                    </Link>
                )}
                <button 
                    onClick={() => window.dispatchEvent(new Event('start-system-tour'))}
                    className="tour-ayuda flex items-center gap-3 px-3 py-2 w-full text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-md transition-colors text-left font-medium"
                >
                    <span className="w-5 h-5 flex items-center justify-center font-bold text-lg border-2 border-current rounded-full">?</span>
                    <span>Guía Interactiva</span>
                </button>
                <button 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-3 py-2 w-full text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-md transition-colors text-left"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
