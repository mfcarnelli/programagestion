import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text", placeholder: "mauro" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        console.log('--- TEST: Iniciando authorize en NextAuth ---');
        console.log('TEST - Credenciales recibidas:', { username: credentials?.username, passwordLength: credentials?.password?.length });

        if (!credentials?.username || !credentials?.password) {
          console.log('TEST - Falta usuario o contraseña en credentials');
          throw new Error("Credenciales inválidas");
        }

        console.log('TEST - Buscando usuario en PRISMA:', credentials.username);
        const user = await prisma.usuario.findUnique({
          where: { username: credentials.username },
        });

        console.log('TEST - Usuario encontrado en BD:', user ? { id: user.id, username: user.username, activo: user.activo } : 'null');

        if (!user || !user.activo) {
          console.log('TEST - Usuario es null o no está activo, retornando error');
          throw new Error("Usuario no encontrado o inactivo");
        }

        console.log('TEST - Comparando contraseñas para usuario:', user.username);
        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log('TEST - Resultado de comparación bcrypt:', isValid);

        if (!isValid) {
          console.log('TEST - Contraseña incorrecta');
          throw new Error("Contraseña incorrecta");
        }

        console.log('TEST - Autorización exitosa, retornando datos de usuario');
        return {
          id: user.id,
          name: user.nombre,
          username: user.username,
          rol: user.rol,
          nombre: user.nombre,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.username = user.username;
        token.nombre = user.nombre;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).rol = token.rol;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).username = token.username;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).nombre = token.nombre;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "uR9kP2xvL8mQ4sT7zN1aB6cF0hJ3wE5y",
};
