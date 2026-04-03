import { getGastoById } from '@/actions/gastos';
import EditGastoForm from './EditGastoForm';
import { notFound } from 'next/navigation';

export const metadata = {
    title: 'Editar Gasto - Presupuestos IC',
};

export const dynamic = 'force-dynamic';

export default async function EditarGastoPage({ params }: { params: { id: string } }) {
    const { id } = params;
    
    if (!id) {
        notFound();
    }
    
    const gasto = await getGastoById(id);

    if (!gasto) {
        notFound();
    }

    return <EditGastoForm gasto={gasto} />;
}
