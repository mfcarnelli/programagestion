/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPresupuestos() {
    try {
        return await prisma.presupuesto.findMany({
            include: {
                cliente: {
                    include: { vendedor: true }
                }
            },
            orderBy: { fecha: 'desc' }
        });
    } catch (error) {
        console.error('Error obteniendo presupuestos:', error);
        return [];
    }
}

export async function getPresupuestoById(id: string) {
    try {
        return await prisma.presupuesto.findUnique({
            where: { id },
            include: {
                cliente: true,
                insumos: {
                    include: {
                        insumo: true
                    }
                },
                procesos: true,
                registrosTrazabilidad: {
                    orderBy: { fechaRegistro: 'asc' }
                }
            }
        });
    } catch (error) {
        console.error('Error obteniendo presupuesto por ID:', error);
        return null;
    }
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function createPresupuesto(data: Record<string, any>) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        
        let clienteId = data.clienteId;

        // Si no hay ID de cliente preseleccionado, buscamos o creamos el nuevo cliente
        if (!clienteId) {
            let cliente = await prisma.cliente.findFirst({
                where: { nombre: data.clienteNombre }
            });

            if (!cliente) {
                cliente = await prisma.cliente.create({
                    data: { 
                        nombre: data.clienteNombre,
                        ...(userId ? { vendedorId: userId } : {})
                    }
                });
            }
            clienteId = cliente.id;
        }

        const maxNum = await prisma.presupuesto.aggregate({
            _max: { numero: true }
        });
        const nuevoNum = (maxNum._max.numero || 1000) + 1;

        const presupuesto = await prisma.presupuesto.create({
            data: {
                numero: nuevoNum,
                clienteId: clienteId,
                descripcion: data.descripcion,
                cantidad: Number(data.cantidad),
                tipoTrabajo: data.tipoTrabajo, // PAPEL, TEXTIL
                costoMateriales: Number(data.costoMateriales),
                costoProcesos: Number(data.costoProcesos),
                costoTotal: Number(data.costoTotal),
                margenGanancia: Number(data.margenGanancia),
                impuestos: Number(data.impuestos),
                precioFinal: Number(data.precioFinal),
                estado: 'PENDIENTE',
                observaciones: data.observaciones
            }
        });
        revalidatePath('/presupuestos');
        revalidatePath('/');
        return { success: true, data: presupuesto };
    } catch (error) {
        console.error('Error creando presupuesto:', error);
        return { success: false, error: 'Error al generar el presupuesto.' };
    }
}

