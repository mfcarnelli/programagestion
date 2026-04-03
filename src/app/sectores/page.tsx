import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPresupuestos } from '@/actions/presupuestos';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

const SECTORES = [
    { id: 'VENDEDOR', name: 'Ventas' },
    { id: 'DISENO', name: 'Diseño' },
    { id: 'OFFSET', name: 'Offset' },
    { id: 'SERIGRAFIA', name: 'Serigrafía' },
    { id: 'EXPEDICION', name: 'Expedición' }
];

const ESTADOS_PROD_COLORS: Record<string, string> = {
    'EN_ESPERA': 'bg-amber-100 text-amber-800',
    'EN_PRODUCCION': 'bg-blue-100 text-blue-800',
    'TERMINADO': 'bg-purple-100 text-purple-800',
    'ENTREGADO': 'bg-emerald-100 text-emerald-800'
};

const ESTADOS_PROD_LABELS: Record<string, string> = {
    'EN_ESPERA': 'En Espera',
    'EN_PRODUCCION': 'En Producción',
    'TERMINADO': 'Terminado',
    'ENTREGADO': 'Entregado'
};

export default async function SectoresDashboardPage() {
    const session = await getServerSession(authOptions);
    const rol = session?.user?.rol;

    if (rol !== 'ADMIN') {
        redirect('/');
    }

    const todos = await getPresupuestos();

    // Agrupar por sector
    const trabajosPorSector: Record<string, any[]> = {};
    SECTORES.forEach(s => trabajosPorSector[s.id] = []);
    
    todos.forEach((p: any) => {
        // VENTAS: Ve todas las órdenes activas del sistema
        if (p.estado !== 'RECHAZADO' && p.estadoProduccion !== 'ENTREGADO') {
            trabajosPorSector['VENDEDOR'].push(p);
        }

        // DISEÑO: Solo los aprobados sin sector asignado
        if (p.estado === 'APROBADO' && !p.sectorProduccion) {
            trabajosPorSector['DISENO'].push(p);
        } 
        // SECTORES DE PRODUCCIÓN: Aprobados y asignados a su sector
        else if (p.estado === 'APROBADO' && p.sectorProduccion) {
            if (trabajosPorSector[p.sectorProduccion]) {
                trabajosPorSector[p.sectorProduccion].push(p);
            }
        }
    });

    return (
        <div className="p-8 h-full flex flex-col items-stretch">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Monitor de Sectores</h1>
                <p className="text-slate-500 mt-1">Supervisión en tiempo real de los trabajos asignados y acceso como operario.</p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar flex-1 items-start">
                {SECTORES.map(sector => {
                    const trabajos = trabajosPorSector[sector.id] || [];
                    
                    return (
                        <div key={sector.id} className="bg-slate-100 rounded-xl min-w-[320px] max-w-[320px] flex shrink-0 flex-col overflow-hidden border border-slate-200 shadow-sm max-h-[75vh]">
                            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-2 shrink-0">
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{sector.name}</h2>
                                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                        {trabajos.length}
                                    </span>
                                </div>
                                <Link 
                                    href={`/presupuestos?sector=${sector.id}`}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded flex justify-center items-center gap-1.5 transition-colors shadow-sm"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    Entrar como {sector.name}
                                </Link>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                                {trabajos.length === 0 ? (
                                    <div className="text-center text-slate-400 text-sm py-4">No hay trabajos activos</div>
                                ) : (
                                    trabajos.map((t: any) => (
                                        <Link href={`/presupuestos/${t.id}?sector=${sector.id}`} key={t.id} className="block group">
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${(t.estado === 'PENDIENTE') ? 'bg-yellow-100 text-yellow-800' : (ESTADOS_PROD_COLORS[t.estadoProduccion] || 'bg-slate-100 text-slate-600')}`}>
                                                        {t.estado === 'PENDIENTE' ? 'Pendiente' : (ESTADOS_PROD_LABELS[t.estadoProduccion] || t.estadoProduccion || 'Aprobado')}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {new Date(t.fecha).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">#{t.numero} - {t.cliente.nombre}</h3>
                                                <p className="text-xs text-slate-500 line-clamp-2">{t.descripcion}</p>
                                                {t.cliente?.vendedor?.nombre && (
                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                                                        Vend: <span className="text-slate-600">{t.cliente.vendedor.nombre}</span>
                                                    </p>
                                                )}
                                                {t.operarioProduccion && (
                                                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                                                        Operario: <span className="text-slate-600">{t.operarioProduccion}</span>
                                                    </p>
                                                )}
                                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-slate-600">{t.cantidad} u.</span>
                                                    <span className="text-xs font-medium text-slate-400">Ver det. &rarr;</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
