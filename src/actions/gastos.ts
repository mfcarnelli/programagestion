/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getGastos() {
    try {
        return await prisma.gasto.findMany({
            orderBy: { fecha: 'desc' }
        });
    } catch (error) {
        console.error('Error obteniendo gastos:', error);
        return [];
    }
}

export async function createGasto(data: Record<string, any>) {
    try {
        const gasto = await prisma.gasto.create({
            data: {
                nombre: data.nombre,
                categoria: data.categoria, // FIJO, VARIABLE
                monto: Number(data.monto),
                frecuencia: data.frecuencia, // MENSUAL, UNICO, ANUAL
                fecha: data.fecha ? new Date(data.fecha) : new Date(),
                observaciones: data.observaciones,
            }
        });
        revalidatePath('/gastos');
        return { success: true, data: gasto };
    } catch (error) {
        console.error('Error creando gasto:', error);
        return { success: false, error: 'Error al crear el gasto' };
    }
}

export async function deleteGasto(id: string) {
    try {
        await prisma.gasto.delete({ where: { id } });
        revalidatePath('/gastos');
        return { success: true };
    } catch (error) {
        console.error('Error eliminando gasto:', error);
        return { success: false, error: 'Error al eliminar el gasto' };
    }
}

export async function getGastoById(id: string) {
    try {
        return await prisma.gasto.findUnique({
            where: { id }
        });
    } catch (error) {
        console.error('Error obteniendo gasto:', error);
        return null;
    }
}

export async function updateGasto(id: string, data: Record<string, any>) {
    try {
        const gasto = await prisma.gasto.update({
            where: { id },
            data: {
                nombre: data.nombre,
                categoria: data.categoria, // FIJO, VARIABLE
                monto: Number(data.monto),
                frecuencia: data.frecuencia, // MENSUAL, UNICO, ANUAL
                fecha: data.fecha ? new Date(data.fecha) : new Date(),
                observaciones: data.observaciones,
            }
        });
        revalidatePath('/gastos');
        return { success: true, data: gasto };
    } catch (error) {
        console.error('Error actualizando gasto:', error);
        return { success: false, error: 'Error al actualizar el gasto' };
    }
}