export async function updateEstadoPresupuesto(id: string, estado: string) {
    try {
        await prisma.presupuesto.update({
            where: { id },
            data: { estado }
        });
        revalidatePath('/presupuestos');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error actualizando estado:', error);
        return { success: false, error: 'Error al actualizar el estado.' };
    }
}

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function aprobarPresupuestoConArchivo(id: string, formData: FormData) {
    try {
        const file = formData.get('file') as File | null;
        let filePath = null;

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Validate extension
            const ext = file.name.split('.').pop()?.toLowerCase();
            const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'eps'];
            if (!ext || !allowed.includes(ext)) {
                return { success: false, error: 'Formato de archivo no permitido. Solo jpg, png, pdf, eps.' };
            }

            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
            const uploadDir = join(process.cwd(), 'public', 'uploads');
            
            await mkdir(uploadDir, { recursive: true });
            await writeFile(join(uploadDir, filename), buffer);
            filePath = `/uploads/${filename}`;
        }

        await prisma.presupuesto.update({
            where: { id },
            data: { 
                estado: 'APROBADO',
                ...(filePath ? { archivoReferencia: filePath } : {}) 
            }
        });

        revalidatePath('/presupuestos');
        revalidatePath(`/presupuestos/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error aprobando presupuesto con archivo:', error);
        return { success: false, error: 'Ocurrió un error al procesar la aprobación.' };
    }
}

import { createWorker } from 'tesseract.js';

export async function subirComprobanteEnvio(id: string, formData: FormData) {
    try {
        const file = formData.get('file') as File | null;
        if (!file || file.size === 0) {
            return { success: false, error: 'No se incluyó ningún archivo o está vacío.' };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const ext = file.name.split('.').pop()?.toLowerCase();
        const allowed = ['jpg', 'jpeg', 'png'];
        if (!ext || !allowed.includes(ext)) {
            return { success: false, error: 'Formato inválido. Sube imagenes JPG o PNG para extraer el texto.' };
        }

        const filename = `comprobante-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        
        await mkdir(uploadDir, { recursive: true });
        const finalPath = join(uploadDir, filename);
        await writeFile(finalPath, buffer);
        const webPath = `/uploads/${filename}`;

        // Intentar realizar el OCR local con tesseract.js
        let textoExtraido = '';
        try {
            const worker = await createWorker('spa'); // Español
            const ret = await worker.recognize(buffer);
            textoExtraido = ret.data.text;
            await worker.terminate();
        } catch (ocrError) {
            console.error('Error durante OCR con Tesseract:', ocrError);
            textoExtraido = 'Error al escanear el texto de la imagen.';
        }

        await prisma.presupuesto.update({
            where: { id },
            data: { 
                comprobanteEnvio: webPath,
                textoComprobante: textoExtraido
            }
        });

        revalidatePath('/presupuestos');
        revalidatePath(`/presupuestos/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error subiendo comprobante:', error);
        return { success: false, error: 'Fallo al procesar y guardar el comprobante de envío.' };
    }
}

// ------------------------------------------------------------------------------------------------ //
// NUEVO: PAGOS Y PRODUCCIÓN
// ------------------------------------------------------------------------------------------------ //

export async function registrarPagoPresupuesto(id: string, montoAAgregar: number) {
    try {
        const p = await prisma.presupuesto.findUnique({ where: { id } });
        if (!p) return { success: false, error: 'Presupuesto no encontrado.' };

        const nuevoMonto = p.montoPagado + montoAAgregar;
        const restante = p.precioFinal - nuevoMonto;
        
        let nuevoEstadoPago = 'PENDIENTE';
        if (nuevoMonto > 0 && restante > 0.05) nuevoEstadoPago = 'PARCIAL';
        if (restante <= 0.05) nuevoEstadoPago = 'PAGADO';

        await prisma.presupuesto.update({
            where: { id },
            data: {
                montoPagado: nuevoMonto,
                estadoPago: nuevoEstadoPago
            }
        });

        revalidatePath(`/presupuestos/${id}`);
        revalidatePath(`/clientes/${p.clienteId}`);
        return { success: true };
    } catch (error) {
        console.error('Error al registrar pago:', error);
        return { success: false, error: 'Ocurrió un error al guardar el pago.' };
    }
}

export async function actualizarEstadoProduccion(id: string, nuevoEstado: string, operarioNombre?: string) {
    try {
        const dataToUpdate: any = {
            estadoProduccion: nuevoEstado
        };

        if (nuevoEstado === 'EN_PRODUCCION') {
            dataToUpdate.fechaInicioProduccion = new Date();
            if (operarioNombre) dataToUpdate.operarioProduccion = operarioNombre;
        } else if (nuevoEstado === 'TERMINADO') {
            dataToUpdate.fechaFinProduccion = new Date();
            if (operarioNombre) dataToUpdate.operarioProduccion = operarioNombre; // Mantener último o asignarlo si no existía
        }

        const p = await prisma.presupuesto.update({
            where: { id },
            data: dataToUpdate
        });
        
        revalidatePath(`/presupuestos/${id}`);
        revalidatePath(`/clientes/${p.clienteId}`);
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar producción:', error);
        return { success: false, error: 'No se pudo actualizar el estado de producción.' };
    }
}

export async function asignarSectorProduccion(id: string, sector: string) {
    try {
        await prisma.presupuesto.update({
            where: { id },
            data: { sectorProduccion: sector }
        });
        
        revalidatePath(`/presupuestos/${id}`);
        revalidatePath(`/presupuestos`);
        revalidatePath(`/`);
        return { success: true };
    } catch (error) {
        console.error('Error al asignar sector productivo:', error);
        return { success: false, error: 'No se pudo asignar el sector.' };
    }
}

export async function actualizarTrazabilidad(id: string, nuevoEstado: string, operarioNombre?: string) {
    try {
        const p = await prisma.presupuesto.findUnique({ where: { id } });
        if (!p) return { success: false, error: 'Presupuesto no encontrado.' };

        const dataToUpdate: any = {};
        const now = new Date();

        if (p.inicioActividad && p.estadoTrazabilidad !== 'NO_INICIADO' && p.estadoTrazabilidad !== 'FINALIZADO') {
            const elapsedSeconds = Math.floor((now.getTime() - p.inicioActividad.getTime()) / 1000);
            
            if (p.estadoTrazabilidad === 'PREPARACION') {
                dataToUpdate.tiempoPreparacion = p.tiempoPreparacion + elapsedSeconds;
            } else if (p.estadoTrazabilidad === 'IMPRESION') {
                dataToUpdate.tiempoImpresion = p.tiempoImpresion + elapsedSeconds;
            } else if (p.estadoTrazabilidad === 'PAUSADO') {
                dataToUpdate.tiempoPausado = p.tiempoPausado + elapsedSeconds;
            }
        }

        dataToUpdate.estadoTrazabilidad = nuevoEstado;

        if (nuevoEstado === 'FINALIZADO') {
            dataToUpdate.inicioActividad = null;
            dataToUpdate.estadoProduccion = 'TERMINADO';
            dataToUpdate.fechaFinProduccion = now;
            if (operarioNombre) dataToUpdate.operarioProduccion = operarioNombre;

            // 1. Crear el registro histórico de trazabilidad para este sector
            const tiempoPreparacionActual = dataToUpdate.tiempoPreparacion ?? p.tiempoPreparacion;
            const tiempoImpresionActual = dataToUpdate.tiempoImpresion ?? p.tiempoImpresion;
            const tiempoPausadoActual = dataToUpdate.tiempoPausado ?? p.tiempoPausado;
            
            await prisma.registroTrazabilidad.create({
                data: {
                    presupuestoId: id,
                    sector: p.sectorProduccion || 'NO_ASIGNADO',
                    operario: operarioNombre || p.operarioProduccion,
                    tiempoPreparacion: tiempoPreparacionActual,
                    tiempoImpresion: tiempoImpresionActual,
                    tiempoPausado: tiempoPausadoActual,
                    tiempoTotal: tiempoPreparacionActual + tiempoImpresionActual + tiempoPausadoActual
                }
            });

            // 2. Resetear los cronómetros de la orden para el próximo sector
            dataToUpdate.tiempoPreparacion = 0;
            dataToUpdate.tiempoImpresion = 0;
            dataToUpdate.tiempoPausado = 0;
            dataToUpdate.estadoTrazabilidad = 'NO_INICIADO'; // Dejar listo desde cero
            
        } else {
            dataToUpdate.inicioActividad = now;
            if (nuevoEstado !== 'NO_INICIADO' && p.estadoProduccion !== 'EN_PRODUCCION') {
                dataToUpdate.estadoProduccion = 'EN_PRODUCCION';
                if (!p.fechaInicioProduccion) {
                    dataToUpdate.fechaInicioProduccion = now;
                }
            }
            if (operarioNombre) dataToUpdate.operarioProduccion = operarioNombre;
        }

        await prisma.presupuesto.update({
            where: { id },
            data: dataToUpdate
        });
        
        revalidatePath(`/presupuestos/${id}`);
        revalidatePath(`/presupuestos`);
        revalidatePath(`/`);
        
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar trazabilidad:', error);
        return { success: false, error: 'Ocurrió un error al actualizar la trazabilidad.' };
    }
}
