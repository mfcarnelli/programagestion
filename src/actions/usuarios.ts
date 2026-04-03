/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getUsuarios() {
    try {
        return await prisma.usuario.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        return [];
    }
}

export async function createUsuario(data: Record<string, any>) {
    try {
        const existing = await prisma.usuario.findUnique({
            where: { username: data.username }
        });

        if (existing) {
            return { success: false, error: 'El nombre de usuario ya está en uso' };
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nombre: data.nombre,
                username: data.username,
                password: hashedPassword,
                rol: data.rol,
                activo: data.activo === 'true' || data.activo === true,
                celular: data.celular || null,
                direccion: data.direccion || null,
                fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
                mutualista: data.mutualista || null,
                porcentajeComision: Number(data.porcentajeComision) || 0,
            }
        });
        
        revalidatePath('/admin/usuarios');
        return { success: true, data: usuario };
    } catch (error) {
        console.error('Error creando usuario:', error);
        return { success: false, error: 'Error al crear usuario' };
    }
}

export async function getUsuarioById(id: string) {
    try {
        return await prisma.usuario.findUnique({
            where: { id }
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
}

export async function updateUsuario(id: string, data: Record<string, any>) {
    try {
        const updateData: any = {
            nombre: data.nombre,
            username: data.username,
            rol: data.rol,
            activo: data.activo === 'true' || data.activo === true,
            celular: data.celular || null,
            direccion: data.direccion || null,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
            mutualista: data.mutualista || null,
            porcentajeComision: Number(data.porcentajeComision) || 0,
        };

        if (data.password && data.password.trim() !== '') {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        const usuario = await prisma.usuario.update({
            where: { id },
            data: updateData
        });
        
        revalidatePath('/admin/usuarios');
        return { success: true, data: usuario };
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        return { success: false, error: 'Error al actualizar usuario' };
    }
}

export async function deleteUsuario(id: string) {
    try {
        await prisma.usuario.delete({ where: { id } });
        revalidatePath('/admin/usuarios');
        return { success: true };
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        return { success: false, error: 'Error al eliminar usuario' };
    }
}
