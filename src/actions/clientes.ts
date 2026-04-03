'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Obtener todos los clientes
export async function getClientes() {
    try {
        return await prisma.cliente.findMany({
            orderBy: { nombre: 'asc' }
        });
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        return [];
    }
}

// Obtener cliente por ID con sus presupuestos
export async function getClienteById(id: string) {
    try {
        return await prisma.cliente.findUnique({
            where: { id },
            include: {
                presupuestos: {
                    orderBy: { fecha: 'desc' },
                    include: {
                        insumos: {
                            include: {
                                insumo: true
                            }
                        },
                        procesos: true
                    }
                }
            }
        }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (error) {
        console.error('Error obteniendo cliente:', error);
        return null;
    }
}

// Crear nuevo cliente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCliente(data: any) {
    try {
        const cliente = await prisma.cliente.create({
            data: {
                nombre: data.nombre,
                email: data.email || null,
                telefono: data.telefono || null,
                empresa: data.empresa || null,
                documento: data.documento || null,
                direccion: data.direccion || null,
                ciudad: data.ciudad || null,
                provincia: data.provincia || null,
                notas: data.notas || null,
            }
        });
        revalidatePath('/clientes');
        return { success: true, data: cliente };
    } catch (error) {
        console.error('Error creando cliente:', error);
        return { success: false, error: 'Ocurrió un error al crear el cliente.' };
    }
}

// Actualizar cliente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCliente(id: string, data: any) {
    try {
        const cliente = await prisma.cliente.update({
            where: { id },
            data: {
                nombre: data.nombre,
                email: data.email || null,
                telefono: data.telefono || null,
                empresa: data.empresa || null,
                documento: data.documento || null,
                direccion: data.direccion || null,
                ciudad: data.ciudad || null,
                provincia: data.provincia || null,
                notas: data.notas || null,
            }
        });
        revalidatePath('/clientes');
        revalidatePath(`/clientes/${id}`);
        return { success: true, data: cliente };
    } catch (error) {
        console.error('Error actualizando cliente:', error);
        return { success: false, error: 'Ocurrió un error al actualizar el cliente.' };
    }
}

// Eliminar cliente (Solo si no tiene presupuestos asociados)
export async function deleteCliente(id: string) {
    try {
        // Verificar si tiene presupuestos
        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { presupuestos: true }
                }
            }
        });

        if (!cliente) return { success: false, error: 'Cliente no encontrado.' };

        if (cliente._count.presupuestos > 0) {
            return { 
                success: false, 
                error: 'No se puede eliminar un cliente que tiene presupuestos cargados a su nombre. Por favor elimina los presupuestos antes o edita el perfil de cliente.' 
            };
        }

        await prisma.cliente.delete({
            where: { id }
        });
        
        revalidatePath('/clientes');
        return { success: true };
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        return { success: false, error: 'Hubo un error al intentar eliminar el cliente.' };
    }
}
