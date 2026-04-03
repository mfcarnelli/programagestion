import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Iniciando Test de Flujo ---')

  // 1. Obtener o crear vendedores
  let vendedores = await prisma.usuario.findMany({
    where: { rol: 'VENDEDOR' }
  })

  if (vendedores.length === 0) {
    console.log('No hay vendedores, creando uno de prueba...')
    const vendedor = await prisma.usuario.create({
      data: {
        nombre: 'Vendedor Prueba',
        username: 'vendedor_prueba',
        password: 'password_hash_dummy',
        rol: 'VENDEDOR',
      }
    })
    vendedores = [vendedor]
  }

  console.log(`Encontrados ${vendedores.length} vendedores.`)

  // 2. Crear un cliente para cada vendedor
  const clientes = []
  for (const vendedor of vendedores) {
    const cliente = await prisma.cliente.create({
      data: {
        nombre: `Cliente de ${vendedor.nombre} ${Date.now()}`,
        email: `cliente_${Date.now()}@test.com`,
        vendedorId: vendedor.id,
      }
    })
    clientes.push(cliente)
    console.log(`✅ Cliente creado: ${cliente.nombre} (Vendedor: ${vendedor.nombre})`)
  }

  // 3. Crear Insumo y Proceso para el presupuesto si no existen
  const insumo = await prisma.insumo.upsert({
    where: { id: 'test-insumo-id-123' },
    update: {},
    create: {
      id: 'test-insumo-id-123',
      nombre: 'Papel Ilustración 300g Test',
      unidadMedida: 'HOJA',
      costoUnitario: 50,
      tipo: 'PAPEL',
    }
  })

  // 4. Generar una orden (Presupuesto) para el primer cliente
  const primerCliente = clientes[0]
  
  // Obtener ultimo numero
  const ultimoP = await prisma.presupuesto.findFirst({
    orderBy: { numero: 'desc' }
  });
  const siguienteNumero = (ultimoP?.numero || 0) + 1;

  const orden = await prisma.presupuesto.create({
    data: {
      numero: siguienteNumero,
      clienteId: primerCliente.id,
      descripcion: 'Orden de Prueba ' + Date.now(),
      tipoTrabajo: 'PAPEL',
      cantidad: 100,
      costoMateriales: 5000,
      costoProcesos: 2000,
      costoTotal: 7000,
      margenGanancia: 30,
      impuestos: 21,
      precioFinal: 10587,
      estado: 'APROBADO', // Empezamos como aprobado
      estadoProduccion: 'EN_ESPERA',
      insumos: {
        create: [
          {
            insumoId: insumo.id,
            cantidad: 100,
            costoUnitario: 50,
            costoTotal: 5000,
          }
        ]
      },
      procesos: {
        create: [
          {
             nombre: 'IMPRESION Offset Test',
             costo: 2000
          }
        ]
      }
    }
  })

  console.log(`✅ Orden generada: #${orden.numero} - ${orden.descripcion}`)

  // 5. Recorrer los pasos de la orden (Pasar a producción y entregar)
  console.log('--- Simulando flujo de producción ---')

  const actualizarEstado = async (id: string, estado: string) => {
    const res = await prisma.presupuesto.update({
      where: { id },
      data: { estadoProduccion: estado }
    })
    console.log(`➡️ Estado cambiado a: ${res.estadoProduccion}`)
    return res;
  }

  await actualizarEstado(orden.id, 'EN_PRODUCCION')
  await actualizarEstado(orden.id, 'TERMINADO')
  await actualizarEstado(orden.id, 'ENTREGADO')

  console.log('--- Test completado exitosamente ---')
}

main()
  .catch(e => {
    console.error('ERROR en el flujo: ', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
