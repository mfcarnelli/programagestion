import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AuthProvider from '@/components/auth/AuthProvider';
import SystemTour from '@/components/ui/SystemTour';
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Presupuestos IC',
  description: 'Sistema de cálculo de presupuestos e insumos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className + " bg-slate-50 flex min-h-screen"}>
        <NextTopLoader color="#3b82f6" showSpinner={false} />
        <AuthProvider>
          <SystemTour />
          <Sidebar />
          <main className="flex-1 ml-0 h-screen overflow-y-auto">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
