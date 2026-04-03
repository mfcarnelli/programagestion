import { getVendedorDashboardData } from '@/actions/ventas';
import VentasDashboard from '@/components/ventas/VentasDashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Mis Ventas - Presupuestos IC',
};

export default async function VentasPage() {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !['ADMIN', 'VENDEDOR'].includes((session.user as any).rol)) {
        redirect('/');
    }

    const userId = (session.user as any).id;
    const rol = (session.user as any).rol;

    const data = await getVendedorDashboardData(userId, rol);

    if (!data.success) {
        return <div className="p-8 text-red-500">Error cargando el panel de ventas.</div>;
    }

    return (
        <VentasDashboard 
            clientes={data.clientes || []} 
            presupuestos={data.presupuestos || []} 
            porcentaje={data.porcentajeComision || 0} 
            rol={rol}
        />
    );
}
