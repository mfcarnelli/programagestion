import UsuarioForm from '@/components/usuarios/UsuarioForm';
import { getUsuarioById } from '@/actions/usuarios';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = {
    title: 'Editar Usuario - Presupuestos IC',
};

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
    const usuario = await getUsuarioById(params.id);

    if (!usuario) {
        notFound();
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/usuarios" className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Editar Usuario</h1>
                    <p className="text-slate-500 mt-1">Modifica los datos, rol o contacto de este miembro de equipo.</p>
                </div>
            </div>

            <UsuarioForm initialData={usuario} />
        </div>
    );
}
