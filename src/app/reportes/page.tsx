import { getPresupuestos } from '@/actions/presupuestos';
import { getGastos } from '@/actions/gastos';
import { TrendingUp, FileText, UserCircle, Activity, Clock } from 'lucide-react';

export const metadata = {
    title: 'Reportes - Presupuestos IC',
};

export default async function ReportesPage() {
    const presupuestos = await getPresupuestos();
    const gastos = await getGastos();

    const aprobados = presupuestos.filter((p: any) => p.estado === 'APROBADO');
    const ventasMes = aprobados.reduce((acc: number, curr: any) => acc + curr.precioFinal, 0);
    const costosProduccion = aprobados.reduce((acc: number, curr: any) => acc + (curr.costoMateriales + curr.costoProcesos), 0);
    const gastosOperativos = gastos.reduce((acc: number, curr: any) => acc + curr.monto, 0);
    const gananciaNeta = ventasMes - costosProduccion - gastosOperativos;

    // Lógica para Operarios
    const presupuestosOperario = presupuestos.filter((p: any) => p.operarioProduccion);
    
    const operarioStats: Record<string, {
        ordenes: any[];
        tiempoTotalMinutos: number;
        tareasCompletadas: number;
        sectores: Set<string>;
    }> = {};

    presupuestosOperario.forEach((p: any) => {
        const op = p.operarioProduccion;
        if (!operarioStats[op]) {
            operarioStats[op] = { ordenes: [], tiempoTotalMinutos: 0, tareasCompletadas: 0, sectores: new Set() };
        }
        
        operarioStats[op].ordenes.push(p);
        
        if (p.sectorProduccion) {
            operarioStats[op].sectores.add(p.sectorProduccion);
        }
        
        if (p.fechaInicioProduccion && p.fechaFinProduccion) {
            const ms = new Date(p.fechaFinProduccion).getTime() - new Date(p.fechaInicioProduccion).getTime();
            operarioStats[op].tiempoTotalMinutos += (ms / 1000 / 60);
        }
        
        if (p.estadoProduccion === 'TERMINADO' || p.estadoProduccion === 'ENTREGADO') {
            operarioStats[op].tareasCompletadas += 1;
        }
    });

    const operarios = Object.entries(operarioStats).sort((a, b) => a[0].localeCompare(b[0]));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Reportes y Analíticas</h1>
                    <p className="text-slate-500 mt-1">Análisis detallado de rentabilidad y operaciones.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center mb-8">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Resumen Operativo</h2>
                <p className="text-slate-500 mb-6">Módulo de analíticas avanzadas. Actualmente mostrando consolidado global.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                    <div className="p-4 border border-slate-100 bg-slate-50 rounded-lg">
                        <div className="text-sm font-medium text-slate-500">Ingresos Totales</div>
                        <div className="text-2xl font-bold text-emerald-600">${ventasMes.toFixed(2)}</div>
                    </div>
                    <div className="p-4 border border-slate-100 bg-slate-50 rounded-lg">
                        <div className="text-sm font-medium text-slate-500">Costos + Gastos</div>
                        <div className="text-2xl font-bold text-red-600">${(costosProduccion + gastosOperativos).toFixed(2)}</div>
                    </div>
                    <div className="p-4 border border-slate-100 bg-slate-50 rounded-lg">
                        <div className="text-sm font-medium text-slate-500">Utilidad Neta</div>
                        <div className="text-2xl font-bold text-blue-600">${gananciaNeta.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Rendimiento por Operario */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-8 h-8 text-indigo-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Trazabilidad por Operario</h2>
                        <p className="text-slate-500 mt-1">Rendimiento e historial de tareas ejecutadas en los sectores productivos.</p>
                    </div>
                </div>

                {operarios.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-100">
                        <UserCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Todavía no hay tareas registradas o trackeadas por los operarios.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {operarios.map(([nombre, stats]) => {
                            const avgTime = stats.tareasCompletadas > 0 ? (stats.tiempoTotalMinutos / stats.tareasCompletadas).toFixed(0) : 0;
                            
                            return (
                                <div key={nombre} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow">
                                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
                                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 uppercase tracking-wide">{nombre}</h3>
                                            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Operador</p>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4 bg-white">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Órdenes Asignadas</span>
                                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{stats.ordenes.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                                            <span className="text-slate-500 font-medium">Tareas Finalizadas</span>
                                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{stats.tareasCompletadas}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                                            <span className="text-slate-500 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Tiempo promedio</span>
                                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{avgTime} min</span>
                                        </div>
                                        {stats.sectores.size > 0 && (
                                            <div className="flex flex-col gap-1.5 text-sm border-t border-slate-100 pt-3">
                                                <span className="text-slate-500 font-medium">Sectores</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.from(stats.sectores).map(sector => (
                                                        <span key={sector} className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold tracking-wide">
                                                            {sector}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4 items-start">
                <TrendingUp className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Próximamente: Exportación PDF y Excel</h4>
                    <p className="text-blue-700 text-sm leading-relaxed">En la próxima iteración, este módulo incluirá herramientas para exportar la trazabilidad completa, gráficos interactivos de evolución y listado profundo de cada orden producida por el operario.</p>
                </div>
            </div>
        </div>
    );
}
