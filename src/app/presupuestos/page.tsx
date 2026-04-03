// @ts-nocheck
import { getPresupuestos, updateEstadoPresupuesto } from '@/actions/presupuestos';
import Link from 'next/link';
import { Plus, Search, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LiberarBoton from '@/components/presupuestos/LiberarBoton';

export const metadata = {
    title: 'Órdenes - Presupuestos IC',
};

export default async function PresupuestosPage({ searchParams }: { searchParams: { sector?: string, q?: string } }) {
    let presupuestos = await getPresupuestos();
    const session = await getServerSession(authOptions);
    let rol = session?.user?.rol || 'VENDEDOR';
    
    // ==========================================
    // MODO "ACTUAR COMO OPERARIO" (Solo ADMIN)
    // ==========================================
    const isImpersonating = rol === 'ADMIN' && searchParams?.sector;
    if (isImpersonating && searchParams.sector) {
        rol = searchParams.sector;
    }
    
    const isDiseno = rol === 'DISENO';
    const isOperario = ['OFFSET', 'SERIGRAFIA', 'IMPRESION_DIGITAL', 'CARTELERIA', 'SUBLIMACION', 'EXPEDICION'].includes(rol);
    const isVendedor = rol === 'VENDEDOR';
    const canViewFinancials = rol === 'ADMIN' || rol === 'VENDEDOR';

    // Lógica de Vendedor: Usualmente ven todo lo PENDIENTE o generado por ellos. 
    // Para simplificar, si el rol simulado es VENDEDOR, veremos todos los pendientes o aprobados.
    if (isDiseno) {
        presupuestos = presupuestos.filter((p: any) => p.estado === 'APROBADO');
    } else if (isOperario) {
        presupuestos = presupuestos.filter((p: any) => p.sectorProduccion === rol);
    } else if (isVendedor && isImpersonating) {
        // Un admin actuando como vendedor, simplemente ve cosas aprobadas/pendientes.
        // O lo dejamos ver todo. Para mantenerlo simple, ve todo como el rol Vendedor real.
    }

    const q = searchParams?.q?.toLowerCase();
    if (q) {
        presupuestos = presupuestos.filter((p: any) => 
            p.cliente?.nombre?.toLowerCase().includes(q) || 
            p.descripcion?.toLowerCase().includes(q) || 
            p.numero?.toString() === q ||
            (p.textoComprobante && p.textoComprobante.toLowerCase().includes(q))
        );
    }

    return (
        <div className="p-8">
            {isImpersonating && (
                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900">Modo de Vista Operario</h3>
                            <p className="text-sm text-blue-700">Estás viendo el sistema como si fueras un operario de <strong>{searchParams.sector}</strong>.</p>
                        </div>
                    </div>
                    <Link href="/sectores" className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                        Volver a Monitor
                    </Link>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        {isDiseno ? 'Trabajos Aprobados' : isOperario ? `Órdenes: ${rol}` : 'Órdenes Activas'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isDiseno ? 'Gestión de trabajos a diseño o taller.' : isOperario ? 'Trabajos asignados a su sector de producción.' : 'Gestión y control de órdenes de clientes.'}
                    </p>
                </div>
                {canViewFinancials && (
                    <Link
                        href="/presupuestos/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nueva Orden</span>
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
                    <form method="GET" className="relative flex-1 tour-buscador">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        {searchParams?.sector && <input type="hidden" name="sector" value={searchParams.sector} />}
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchParams?.q || ''}
                            placeholder="Buscar por cliente, número, descripción o en el comprobante..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button type="submit" className="hidden">Buscar</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="font-semibold py-3 px-4">Nº</th>
                                <th className="font-semibold py-3 px-4">Fecha</th>
                                <th className="font-semibold py-3 px-4">Cliente</th>
                                <th className="font-semibold py-3 px-4">Trabajo</th>
                                <th className="font-semibold py-3 px-4 text-center">Estado</th>
                                {canViewFinancials && (
                                    <>
                                        <th className="font-semibold py-3 px-4 text-center">Pago</th>
                                        <th className="font-semibold py-3 px-4 text-center">Entrega</th>
                                        <th className="font-semibold py-3 px-4 text-right">Total</th>
                                    </>
                                )}
                                {!canViewFinancials && <th className="font-semibold py-3 px-4 text-center">Cantidades</th>}
                                {isDiseno && <th className="font-semibold py-3 px-4 text-center">Sector Asignado</th>}
                                <th className="font-semibold py-3 px-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {presupuestos.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <FileText className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-lg font-medium text-slate-700">No hay presupuestos</p>
                                            <p className="text-sm">Crea tu primer presupuesto para empezar.</p>
                                            <Link href="/presupuestos/nuevo" className="mt-4 text-blue-600 font-medium hover:underline">
                                                Crear Presupuesto
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                presupuestos.map((presupuesto) => (
                                    <tr key={presupuesto.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-slate-700">#{presupuesto.numero}</td>
                                        <td className="py-3 px-4 text-slate-600 text-sm">
                                            {new Date(presupuesto.fecha).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-800">{presupuesto.cliente.nombre}</td>
                                        <td className="py-3 px-4 text-slate-600">
                                            <div className="line-clamp-1">{presupuesto.descripcion}</div>
                                            <span className="text-xs text-slate-400 font-medium mt-0.5 inline-block">{presupuesto.tipoTrabajo}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {presupuesto.estado === 'PENDIENTE' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                    <Clock className="w-3 h-3" /> Pendiente
                                                </span>
                                            )}
                                            {presupuesto.estado === 'APROBADO' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                    <CheckCircle className="w-3 h-3" /> Aprobado
                                                </span>
                                            )}
                                            {presupuesto.estado === 'RECHAZADO' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                    <XCircle className="w-3 h-3" /> Rechazado
                                                </span>
                                            )}
                                        </td>
                                        {canViewFinancials && (
                                            <>
                                                <td className="py-3 px-4 text-center">
                                                    {(() => {
                                                        const isTotalmentePagado = presupuesto.montoPagado >= (presupuesto.precioFinal - 0.05);
                                                        const pagoMostrado = isTotalmentePagado ? 'PAGADO' : presupuesto.estadoPago;
                                                        
                                                        if (pagoMostrado === 'PENDIENTE') return <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">IMPAGO</span>;
                                                        if (pagoMostrado === 'PARCIAL') return <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">SEÑA</span>;
                                                        if (pagoMostrado === 'PAGADO') return <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">PAGADO</span>;
                                                    })()}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {presupuesto.estadoProduccion === 'ENTREGADO' ? (
                                                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-800">LIBERADA</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-400">PENDIENTE</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-800">
                                                    ${presupuesto.precioFinal.toFixed(2)}
                                                </td>
                                            </>
                                        )}
                                        {!canViewFinancials && (
                                            <td className="py-3 px-4 text-center font-bold text-slate-600">
                                                {presupuesto.cantidad} u.
                                            </td>
                                        )}
                                        {isDiseno && (
                                            <td className="py-3 px-4 text-center">
                                                {presupuesto.sectorProduccion ? (
                                                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                                        {presupuesto.sectorProduccion}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-sm">Sin asignar</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="py-3 px-4 text-center space-x-2 whitespace-nowrap">
                                            {canViewFinancials && presupuesto.estadoProduccion !== 'ENTREGADO' && (
                                                <LiberarBoton id={presupuesto.id} />
                                            )}
                                            <Link href={`/presupuestos/${presupuesto.id}${searchParams?.sector ? `?sector=${searchParams.sector}` : ''}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-2 py-1">Ver</Link>
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
