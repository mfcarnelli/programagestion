// @ts-nocheck
import { getPresupuestos } from '@/actions/presupuestos';
import { getGastos } from '@/actions/gastos';
import { getUsuarios } from '@/actions/usuarios';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Calculator, Layers, Package, Gift } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Dashboard - Presupuestos IC',
};

import ExpedicionAlertItem from '@/components/presupuestos/ExpedicionAlertItem';

export default async function DashboardPage() {
  const presupuestos = await getPresupuestos();
  const gastos = await getGastos();
  const usuarios = await getUsuarios();

  const today = new Date();
  const activeUsers = usuarios.filter((u: any) => u.activo && u.fechaNacimiento);
  const session = await getServerSession(authOptions);
  const rol = session?.user?.rol || 'VENDEDOR';
  const isVendedor = rol === 'VENDEDOR';
  const isDiseno = rol === 'DISENO';
  const isOperario = ['OFFSET', 'SERIGRAFIA', 'IMPRESION_DIGITAL', 'CARTELERIA', 'SUBLIMACION', 'EXPEDICION'].includes(rol);
  const canViewFinancials = rol === 'ADMIN' || rol === 'VENDEDOR';

  const upcomingBirthdays = activeUsers.filter((user: any) => {
      const birthDate = new Date(user.fechaNacimiento);
      const bMonth = birthDate.getUTCMonth();
      const bDay = birthDate.getUTCDate();
      
      const bdayThisYear = new Date(today.getFullYear(), bMonth, bDay);
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffTime = bdayThisYear.getTime() - todayMidnight.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 && diffDays <= 7;
  });

  // Filtros Básicos
  const aprobados = presupuestos.filter(p => p.estado === 'APROBADO');
  const pendientes = presupuestos.filter(p => p.estado === 'PENDIENTE');

  // KPIs
  const ventasMes = aprobados.reduce((acc, curr) => acc + curr.precioFinal, 0);
  const costosProduccion = aprobados.reduce((acc, curr) => acc + (curr.costoMateriales + curr.costoProcesos), 0);
  const gastosOperativos = gastos.reduce((acc, curr) => acc + curr.monto, 0);

  const gananciaBruta = ventasMes - costosProduccion;
  const gananciaNeta = gananciaBruta - gastosOperativos;
  const margenPromedio = ventasMes > 0 ? (gananciaNeta / ventasMes) * 100 : 0;

  return (
    <div className="p-8">
      {rol === 'ADMIN' && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Panel de Control</h1>
            <p className="text-slate-500 mt-1">Resumen financiero y operativo de tu empresa.</p>
          </div>
        </div>
      )}

      {/* ALERTAS DE CUMPLEAÑOS */}
      {rol === 'ADMIN' && upcomingBirthdays.length > 0 && (
        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 shadow-sm text-amber-800">
            <Gift className="w-8 h-8 shrink-0 text-amber-500 mt-1" />
            <div>
                <h3 className="font-bold text-lg">¡Avisos de Cumpleaños 🎉!</h3>
                <ul className="mt-2 text-md space-y-1.5">
                    {upcomingBirthdays.map((user: any) => {
                        const bMonth = new Date(user.fechaNacimiento).getUTCMonth();
                        const bDay = new Date(user.fechaNacimiento).getUTCDate();
                        const bdayThisYear = new Date(today.getFullYear(), bMonth, bDay);
                        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const diffTime = bdayThisYear.getTime() - todayMidnight.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        return (
                            <li key={user.id} className="flex items-center gap-2">
                                <span className="font-bold">{user.nombre}</span>: 
                                {diffDays === 0 && <span className="font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded text-sm">¡Hoy!</span>}
                                {diffDays === 1 && <span className="font-semibold text-orange-600">Mañana</span>}
                                {diffDays > 1 && <span>En {diffDays} días</span>}
                                <span className="text-amber-600 text-sm">({bDay}/{bMonth + 1})</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
      )}

      {/* ALERTAS DE EXPEDICIÓN (VENDEDORES Y ADMIN) */}
      {(canViewFinancials) && (() => {
          const trabajosEnExpedicion = aprobados.filter((p: any) => p.sectorProduccion === 'EXPEDICION' && p.estadoProduccion !== 'ENTREGADO');
          if (trabajosEnExpedicion.length === 0) return null;

          return (
            <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-4 shadow-sm text-blue-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Package className="w-8 h-8 shrink-0 text-blue-600 mt-1" />
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-blue-900">Mercadería en Expedición</h3>
                    <p className="text-sm text-blue-700 mb-4">
                        Los siguientes trabajos han llegado a Expedición. <strong>Confirma la liberación o entrega</strong> para finalizar el circuito.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {trabajosEnExpedicion.map((p: any) => (
                            <ExpedicionAlertItem 
                                key={p.id}
                                id={p.id}
                                numero={p.numero}
                                clienteNombre={p.cliente.nombre}
                                clienteEmpresa={p.cliente.empresa}
                                descripcion={p.descripcion}
                                fecha={new Date(p.fechaFinProduccion || p.updatedAt).toLocaleDateString()}
                            />
                        ))}
                    </div>
                </div>
            </div>
          );
      })()}

      {/* KPIs FINANCIEROS */}
      {canViewFinancials && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-medium font-sm">Ventas Confirmadas</h3>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">${ventasMes.toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>{aprobados.length} presupuestos</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-medium font-sm">Costos de Producción</h3>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">${costosProduccion.toFixed(2)}</p>
            <div className="mt-2 text-sm text-slate-500 font-medium">
              Materiales y procesos
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-medium font-sm">Gastos Operativos</h3>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">${gastosOperativos.toFixed(2)}</p>
            <div className="mt-2 text-sm text-slate-500 font-medium">
              Fijos y variables
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 text-white">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium font-sm">Ganancia Neta</h3>
              <div className="p-2 bg-slate-800 text-blue-400 rounded-lg">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">${gananciaNeta.toFixed(2)}</p>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${margenPromedio > 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {margenPromedio.toFixed(1)}% Margen
              </span>
              <span className="text-slate-400">Total</span>
            </div>
          </div>

        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ULTIMOS PRESUPUESTOS / TRABAJOS DE SECTOR */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${!canViewFinancials ? 'lg:col-span-2' : ''}`}>
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              {isDiseno ? 'Trabajos Aprobados (Pendientes de asignar)' 
                : isOperario ? `Órdenes asignadas a ${rol}`
                : 'Presupuestos Pendientes'}
            </h2>
            <Link href="/presupuestos" className="text-sm font-medium text-blue-600 hover:text-blue-800">Ver todos</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {(() => {
                let listaAMostrar = pendientes;
                if (isDiseno) {
                    listaAMostrar = aprobados.filter((p: any) => !p.sectorProduccion);
                } else if (isOperario) {
                    listaAMostrar = aprobados.filter((p: any) => p.sectorProduccion === rol);
                }

                if (listaAMostrar.length === 0) {
                    return <div className="p-8 text-center text-slate-500">No hay elementos pendientes.</div>;
                }

                return listaAMostrar.slice(0, 10).map((p: any) => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                            <h4 className="font-semibold text-slate-800">{p.cliente.nombre}</h4>
                            <p className="text-sm text-slate-500 truncate max-w-[250px]">{p.descripcion}</p>
                        </div>
                        <div className="text-right">
                            {canViewFinancials ? (
                                <div className="font-bold text-slate-800">${p.precioFinal.toFixed(2)}</div>
                            ) : (
                                <div className="font-bold text-slate-600 text-sm">{p.cantidad} unidades</div>
                            )}
                            <div className="text-xs font-medium text-slate-400">{new Date(p.fecha).toLocaleDateString()}</div>
                        </div>
                    </div>
                ));
            })()}
          </div>
        </div>

        {/* ESTRUCTURA DE COSTOS VISTA RAPIDA */}
        {canViewFinancials && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Salud Financiera (Mes Actual)</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-emerald-700">Ingresos Totales Brutos</span>
                <span className="text-slate-800">${ventasMes.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-orange-700">Costos Directos (Mat. + Proc.)</span>
                <span className="text-slate-800">${costosProduccion.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: ventasMes > 0 ? `${Math.min((costosProduccion / ventasMes) * 100, 100)}%` : '0%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-red-700">Gastos Operativos (Fijos + Var)</span>
                <span className="text-slate-800">${gastosOperativos.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: ventasMes > 0 ? `${Math.min((gastosOperativos / ventasMes) * 100, 100)}%` : '0%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-blue-700 font-bold">Margen de Contribución Libre</span>
                <span className="text-slate-800 font-bold">${gananciaNeta.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: ventasMes > 0 ? `${Math.max((gananciaNeta / ventasMes) * 100, 0)}%` : '0%' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                El margen libre representa el {margenPromedio.toFixed(1)}% de las ventas actuales.
              </p>
            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}
