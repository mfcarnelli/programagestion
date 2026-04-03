/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==========================================
// CATEGORIAS 
// ==========================================

export async function getCategorias() {
    try {
        return await prisma.categoriaInsumo.findMany({
            orderBy: { nombre: 'asc' }
        });
    } catch (error) {
        console.error('Error obteniendo categorias:', error);
        return [];
    }
}

export async function createCategoria(data: { nombre: string }) {
    try {
        const categoria = await prisma.categoriaInsumo.create({
            data: { nombre: data.nombre }
        });
        revalidatePath('/insumos');
        return { success: true, data: categoria };
    } catch (error) {
        console.error('Error creando categoria:', error);
        return { success: false, error: 'Error al crear la categoría' };
    }
}

// ==========================================
// INSUMOS
// ==========================================

export async function getInsumos() {
    try {
        return await prisma.insumo.findMany({
            include: {
                categoria: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
    } catch (error) {
        console.error('Error obteniendo insumos:', error);
        return [];
    }
}

export async function createInsumo(data: Record<string, any>) {
    try {
        const insumo = await prisma.insumo.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                categoriaId: data.categoriaId,
                tipo: data.tipo,
                gramaje: data.gramaje ? Number(data.gramaje) : null,
                medidaAncho: data.medidaAncho ? Number(data.medidaAncho) : null,
                medidaLargo: data.medidaLargo ? Number(data.medidaLargo) : null,
                cantidadPaquete: data.cantidadPaquete ? Number(data.cantidadPaquete) : null,
                talles: data.talles,
                colores: data.colores,
                unidadMedida: data.unidadMedida || 'UNIDAD',
                costoUnitario: Number(data.costoUnitario || 0),
                proveedor: data.proveedor,
                stockActual: Number(data.stockActual || 0),
                stockMinimo: Number(data.stockMinimo || 0),
            }
        });
        revalidatePath('/insumos');
        return { success: true, data: insumo };
    } catch (error) {
        console.error('Error creando insumo:', error);
        return { success: false, error: 'Error al crear el insumo' };
    }
}

export async function deleteInsumo(id: string) {
    try {
        await prisma.insumo.delete({
            where: { id }
        });
        revalidatePath('/insumos');
        return { success: true };
    } catch (error) {
        console.error('Error eliminando insumo:', error);
        return { success: false, error: 'Error al eliminar el insumo' };
    }
}
export async function getInsumoById(id: string) {
    try {
        return await prisma.insumo.findUnique({
            where: { id },
            include: { categoria: true }
        });
    } catch (error) {
        console.error('Error obteniendo insumo por ID:', error);
        return null;
    }
}

export async function updateInsumo(id: string, data: Record<string, any>) {
    try {
        const insumo = await prisma.insumo.update({
            where: { id },
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                categoriaId: data.categoriaId,
                tipo: data.tipo,
                gramaje: data.gramaje ? Number(data.gramaje) : null,
                medidaAncho: data.medidaAncho ? Number(data.medidaAncho) : null,
                medidaLargo: data.medidaLargo ? Number(data.medidaLargo) : null,
                cantidadPaquete: data.cantidadPaquete ? Number(data.cantidadPaquete) : null,
                talles: data.talles,
                colores: data.colores,
                unidadMedida: data.unidadMedida || 'UNIDAD',
                costoUnitario: Number(data.costoUnitario || 0),
                proveedor: data.proveedor,
                stockActual: Number(data.stockActual || 0),
                stockMinimo: Number(data.stockMinimo || 0),
            }
        });
        revalidatePath('/insumos');
        return { success: true, data: insumo };
    } catch (error) {
        console.error('Error actualizando insumo:', error);
        return { success: false, error: 'Error al actualizar el insumo' };
    }
}
