'use client';

import { deleteGasto } from '@/actions/gastos';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GastoActions({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;
        
        setIsDeleting(true);
        const result = await deleteGasto(id);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-center gap-3">
            <Link 
                href={`/gastos/editar/${id}`}
                className="text-blue-500 hover:text-blue-700 font-medium text-sm transition-colors flex items-center gap-1"
                title="Editar"
            >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
            </Link>
            <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Eliminar"
            >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
            </button>
        </div>
    );
}
