'use client';

import { useState, useEffect } from 'react';
import { Play, Printer, PauseCircle, CheckCircle2, Clock } from 'lucide-react';
import { actualizarTrazabilidad } from '@/actions/presupuestos';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Props {
  id: string;
  tiempoPreparacion: number;
  tiempoImpresion: number;
  tiempoPausado: number;
  estadoTrazabilidad: string;
  inicioActividad: Date | null;
  historial?: any[];
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function TraceabilityTimers({
  id,
  tiempoPreparacion,
  tiempoImpresion,
  tiempoPausado,
  estadoTrazabilidad,
  inicioActividad,
  historial = []
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const operario = session?.user?.name || '';

  const [tPreparacion, setTPreparacion] = useState(tiempoPreparacion);
  const [tImpresion, setTImpresion] = useState(tiempoImpresion);
  const [tPausado, setTPausado] = useState(tiempoPausado);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si no hay actividad en curso, setear los tiempos iniciales y no hacer nada
    if (!inicioActividad || estadoTrazabilidad === 'NO_INICIADO' || estadoTrazabilidad === 'FINALIZADO') {
      setTPreparacion(tiempoPreparacion);
      setTImpresion(tiempoImpresion);
      setTPausado(tiempoPausado);
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(inicioActividad).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - start) / 1000);

      if (estadoTrazabilidad === 'PREPARACION') {
        setTPreparacion(tiempoPreparacion + elapsedSeconds);
        setTImpresion(tiempoImpresion);
        setTPausado(tiempoPausado);
      } else if (estadoTrazabilidad === 'IMPRESION') {
        setTPreparacion(tiempoPreparacion);
        setTImpresion(tiempoImpresion + elapsedSeconds);
        setTPausado(tiempoPausado);
      } else if (estadoTrazabilidad === 'PAUSADO') {
        setTPreparacion(tiempoPreparacion);
        setTImpresion(tiempoImpresion);
        setTPausado(tiempoPausado + elapsedSeconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [inicioActividad, estadoTrazabilidad, tiempoPreparacion, tiempoImpresion, tiempoPausado]);

  const handleEstadoChange = async (nuevoEstado: string) => {
    if (loading) return;
    setLoading(true);
    const res = await actualizarTrazabilidad(id, nuevoEstado, operario);
    if (res.success) {
      router.refresh(); // Para actualizar los props de la DB
    } else {
      alert(res.error || 'Error al actualizar el estado de trazabilidad.');
    }
    setLoading(false);
  };

  const tiempoTotal = tPreparacion + tImpresion + tPausado;

  return (
    <div className="mt-6 pt-5 border-t border-slate-100">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Control de Tarea (Trazabilidad):</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Inicio y Preparado */}
        <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-2xl font-mono text-slate-700">{formatTime(tPreparacion)}</div>
          <button
            onClick={() => handleEstadoChange('PREPARACION')}
            disabled={loading || estadoTrazabilidad === 'PREPARACION' || estadoTrazabilidad === 'FINALIZADO'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
              estadoTrazabilidad === 'PREPARACION'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                : 'bg-white border text-slate-700 hover:bg-slate-50 hover:text-blue-600'
            } disabled:opacity-50`}
          >
            <Play className={`w-4 h-4 ${estadoTrazabilidad === 'PREPARACION' ? 'text-white' : 'text-blue-500'}`} />
            Inicio y Preparado
          </button>
        </div>

        {/* Impresión */}
        <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-2xl font-mono text-slate-700">{formatTime(tImpresion)}</div>
          <button
            onClick={() => handleEstadoChange('IMPRESION')}
            disabled={loading || estadoTrazabilidad === 'IMPRESION' || estadoTrazabilidad === 'FINALIZADO' || estadoTrazabilidad === 'NO_INICIADO'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
              estadoTrazabilidad === 'IMPRESION'
                ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                : 'bg-white border text-slate-700 hover:bg-slate-50 hover:text-amber-500'
            } disabled:opacity-50`}
          >
            <Printer className={`w-4 h-4 ${estadoTrazabilidad === 'IMPRESION' ? 'text-white' : 'text-amber-500'}`} />
            Impresión
          </button>
        </div>

        {/* Pausa o Improductivo */}
        <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-2xl font-mono text-slate-700">{formatTime(tPausado)}</div>
          <button
            onClick={() => handleEstadoChange('PAUSADO')}
            disabled={loading || estadoTrazabilidad === 'PAUSADO' || estadoTrazabilidad === 'FINALIZADO' || estadoTrazabilidad === 'NO_INICIADO'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
              estadoTrazabilidad === 'PAUSADO'
                ? 'bg-red-500 text-white shadow-md ring-2 ring-red-300'
                : 'bg-white border text-slate-700 hover:bg-slate-50 hover:text-red-500'
            } disabled:opacity-50`}
          >
            <PauseCircle className={`w-4 h-4 ${estadoTrazabilidad === 'PAUSADO' ? 'text-white' : 'text-red-500'}`} />
            Pausa / Improductivo
          </button>
        </div>

        {/* Finalizar Orden */}
        <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-2xl font-mono text-slate-700 font-bold">{formatTime(tiempoTotal)}</div>
          <button
            onClick={() => handleEstadoChange('FINALIZADO')}
            disabled={loading || estadoTrazabilidad === 'FINALIZADO' || estadoTrazabilidad === 'NO_INICIADO'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
              estadoTrazabilidad === 'FINALIZADO'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white border text-slate-700 hover:bg-slate-50 hover:text-emerald-600'
            } disabled:opacity-50`}
          >
            <CheckCircle2 className={`w-4 h-4 ${estadoTrazabilidad === 'FINALIZADO' ? 'text-white' : 'text-emerald-500'}`} />
            Finalizar Orden
          </button>
        </div>
      </div>
    </div>
  );
}
