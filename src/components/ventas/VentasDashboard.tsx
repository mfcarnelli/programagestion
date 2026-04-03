'use client';

import { useState, useMemo } from 'react';
import { 
    Users, Briefcase, CheckCircle, BarChart2, DollarSign, 
    Calendar as CalendarIcon, Filter, CheckSquare, Square
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { marcarComisionPagada } from '@/actions/ventas';

type TabType = 'clientes' | 'marcha' | 'finalizadas' | 'rendimiento';

export default function VentasDashboard({ clientes, presupuestos, porcentaje, rol }: any) {
    const [activeTab, setActiveTab] = useState<TabType>('marcha');
    const [timeFilter, setTimeFilter] = useState('mensual'); // Mensual, Anual

    // 1. Trabajos en marcha: Aprobados pero no entregados
    const trabajosEnMarcha = presupuestos.filter((p: any) => 
        p.estado === 'APROBADO' && p.estadoProduccion !== 'ENTREGADO'
    );

    // 2. Ventas finalizadas (Entregados) o simplemente Aprobados históricos
    // Asumiremos finalizadas aquellas que están APROBADAS y pagadas/entregadas, o simplemente todas las aprobadas
    const ventasFinalizadas = presupuestos.filter((p: any) => p.estado === 'APROBADO');

    // 3. Render functions para las tabs
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        Mis Ventas y Comisiones
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Tu porcentaje de comisión actual es de <span className="font-bold text-slate-800">{porcentaje}%</span> s/ subtotal neto.
                    </p>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 mb-6 pb-2">
                <button 
                    onClick={() => setActiveTab('marcha')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'marcha' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Briefcase className="w-4 h-4" /> Trabajos en Marcha ({trabajosEnMarcha.length})
                </button>
                <button 
                    onClick={() => setActiveTab('finalizadas')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'finalizadas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <CheckCircle className="w-4 h-4" /> Ventas Finalizadas y Comisiones
                </button>
                <button 
                    onClick={() => setActiveTab('rendimiento')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'rendimiento' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BarChart2 className="w-4 h-4" /> Rendimiento
                </button>
                <button 
                    onClick={() => setActiveTab('clientes')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'clientes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Users className="w-4 h-4" /> Mis Clientes ({clientes.length})
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                {activeTab === 'marcha' && <TabMarcha trabajos={trabajosEnMarcha} />}
                {activeTab === 'finalizadas' && <TabFinalizadas ventas={ventasFinalizadas} porcentaje={porcentaje} rol={rol} />}
                {activeTab === 'rendimiento' && <TabRendimiento presupuestos={presupuestos} />}
                {activeTab === 'clientes' && <TabClientes clientes={clientes} />}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// SUB COMPONENTES DE PESTAÑAS
// ----------------------------------------------------------------------

function TabMarcha({ trabajos }: { trabajos: any[] }) {
    if (trabajos.length === 0) {
        return <div className="text-center text-slate-500 py-12">No hay trabajos en marcha actualmente.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nº</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Producción</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Precio Final</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {trabajos.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-bold">#{t.numero}</td>
                            <td className="px-4 py-3 text-sm">{t.cliente?.nombre}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 truncate max-w-[200px]">{t.descripcion}</td>
                            <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${t.estadoProduccion === 'EN_PRODUCCION' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                    {t.estadoProduccion.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-right">${t.precioFinal.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TabFinalizadas({ ventas, porcentaje, rol }: { ventas: any[], porcentaje: number, rol: string }) {
    const d = new Date();
    const currentMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const [fechaDesde, setFechaDesde] = useState<string>(`${currentMonthStr}-01`);
    const [fechaHasta, setFechaHasta] = useState<string>(`${currentMonthStr}-${String(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()).padStart(2, '0')}`);
    const [estadoPago, setEstadoPago] = useState<string>('TODAS');
    const [pagando, setPagando] = useState<string | null>(null);

    const ventasFiltradas = ventas.filter(v => {
        const fVenta = new Date(v.fecha).toISOString().slice(0, 10);
        let pasaFiltroFecha = true;
        if (fechaDesde && fVenta < fechaDesde) pasaFiltroFecha = false;
        if (fechaHasta && fVenta > fechaHasta) pasaFiltroFecha = false;

        let pasaFiltroPago = true;
        if (estadoPago === 'PAGADAS' && !v.comisionPagada) pasaFiltroPago = false;
        if (estadoPago === 'PENDIENTES' && v.comisionPagada) pasaFiltroPago = false;

        return pasaFiltroFecha && pasaFiltroPago;
    });

    const handleToggleComision = async (id: string, pagada: boolean) => {
        if (rol !== 'ADMIN') return; // Solo admin puede marcar pagada
        setPagando(id);
        await marcarComisionPagada(id, !pagada);
        setPagando(null);
    };

    let totalComisionesMes = 0;
    let totalCobradas = 0;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-800">Liquidación de Comisiones</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500 cursor-default" title="Filtro Desde">Desde:</span>
                        <input 
                            type="date" 
                            title="Fecha Desde"
                            value={fechaDesde} 
                            onChange={e => setFechaDesde(e.target.value)}
                            className="border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500 cursor-default" title="Filtro Hasta">Hasta:</span>
                        <input 
                            type="date" 
                            title="Fecha Hasta"
                            value={fechaHasta} 
                            onChange={e => setFechaHasta(e.target.value)}
                            className="border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select 
                            value={estadoPago}
                            onChange={e => setEstadoPago(e.target.value)}
                            title="Estado de Comisión"
                            className="border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="TODAS">Todas</option>
                            <option value="PAGADAS">Solo Pagadas</option>
                            <option value="PENDIENTES">Solo a Pagar</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Subtotal (Neto)</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Comisión ({porcentaje}%)</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Pagada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {ventasFiltradas.length === 0 && (
                            <tr><td colSpan={5} className="py-8 text-center text-slate-500">No hay ventas finalizadas en este periodo.</td></tr>
                        )}
                        {ventasFiltradas.map(v => {
                            // Subtotal = costo total * (1 + margen/100)
                            const subtotalNeto = v.costoTotal * (1 + v.margenGanancia / 100);
                            const comisionMonto = subtotalNeto * (porcentaje / 100);
                            
                            totalComisionesMes += comisionMonto;
                            if (v.comisionPagada) totalCobradas += comisionMonto;

                            return (
                                <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm">{new Date(v.fecha).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm truncate max-w-[200px]">#{v.numero} - {v.cliente?.nombre}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">${subtotalNeto.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">${comisionMonto.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={() => handleToggleComision(v.id, v.comisionPagada)}
                                            disabled={rol !== 'ADMIN' || pagando === v.id}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                v.comisionPagada 
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                                            } ${rol !== 'ADMIN' ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            {v.comisionPagada ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                            {v.comisionPagada ? 'Sí' : 'No'}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                    {ventasFiltradas.length > 0 && (
                        <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                            <tr>
                                <td colSpan={3} className="px-4 py-4 text-right">Totales del Filtro:</td>
                                <td className="px-4 py-4 text-right text-emerald-700">${totalComisionesMes.toFixed(2)}</td>
                                <td className="px-4 py-4 text-center text-xs">
                                    Pagadas: <span className="text-emerald-600">${totalCobradas.toFixed(2)}</span><br/>
                                    Pend.: <span className="text-red-500">${(totalComisionesMes - totalCobradas).toFixed(2)}</span>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

function TabRendimiento({ presupuestos }: { presupuestos: any[] }) {
    const [periodo, setPeriodo] = useState('mensual'); // mensual, semestral, anual
    const [año, setAño] = useState(new Date().getFullYear());

    // Agrupar datos según periodo
    const dataAgrupada = useMemo(() => {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const datosMeses = meses.map(m => ({ name: m, Aceptadas: 0, Canceladas: 0 }));

        presupuestos.forEach(p => {
            const d = new Date(p.fecha);
            if (d.getFullYear() === año) {
                const mesIdx = d.getMonth();
                const v = p.precioFinal; // o cantidad de operaciones, asumamos sumatoria de precio
                
                if (p.estado === 'APROBADO') datosMeses[mesIdx].Aceptadas += v;
                if (p.estado === 'RECHAZADO') datosMeses[mesIdx].Canceladas += v;
            }
        });

        if (periodo === 'mensual') return datosMeses;
        if (periodo === 'semestral') {
            return [
                { 
                    name: 'Semestre 1', 
                    Aceptadas: datosMeses.slice(0,6).reduce((acc, curr) => acc + curr.Aceptadas, 0),
                    Canceladas: datosMeses.slice(0,6).reduce((acc, curr) => acc + curr.Canceladas, 0)
                },
                { 
                    name: 'Semestre 2', 
                    Aceptadas: datosMeses.slice(6,12).reduce((acc, curr) => acc + curr.Aceptadas, 0),
                    Canceladas: datosMeses.slice(6,12).reduce((acc, curr) => acc + curr.Canceladas, 0)
                }
            ];
        }
        if (periodo === 'anual') {
            return [{
                name: `Año ${año}`,
                Aceptadas: datosMeses.reduce((acc, curr) => acc + curr.Aceptadas, 0),
                Canceladas: datosMeses.reduce((acc, curr) => acc + curr.Canceladas, 0)
            }];
        }
        return datosMeses;

    }, [presupuestos, periodo, año]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <h2 className="text-xl font-bold text-slate-800">Rendimiento Histórico en $</h2>
                <div className="flex items-center gap-3">
                    <select 
                        value={año}
                        onChange={e => setAño(parseInt(e.target.value))}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[año-2, año-1, año].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                        value={periodo}
                        onChange={e => setPeriodo(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="mensual">Mensual</option>
                        <option value="semestral">Semestral</option>
                        <option value="anual">Anual</option>
                    </select>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dataAgrupada}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `$${val}`} />
                        <Tooltip formatter={(value: any, name: any) => [`$${Number(value).toFixed(2)}`, name]} />
                        <Legend />
                        <Bar dataKey="Aceptadas" fill="#10b981" radius={[4, 4, 0, 0]} name="Ventas Aceptadas" />
                        <Bar dataKey="Canceladas" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Ventas Canceladas (Perdidas)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function TabClientes({ clientes }: { clientes: any[] }) {
    if (clientes.length === 0) {
        return <div className="text-center text-slate-500 py-12">No tienes clientes asignados.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientes.map(c => (
                <div key={c.id} className="p-5 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-slate-800">{c.nombre}</h3>
                    {c.empresa && <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1"><Briefcase className="w-3.5 h-3.5"/> {c.empresa}</p>}
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Presupuestos Generados</span>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{c._count?.presupuestos || 0}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
