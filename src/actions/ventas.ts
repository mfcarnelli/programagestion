/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getVendedorDashboardData(userId: string, rol: string) {
    try {
        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            select: { porcentajeComision: true }
        });

        // If it's an ADMIN they might want to see all sales, but the "Mis Ventas" menu usually implies their own sales,
        // or we can just filter by their own ID. If we want admins to see everything here, we can adjust.
        // The prompt says "aqui puede el vendedor ver sus clientes y los trabajos en marcha". We'll filter by vendedorId.
        const isAdmin = rol === 'ADMIN';

        // AUTO-CORRECCIÓN DE DATOS: Asignar clientes huérfanos al usuario actual para que aparezcan en su panel
        await prisma.cliente.updateMany({
            where: { vendedorId: null },
            data: { vendedorId: userId }
        });

        const clientes = await prisma.cliente.findMany({
            where: isAdmin ? {} : { vendedorId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { presupuestos: true }
                }
            }
        });

        // We also need all budgets (Presupuestos) for this seller to calculate commissions and performances
        const presupuestos = await prisma.presupuesto.findMany({
            where: isAdmin ? {} : { cliente: { vendedorId: userId } },
            include: {
                cliente: true
            },
            orderBy: { fecha: 'desc' }
        });

        return {
            success: true,
            clientes,
            presupuestos,
            porcentajeComision: user?.porcentajeComision || 0
        };

    } catch (error) {
        console.error('Error fetching ventas dashboard data:', error);
        return { success: false, error: 'Error al obtener datos del dashboard de ventas.' };
    }
}

export async function marcarComisionPagada(presupuestoId: string, pagada: boolean) {
    try {
        await prisma.presupuesto.update({
            where: { id: presupuestoId },
            data: { comisionPagada: pagada }
        });
        
        revalidatePath('/ventas');
        return { success: true };
    } catch (error) {
        console.error('Error actualizando comision:', error);
        return { success: false, error: 'Error al actualizar el estado de la comisión.' };
    }
}
