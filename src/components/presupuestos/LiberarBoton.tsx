'use client';

import { useState } from 'react';
import { actualizarEstadoProduccion } from '@/actions/presupuestos';
import { Check } from 'lucide-react';

export default function LiberarBoton({ id }: { id: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLiberar = async () => {
        if (confirm('¿Confirmas la entrega/liberación de esta mercadería?')) {
            setIsLoading(true);
            const res = await actualizarEstadoProduccion(id, 'ENTREGADO');
            setIsLoading(false);
            if (!res.success) {
                alert(res.error || 'Error al liberar.');
            }
        }
    };

    return (
        <button
            onClick={handleLiberar}
            disabled={isLoading}
            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-2.5 py-1.5 rounded transition-colors disabled:opacity-50"
        >
            <Check className="w-3 h-3" />
            {isLoading ? 'Liberando...' : 'Liberar OK'}
        </button>
    );
}
