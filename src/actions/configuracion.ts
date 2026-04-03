'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getConfiguracion() {
    try {
        let config = await prisma.configuracion.findUnique({
            where: { id: 'GLOBAL' }
        });
        
        if (!config) {
            config = await prisma.configuracion.create({
                data: { id: 'GLOBAL', margenGanancia: 30, impuestos: 22 }
            });
        }
        
        return {
            margenGanancia: config.margenGanancia,
            impuestos: config.impuestos
        };
    } catch (e) {
        console.error(e);
        return { margenGanancia: 30, impuestos: 22 };
    }
}

export async function updateConfiguracion(margen: number, impuestos: number) {
    try {
        await prisma.configuracion.upsert({
            where: { id: 'GLOBAL' },
            update: { margenGanancia: margen, impuestos },
            create: { id: 'GLOBAL', margenGanancia: margen, impuestos },
        });
        revalidatePath('/admin/usuarios');
        revalidatePath('/presupuestos/nuevo');
        return { success: true };
    } catch {
        return { success: false, error: 'Error al actualizar configuración' };
    }
}
