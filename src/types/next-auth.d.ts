import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    rol: string;
    username: string;
    nombre: string;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    rol: string;
    username: string;
    nombre: string;
  }
}
