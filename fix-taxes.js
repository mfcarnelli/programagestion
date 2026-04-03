const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const presupuestos = await prisma.presupuesto.findMany({
    where: {
      impuestos: { gt: 100 } // Any percentage > 100 is the bugged absolute value
    }
  });

  for (const p of presupuestos) {
    let subtotal = p.costoTotal + (p.costoTotal * (p.margenGanancia / 100));
    let realPercentage = Math.round((p.impuestos / subtotal) * 100);
    
    await prisma.presupuesto.update({
      where: { id: p.id },
      data: { impuestos: realPercentage }
    });
    console.log(`Migrated budget ${p.numero} from absolute amount ${p.impuestos} back to percentage ${realPercentage}%`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
