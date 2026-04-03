import UsuarioForm from '@/components/usuarios/UsuarioForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Nuevo Usuario - Presupuestos IC',
};

export default function NuevoUsuarioPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/usuarios" className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Nuevo Usuario</h1>
                    <p className="text-slate-500 mt-1">Registra un nuevo miembro del equipo y asígnale un rol.</p>
                </div>
            </div>

            <UsuarioForm />
        </div>
    );
}
