import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = 'Mauro'
  const password = 'Mauraska'

  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.usuario.upsert({
    where: { username },
    update: {
      password: hashedPassword,
      rol: 'ADMIN',
      activo: true,
    },
    create: {
      nombre: 'Mauro',
      username,
      password: hashedPassword,
      rol: 'ADMIN',
      activo: true,
    },
  })

  console.log({ admin })
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
