import { getPresupuestoById } from '@/actions/presupuestos';
import { ArrowLeft, Printer, FileText, CheckCircle, Clock, XCircle, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AccionesPresupuesto from './AccionesPresupuesto';
import TrackingPanel from './TrackingPanel';
import SectorAssignment from '@/components/presupuestos/SectorAssignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata = {
    title: 'Detalle de Presupuesto - Presupuestos IC',
};

import ComprobanteEnvioPanel from '@/components/presupuestos/ComprobanteEnvioPanel';

export default async function PresupuestoDetailPage({ params, searchParams }: { params: { id: string }, searchParams?: { sector?: string } }) {
    const presupuesto = await getPresupuestoById(params.id);
    const session = await getServerSession(authOptions);
    let rol = session?.user?.rol || 'VENDEDOR';

    const isImpersonating = rol === 'ADMIN' && searchParams?.sector;
    if (isImpersonating && searchParams?.sector) {
        rol = searchParams.sector;
    }

    const isDiseno = rol === 'DISENO';
    const canViewFinancials = rol === 'ADMIN' || rol === 'VENDEDOR';

    if (!presupuesto) {
        notFound();
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/presupuestos${searchParams?.sector ? `?sector=${searchParams.sector}` : ''}`} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        {presupuesto.estado === 'APROBADO' ? `Orden Nº${presupuesto.numero}` : `Presupuesto #${presupuesto.numero}`}
                        {presupuesto.estado === 'PENDIENTE' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                <Clock className="w-4 h-4" /> Pendiente
                            </span>
                        )}
                        {presupuesto.estado === 'APROBADO' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                                <CheckCircle className="w-4 h-4" /> Aprobado
                            </span>
                        )}
                        {presupuesto.estado === 'RECHAZADO' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                                <XCircle className="w-4 h-4" /> Rechazado
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 mt-1">Detalles de la cotización generada.</p>
                </div>
                <div>
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
                        <Printer className="w-5 h-5" />
                        <span>Imprimir</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Info Cliente */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> Cliente
                    </h3>
                    <p className="text-lg font-bold text-slate-800">{presupuesto.cliente.nombre}</p>
                    {presupuesto.cliente.email && <p className="text-slate-600">{presupuesto.cliente.email}</p>}
                    {presupuesto.cliente.telefono && <p className="text-slate-600">{presupuesto.cliente.telefono}</p>}
                </div>

                {/* Info Trabajo */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Trabajo
                    </h3>
                    <p className="text-lg font-bold text-slate-800">{presupuesto.descripcion}</p>
                    <p className="text-slate-600">Tipo: <span className="font-semibold">{presupuesto.tipoTrabajo}</span></p>
                    <p className="text-slate-600">Cantidad: <span className="font-semibold">{presupuesto.cantidad} u.</span></p>
                </div>

                {/* Info Fecha */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Fechas
                    </h3>
                    <p className="text-slate-600">Creado: <span className="font-semibold text-slate-800">{new Date(presupuesto.fecha).toLocaleDateString()}</span></p>
                    <p className="text-slate-600">Actualizado: <span className="font-semibold text-slate-800">{new Date(presupuesto.updatedAt).toLocaleDateString()}</span></p>
                </div>
            </div>

            {/* Desglose Financiero */}
            {canViewFinancials && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-xl font-bold text-slate-800">Desglose Financiero</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4 max-w-lg">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Costos de Materiales ({presupuesto.tipoTrabajo})</span>
                                <span className="font-semibold text-slate-800">${presupuesto.costoMateriales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Costos de Producción / Procesos</span>
                                <span className="font-semibold text-slate-800">${presupuesto.costoProcesos.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg text-slate-700 font-bold border border-slate-200">
                                <span>Costo Base Total</span>
                                <span>${presupuesto.costoTotal.toFixed(2)}</span>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-200">
                                <div className="flex justify-between items-center text-emerald-600 mb-2">
                                    <span>Margen de Ganancia Aplicado ({presupuesto.margenGanancia}%)</span>
                                    <span className="font-semibold">+ ${(presupuesto.costoTotal * (presupuesto.margenGanancia / 100)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 mb-4">
                                    <span>Impuestos / IVA Aplicado ({presupuesto.impuestos}%)</span>
                                    <span>+ $ {presupuesto.impuestos > 0 ? (presupuesto.precioFinal - (presupuesto.costoTotal + (presupuesto.costoTotal * (presupuesto.margenGanancia / 100)))).toFixed(2) : '0.00'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-800 p-8 text-white flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <p className="text-slate-400 font-medium mb-1">PRECIO TOTAL DE VENTA</p>
                            <p className="text-5xl font-black text-blue-400">${presupuesto.precioFinal.toFixed(2)}</p>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                            <p className="text-slate-400 font-medium mb-1">Precio Unitario Promedio</p>
                            <p className="text-2xl font-bold text-white">${(presupuesto.precioFinal / presupuesto.cantidad).toFixed(2)}</p>
                            <p className="text-sm text-slate-500 mt-1">Para {presupuesto.cantidad} unidades</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Asignación de Sector para Diseño / Admin / Operarios */}
            {rol !== 'VENDEDOR' && presupuesto.estado === 'APROBADO' && (
                <SectorAssignment 
                    id={presupuesto.id} 
                    currentSector={presupuesto.sectorProduccion} 
                    estadoProduccion={presupuesto.estadoProduccion}
                    tiempoPreparacion={(presupuesto as any).tiempoPreparacion}
                    tiempoImpresion={(presupuesto as any).tiempoImpresion}
                    tiempoPausado={(presupuesto as any).tiempoPausado}
                    estadoTrazabilidad={(presupuesto as any).estadoTrazabilidad}
                    inicioActividad={(presupuesto as any).inicioActividad}
                    historial={(presupuesto as any).registrosTrazabilidad || []}
                />
            )}
            
            {presupuesto.observaciones && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-yellow-800 mb-8">
                    <h3 className="font-bold mb-2">Observaciones:</h3>
                    <p className="whitespace-pre-wrap">{presupuesto.observaciones}</p>
                </div>
            )}

            {presupuesto.archivoReferencia && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-blue-900 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold flex items-center gap-2 mb-1">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Archivo de Referencia de Diseño
                            </h3>
                            <p className="text-sm text-blue-700">Este archivo fue adjuntado al aprobar el presupuesto.</p>
                        </div>
                        {canViewFinancials && (
                            <a 
                                href={presupuesto.archivoReferencia} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Ver Archivo
                            </a>
                        )}
                    </div>
                    
                    {!canViewFinancials && (
                        <div className="mt-6 p-4 bg-white border border-blue-100 rounded-lg inline-block w-full text-center">
                            <a href={presupuesto.archivoReferencia} target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-[1.02]">
                                <img 
                                    src={presupuesto.archivoReferencia} 
                                    alt="Referencia de diseño" 
                                    className="max-h-[10cm] w-auto object-contain mx-auto rounded shadow-sm border border-slate-100" 
                                />
                            </a>
                        </div>
                    )}
                </div>
            )}

            <ComprobanteEnvioPanel 
                id={presupuesto.id}
                estadoProduccion={presupuesto.estadoProduccion}
                sectorProduccion={presupuesto.sectorProduccion}
                comprobanteEnvio={(presupuesto as any).comprobanteEnvio}
                textoComprobante={(presupuesto as any).textoComprobante}
                isExpedicionOrAdmin={rol === 'ADMIN' || rol === 'EXPEDICION'}
            />

            <TrackingPanel 
                id={presupuesto.id}
                precioFinal={presupuesto.precioFinal}
                montoPagado={presupuesto.montoPagado}
                estadoPago={presupuesto.estadoPago}
                estadoProduccion={presupuesto.estadoProduccion}
                estado={presupuesto.estado}
                canViewFinancials={canViewFinancials}
            />

            <AccionesPresupuesto id={presupuesto.id} estadoInicial={presupuesto.estado} />
        </div>
    );
}
