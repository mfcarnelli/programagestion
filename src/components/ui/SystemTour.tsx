// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Joyride requires ssr: false and robust default export extraction
const Joyride = dynamic(
  () => import('react-joyride').then((mod) => mod.default || mod.Joyride || mod),
  { ssr: false }
);

export default function SystemTour() {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Configuramos los pasos del recorrido
    setSteps([
      {
        target: '.tour-dashboard',
        content: 'Este es el menú para ir al Panel de Control. Aquí verás el resumen central rápido de ventas y progreso.',
        disableBeacon: true,
      },
      {
        target: '.tour-ordenes',
        content: 'En la sección de Órdenes puedes gestionar todos los trabajos actuales y pasados de la imprenta.',
      },
      {
        target: '.tour-nueva-orden',
        content: '¡Usa este botón para crear un Presupuesto nuevo para tu cliente de inmediato!',
      },
      {
        target: '.tour-buscador',
        content: '🔍 El buscador rastrea cualquier cliente o ticket. Si subiste un comprobante en Expedición, el escáner interno leerá la foto y también podrás ubicarlo buscando el código de envío aquí.',
      },
      {
        target: '.tour-ayuda',
        content: 'Siempre puedes volver a ver esta guía rápida interactiva tocando este botón en el menú izquierdo.',
      }
    ]);

    // Revisar LocalStorage
    const hasSeenTour = localStorage.getItem('presupuestos-ic-tourV1');
    if (!hasSeenTour) {
      setTimeout(() => setRun(true), 1500); // Dar un poco de tiempo para que carguen los botones
    }

    const startTour = () => setRun(true);
    window.addEventListener('start-system-tour', startTour);
    return () => window.removeEventListener('start-system-tour', startTour);
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = ['finished', 'skipped'];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('presupuestos-ic-tourV1', 'true');
    }
  };

  if (!isMounted) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton={false}
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      locale={{ back: 'Atrás', close: 'Cerrar', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar Tutorial' }}
      styles={{
        options: {
          primaryColor: '#2563eb', // Tailwind blue-600
          textColor: '#334155',    // Tailwind slate-700
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          borderRadius: '6px',
          fontWeight: 'bold',
        },
        buttonSkip: {
          color: '#64748b'
        }
      }}
    />
  );
}
