import { getClienteById } from '@/actions/clientes';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Building2, MapPin, Phone, FileText, Settings, CreditCard, ChevronRight, BadgeAlert, CheckCircle2, Package, ShoppingCart } from 'lucide-react';

export const metadata = {
    title: 'Perfil de Cliente - Presupuestos IC',
};

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
    const cliente = await getClienteById(params.id);

    if (!cliente) {
        notFound();
    }

    // Calcular estadísticas globales
    const totalPresupuestos = cliente.presupuestos.length;
    
    // Deuda acumulada (monto pendiente de todos los presupuestos activos)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deudaTotal = cliente.presupuestos.reduce((acc: number, p: any) => {
        if (p.estadoPago !== 'PAGADO' && p.estado !== 'RECHAZADO') {
            return acc + (p.precioFinal - p.montoPagado);
        }
        return acc;
    }, 0);

    // Órdenes activas (En producción o Pendientes)
    const ordenesActivas = cliente.presupuestos.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.estado !== 'RECHAZADO' && p.estadoProduccion !== 'ENTREGADO'
    ).length;

    // Aggregación de historial de materiales comprados
    const materialesComprados = new Map<string, {
        nombre: string;
        cantidadVendida: number;
        ultimaCompra: Date;
        unidad: string;
    }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cliente.presupuestos.forEach((p: any) => {
        if (p.estado !== 'RECHAZADO') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            p.insumos?.forEach((ip: any) => {
                if (ip.insumo) {
                    const id = ip.insumo.id;
                    const existing = materialesComprados.get(id);
                    if (existing) {
                        existing.cantidadVendida += ip.cantidad;
                        if (new Date(p.fecha) > existing.ultimaCompra) {
                            existing.ultimaCompra = new Date(p.fecha);
                        }
                    } else {
                        materialesComprados.set(id, {
                            nombre: ip.insumo.nombre,
                            cantidadVendida: ip.cantidad,
                            ultimaCompra: new Date(p.fecha),
                            unidad: ip.insumo.unidadMedida || 'UNIDADES'
                        });
                    }
                }
            });
        }
    });

    const historialMateriales = Array.from(materialesComprados.values())
        .sort((a, b) => b.cantidadVendida - a.cantidadVendida);

    // Preparar URL del Mapa si hay dirección
    const direccionCompleta = [cliente.direccion, cliente.ciudad, cliente.provincia, 'Uruguay'].filter(Boolean).join(', ');
    const mapUrl = direccionCompleta ? `https://nominatim.openstreetmap.org/ui/map.html?q=${encodeURIComponent(direccionCompleta)}` : null;

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col xl:flex-row gap-8">
            
            {/* COLUMNA IZQUIERDA: PERFIL DEL CLIENTE */}
            <div className="w-full xl:w-96 shrink-0 flex flex-col gap-6">
                
                <div className="flex items-center gap-3">
                    <Link href="/clientes" className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ficha de Cliente</h1>
                </div>

                {/* TARJETA PRINCIPAL DEL CLIENTE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Link href={`/clientes/editar/${cliente.id}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>
                    
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-800">{cliente.nombre}</h2>
                    {cliente.empresa && (
                        <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                            <Building2 className="w-4 h-4" /> {cliente.empresa}
                        </p>
                    )}

                    <div className="mt-8 space-y-4">
                        {cliente.documento && (
                            <div className="flex items-start gap-3 text-slate-600">
                                <FileText className="w-5 h-5 mt-0.5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Documento / CUIT</p>
                                    <p className="font-medium">{cliente.documento}</p>
                                </div>
                            </div>
                        )}
                        
                        {(cliente.telefono || cliente.email) && (
                            <div className="flex items-start gap-3 text-slate-600">
                                <Phone className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Contacto</p>
                                    {cliente.telefono && <p className="font-medium">{cliente.telefono}</p>}
                                    {cliente.email && <p className="text-sm text-slate-500">{cliente.email}</p>}
                                </div>
                            </div>
                        )}

                        {(cliente.direccion || cliente.ciudad) && (
                            <div className="flex items-start gap-3 text-slate-600">
                                <MapPin className="w-5 h-5 mt-0.5 text-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Dirección</p>
                                    <p className="font-medium">{cliente.direccion || 'Sin calle registrada'}</p>
                                    <p className="text-sm text-slate-500">
                                        {[cliente.ciudad, cliente.provincia].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* NOTAS INTERNAS */}
                {cliente.notas && (
                    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-amber-900">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4" />
                            Notas del Cliente
                        </h3>
                        <p className="text-sm whitespace-pre-wrap">{cliente.notas}</p>
                    </div>
                )}

                {/* MAPA INCRUSTADO */}
                {mapUrl && (cliente.direccion || cliente.ciudad) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <h3 className="font-bold text-slate-700 text-sm">Ubicación Registrada</h3>
                        </div>
                        <div className="w-full h-64 bg-slate-100">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight={0} 
                                marginWidth={0} 
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                className="grayscale-[20%] contrast-125"
                                title="Mapa del Cliente"
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>

            {/* COLUMNA DERECHA: DASHBOARD DE ÓRDENES Y DEUDA */}
            <div className="flex-1 flex flex-col gap-6">
                
                {/* WIDGETS SUPERIORES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-sm font-semibold text-slate-500 mb-1">Órdenes Totales</p>
                        <p className="text-3xl font-black text-slate-800">{totalPresupuestos}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200">
                        <p className="text-sm font-semibold text-blue-600 mb-1">Trabajos Activos</p>
                        <p className="text-3xl font-black text-blue-900">{ordenesActivas}</p>
                    </div>

                    <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-200">
                        <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5 mb-1">
                            <CreditCard className="w-4 h-4" /> Deuda Pendiente
                        </p>
                        <p className="text-3xl font-black text-red-700">${deudaTotal.toFixed(2)}</p>
                    </div>
                </div>

                {/* LISTADO DE TRABAJOS (PRESUPUESTOS) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">Historial de Trabajos</h2>
                        <Link 
                            href="/presupuestos/nuevo" 
                            className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            + Nuevo Trabajo
                        </Link>
                    </div>

                    {cliente.presupuestos.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            Ficha nueva. Aún no hay presupuestos ni trabajos cargados para este cliente.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {cliente.presupuestos.map((p: any) => {
                                const restante = p.precioFinal - p.montoPagado;
                                return (
                                    <div key={p.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                    #{p.numero}
                                                </span>
                                                <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{p.descripcion}</h3>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {p.cantidad} u. | Creado: {new Date(p.fecha).toLocaleDateString()}
                                            </p>
                                            
                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                {/* Badge Estado Admin */}
                                                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                                    p.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700' :
                                                    p.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {p.estado}
                                                </span>
                                                
                                                {/* Badge Producción */}
                                                {(p.estado === 'APROBADO' || p.estadoProduccion !== 'EN_ESPERA') && (
                                                    <span className={`text-xs px-2 py-1 rounded font-semibold flex items-center gap-1 ${
                                                        p.estadoProduccion === 'ENTREGADO' ? 'bg-slate-200 text-slate-600' : 
                                                        p.estadoProduccion === 'TERMINADO' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        📦 {p.estadoProduccion.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 shrink-0">
                                            {/* Info Deuda por Ticket */}
                                            {p.estado !== 'RECHAZADO' && (
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-500 mb-0.5">Total: <span className="font-bold text-slate-700">${p.precioFinal.toFixed(2)}</span></p>
                                                    {restante > 0 ? (
                                                        <p className="text-xs font-bold text-red-600 flex items-center justify-end gap-1">
                                                            <BadgeAlert className="w-3.5 h-3.5" /> Faltan ${restante.toFixed(2)}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <Link 
                                                href={`/presupuestos/${p.id}`}
                                                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-300 group-hover:text-blue-600 transition-colors shadow-sm"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* HISTORIAL DE MATERIALES COMPRADOS */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                        <Package className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-bold text-slate-800">Historial de Materiales</h2>
                    </div>

                    {historialMateriales.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Aún no hay registro de materiales comprados por este cliente.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Material / Insumo</th>
                                        <th className="px-6 py-4 text-right">Cantidad Comprada</th>
                                        <th className="px-6 py-4">Última Compra</th>
                                        <th className="px-6 py-4">Sugerencia (Anticipación)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {historialMateriales.map((mat, i) => {
                                        const daysSinceLast = Math.floor((new Date().getTime() - mat.ultimaCompra.getTime()) / (1000 * 60 * 60 * 24));
                                        
                                        return (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    {mat.nombre}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                                                    {mat.cantidadVendida} <span className="text-xs text-slate-400 font-normal">{mat.unidad.toLowerCase()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 w-32">
                                                    {mat.ultimaCompra.toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 w-48">
                                                    {daysSinceLast > 30 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">
                                                            <ShoppingCart className="w-3 h-3" /> Contactar pronto
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                                                            Compra reciente
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
