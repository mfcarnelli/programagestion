import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Creando gasto...");
    const newGasto = await prisma.gasto.create({
        data: {
            nombre: 'Test Gasto',
            categoria: 'FIJO',
            monto: 1000,
            frecuencia: 'MENSUAL',
            observaciones: 'Test'
        }
    });

    console.log("Creado:", newGasto.id);

    console.log("Actualizando...");
    const updated = await prisma.gasto.update({
        where: { id: newGasto.id },
        data: { monto: 2000 }
    });
    console.log("Actualizado:", updated.monto);

    console.log("Eliminando...");
    await prisma.gasto.delete({ where: { id: newGasto.id } });
    console.log("Eliminado con exito.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
