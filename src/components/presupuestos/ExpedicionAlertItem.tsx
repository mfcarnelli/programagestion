'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ExpedicionAlertItem({ 
    id, 
    numero, 
    clienteNombre, 
    clienteEmpresa, 
    descripcion, 
    fecha 
}: { 
    id: string; 
    numero: number; 
    clienteNombre: string; 
    clienteEmpresa?: string | null; 
    descripcion: string; 
    fecha: string; 
}) {
    const [isClicked, setIsClicked] = useState(false);

    return (
        <div className={`p-3 rounded-lg border flex items-center justify-between shadow-sm transition-all duration-200 ${!isClicked ? 'animate-blink-rg' : 'bg-white border-slate-200 opacity-60'}`}>
            <style>{`
                @keyframes blink-red-green {
                    0%, 100% { background-color: #fecaca; border-color: #dc2626; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3); }
                    50% { background-color: #bbf7d0; border-color: #16a34a; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3); }
                }
                .animate-blink-rg {
                    animation: blink-red-green 1.2s infinite;
                }
            `}</style>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-slate-900">#{numero}</span>
                    <span className="text-sm font-bold text-slate-800">
                        {clienteNombre} {clienteEmpresa && <span className="text-slate-500 font-normal">({clienteEmpresa})</span>}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-600 font-medium line-clamp-1">{descripcion}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap border border-slate-200">
                        Llegó: {fecha}
                    </span>
                </div>
            </div>
            <Link 
                href={`/presupuestos/${id}`} 
                onClick={() => setIsClicked(true)}
                className={`shrink-0 ml-4 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors uppercase tracking-wide ${!isClicked ? 'bg-slate-900 text-white hover:bg-black' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
                {isClicked ? 'Abriendo...' : 'Revisar'}
            </Link>
        </div>
    );
}
