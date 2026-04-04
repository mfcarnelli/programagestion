import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'Mauro';
  const plainPassword = '123456'; // Puedes cambiarla luego en el sistema

  const exists = await prisma.usuario.findUnique({
    where: { username }
  });

  if (exists) {
    console.log(`El usuario ${username} ya existe en Supabase.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  const user = await prisma.usuario.create({
    data: {
      nombre: 'Administrador Principal',
      username: username,
      password: hashedPassword,
      rol: 'ADMIN',
      activo: true,
    },
  });
  
  console.log(`¡Éxito! Creado usuario ADMIN en Supabase.`);
  console.log(`Usuario: ${user.username}`);
  console.log(`Contraseña: ${plainPassword}`);
}

main()
  .catch((e) => {
    console.error('Error creando usuario:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
