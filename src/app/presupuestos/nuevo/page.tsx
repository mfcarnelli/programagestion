'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, Calculator, Layers, Scissors, Check, FileText } from 'lucide-react';
import Link from 'next/link';
import { createPresupuesto } from '@/actions/presupuestos';
import CutVisualizer from '@/components/presupuestos/CutVisualizer';
import { getInsumos } from '@/actions/insumos';
import { getClientes } from '@/actions/clientes';
import { getConfiguracion } from '@/actions/configuracion';

export default function NuevoPresupuestoPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [tipoTrabajo, setTipoTrabajo] = useState('PAPEL');
    const [insumosPapel, setInsumosPapel] = useState<any[]>([]);
    const [insumosTextil, setInsumosTextil] = useState<any[]>([]);
    const [clientesDB, setClientesDB] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const insData = await getInsumos();
            setInsumosPapel(insData.filter((i: any) => i.tipo === 'PAPEL'));
            setInsumosTextil(insData.filter((i: any) => i.tipo === 'TEXTIL'));
            
            const cliData = await getClientes();
            setClientesDB(cliData);

            try {
                const conf = await getConfiguracion();
                setMargenGanancia(conf.margenGanancia);
                setImpuestos(conf.impuestos);
            } catch (error) {
                console.error('No se pudo cargar configuracion global', error);
            }
        };
        fetchData();
        
        if (status === 'authenticated' && session?.user?.rol === 'DISENO') {
            router.push('/');
        }
    }, [status, session, router]);

    // Datos Cliente
    const [clienteId, setClienteId] = useState('');
    const [clienteNombreManual, setClienteNombreManual] = useState(''); // Fallback o nuevo
    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState(100);

    // Datos Generales
    const [margenGanancia, setMargenGanancia] = useState(30);
    const [impuestos, setImpuestos] = useState(22); // IVA

    // PAPEL STATE
    const [insumoSeleccionado, setInsumoSeleccionado] = useState('');
    const [anchoFinal, setAnchoFinal] = useState(10);
    const [largoFinal, setLargoFinal] = useState(15);
    
    // FORMATO DE MÁQUINA
    const [anchoMaquina, setAnchoMaquina] = useState(35);
    const [largoMaquina, setLargoMaquina] = useState(50);

    const [costoPliego, setCostoPliego] = useState(150);
    const [anchoPliego, setAnchoPliego] = useState(70);
    const [largoPliego, setLargoPliego] = useState(100);
    const [mermaPorcentaje, setMermaPorcentaje] = useState(5);

    const handleInsumoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setInsumoSeleccionado(id);
        
        if (id) {
            const insumo = insumosPapel.find(i => i.id === id);
            if (insumo) {
                // Si el insumo tiene una cantidad superior por paquete, calculamos el costo por pliego (hoja individual)
                const costoBase = insumo.costoUnitario || 0;
                const cantidadPaquete = insumo.cantidadPaquete || 1;
                setCostoPliego(costoBase / cantidadPaquete);
                
                if (insumo.medidaAncho) setAnchoPliego(insumo.medidaAncho);
                if (insumo.medidaLargo) setLargoPliego(insumo.medidaLargo);
            }
        }
    };

    // TEXTIL STATE
    const [insumoTextilSeleccionado, setInsumoTextilSeleccionado] = useState('');
    const [costoPrenda, setCostoPrenda] = useState(5000);
    const [procesosDecoracion, setProcesosDecoracion] = useState(1500); // ej dtf, bordado
    const [cantidadColoresTextil, setCantidadColoresTextil] = useState(1);
    const [costoPorColorTextil, setCostoPorColorTextil] = useState(0);

    // CALCULOS PAPEL (CORTE DOBLE)
    // 1. Calcular cuántos "Trabajos Finales" entran en un "Pliego de Máquina"
    const calcularPiezasPorPasada = () => {
        if (!anchoFinal || !largoFinal || !anchoMaquina || !largoMaquina) return 0;
        const op1 = Math.floor(anchoMaquina / anchoFinal) * Math.floor(largoMaquina / largoFinal);
        const op2 = Math.floor(anchoMaquina / largoFinal) * Math.floor(largoMaquina / anchoFinal);
        return Math.max(op1, op2);
    };

    // 2. Calcular cuántos "Pliegos de Máquina" (cortes) salen de un "Pliego Madre"
    const calcularCortesDeMaquinaPorMadre = () => {
        if (!anchoMaquina || !largoMaquina || !anchoPliego || !largoPliego) return 0;
        const op1 = Math.floor(anchoPliego / anchoMaquina) * Math.floor(largoPliego / largoMaquina);
        const op2 = Math.floor(anchoPliego / largoMaquina) * Math.floor(largoPliego / anchoMaquina);
        return Math.max(op1, op2);
    };

    const piezasPorPasada = calcularPiezasPorPasada();
    const cortesMaquinaPorMadre = calcularCortesDeMaquinaPorMadre();
    const piezasTotalesPorPliegoMadre = piezasPorPasada * cortesMaquinaPorMadre;

    // Producción de la Prensa
    const pasadasNetas = piezasPorPasada > 0 ? (cantidad / piezasPorPasada) : 0;
    const pasadasConMerma = Math.ceil(pasadasNetas * (1 + (mermaPorcentaje / 100)));
    
    // Papel Físico a Comprar (Pliegos Madres)
    const pliegosMadreNetos = cortesMaquinaPorMadre > 0 ? pasadasConMerma / cortesMaquinaPorMadre : 0;
    const pliegosMadreComprar = Math.ceil(pliegosMadreNetos);
    const costoTotalPapel = pliegosMadreComprar * costoPliego;

    // PROCESOS GENERALES PAPEL
    const [cantidadColores, setCantidadColores] = useState(1);
    const [costoPlanchas, setCostoPlanchas] = useState(0); // Fijo por plancha/color
    const [costoPuestaMaquina, setCostoPuestaMaquina] = useState(1400); // Fijo por color
    const [costoColorMillar, setCostoColorMillar] = useState(550); // Precio del Insumo de millar
    
    // TROQUELADO
    const [costoPuestaTroquelado, setCostoPuestaTroquelado] = useState(0);
    const [costoMillarTroquelado, setCostoMillarTroquelado] = useState(0);

    const [otrosProcesos, setOtrosProcesos] = useState(1000); // Corte, laminado, etc

    const millaresImpresion = pasadasConMerma / 1000;
    
    // Cálculos Papel Desglosados
    const totalPlanchas = cantidadColores * costoPlanchas;
    const costoImpresion = totalPlanchas + (cantidadColores * costoPuestaMaquina) + (millaresImpresion * cantidadColores * costoColorMillar);
    const costoTroquelado = costoPuestaTroquelado + (millaresImpresion * costoMillarTroquelado);

    const handleInsumoTextilChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setInsumoTextilSeleccionado(id);
        
        if (id) {
            const insumo = insumosTextil.find(i => i.id === id);
            if (insumo) {
                setCostoPrenda(insumo.costoUnitario || 0);
            }
        }
    };

    // CONSOLIDACION
    const costoMateriales = tipoTrabajo === 'PAPEL' ? costoTotalPapel : (costoPrenda * cantidad);
    const costoProcesos = tipoTrabajo === 'PAPEL' ? (costoImpresion + costoTroquelado + otrosProcesos) : ((procesosDecoracion + (cantidadColoresTextil * costoPorColorTextil)) * cantidad);
    const costoTotalPrevio = costoMateriales + costoProcesos;

    const ganancia = costoTotalPrevio * (margenGanancia / 100);
    const subtotal = costoTotalPrevio + ganancia;
    const montoImpuestos = subtotal * (impuestos / 100);
    const precioFinal = Math.ceil(subtotal + montoImpuestos);
    const precioUnitario = cantidad > 0 ? precioFinal / cantidad : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            clienteId: clienteId || undefined,
            clienteNombre: clienteId ? clientesDB.find(c => c.id === clienteId)?.nombre : clienteNombreManual,
            descripcion,
            cantidad,
            tipoTrabajo,
            costoMateriales,
            costoProcesos,
            costoTotal: costoTotalPrevio,
            margenGanancia,
            impuestos,
            precioFinal,
            observaciones: 'Presupuesto generado con la calculadora interactiva.'
        };

        const result = await createPresupuesto(data);

        if (result.success) {
            router.push('/presupuestos');
        } else {
            alert(result.error);
            setLoading(false);
        }
    };

    if (status === 'loading' || (session && session.user?.rol === 'DISENO')) {
        return <div className="p-8 flex justify-center items-center h-full text-slate-500">Verificando accesos...</div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* PANEL IZQUIERDO: CONFIGURADOR */}
            <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/presupuestos" className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Calculador de Presupuesto</h1>
                        <p className="text-slate-500 mt-1">Cotiza trabajos de imprenta y textil con gran precisión.</p>
                    </div>
                </div>

                <form id="presupuesto-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* SECCION 1: DATOS GENERALES */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Datos del Primer Nivel
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Cliente *</label>
                                <div className="flex gap-2">
                                    <select 
                                        value={clienteId} 
                                        onChange={e => {
                                            setClienteId(e.target.value);
                                            setClienteNombreManual('');
                                        }} 
                                        className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-slate-300 bg-white"
                                    >
                                        <option value="">-- Seleccionar o Crear Nuevo --</option>
                                        {clientesDB.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre} {c.empresa ? `(${c.empresa})` : ''}</option>
                                        ))}
                                    </select>
                                    
                                    {!clienteId && (
                                        <input 
                                            required={!clienteId} 
                                            value={clienteNombreManual} 
                                            onChange={e => setClienteNombreManual(e.target.value)} 
                                            type="text" 
                                            className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-slate-300" 
                                            placeholder="Nombre del nuevo cliente (se creará auto.)" 
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Descripción del Trabajo *</label>
                                <input required value={descripcion} onChange={e => setDescripcion(e.target.value)} type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Ej: Tarjetas personales doble faz" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Cantidad Total a Entregar *</label>
                                <input required value={cantidad} onChange={e => setCantidad(Number(e.target.value))} type="number" min="1" className="w-full px-4 py-2 rounded-lg border border-slate-300 text-lg font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* SECCION 2: TIPO DE TRABAJO */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-500" /> Selección de Producción
                        </h2>
                        <div className="flex gap-4 mb-6">
                            <button type="button" onClick={() => setTipoTrabajo('PAPEL')} className={`flex-1 p-4 rounded-xl border-2 transition-all ${tipoTrabajo === 'PAPEL' ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                Papel / Gráfica
                            </button>
                            <button type="button" onClick={() => setTipoTrabajo('TEXTIL')} className={`flex-1 p-4 rounded-xl border-2 transition-all ${tipoTrabajo === 'TEXTIL' ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                Textil / Estampado
                            </button>
                        </div>

                        {/* FORMULARIO PAPEL */}
                        {tipoTrabajo === 'PAPEL' && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Seleccionar Sustrato (Papel)</label>
                                    <select 
                                        value={insumoSeleccionado}
                                        onChange={handleInsumoChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white"
                                    >
                                        <option value="">-- Ingreso Manual o Personalizado --</option>
                                        {insumosPapel.map((insumo) => {
                                            const resCostoPliego = (insumo.costoUnitario || 0) / (insumo.cantidadPaquete || 1);
                                            return (
                                                <option key={insumo.id} value={insumo.id}>
                                                    {insumo.nombre} ({insumo.medidaAncho}x{insumo.medidaLargo}cm) - ${resCostoPliego.toFixed(2)} c/u
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">1. Pliego Madre Utilizado (cm)</label>
                                        <div className="flex gap-2">
                                            <input value={anchoPliego} onChange={e => setAnchoPliego(Number(e.target.value))} type="number" step="0.1" className="w-full px-3 py-2 rounded border border-slate-300" placeholder="Ancho" title="Ancho Pliego Madre" />
                                            <span className="self-center font-bold text-slate-400">x</span>
                                            <input value={largoPliego} onChange={e => setLargoPliego(Number(e.target.value))} type="number" step="0.1" className="w-full px-3 py-2 rounded border border-slate-300" placeholder="Largo" title="Largo Pliego Madre" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">2. Formato de Máquina (Corte, cm)</label>
                                        <div className="flex gap-2">
                                            <input value={anchoMaquina} onChange={e => setAnchoMaquina(Number(e.target.value))} type="number" step="0.1" className="w-full px-3 py-2 rounded border-emerald-400 bg-emerald-50 focus:ring-emerald-500 font-semibold text-emerald-900" placeholder="Ancho Máquina" title="Ancho Máquina" />
                                            <span className="self-center font-bold text-slate-400">x</span>
                                            <input value={largoMaquina} onChange={e => setLargoMaquina(Number(e.target.value))} type="number" step="0.1" className="w-full px-3 py-2 rounded border-emerald-400 bg-emerald-50 focus:ring-emerald-500 font-semibold text-emerald-900" placeholder="Largo Máquina" title="Largo Máquina" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">3. Medida de Trabajo Final (cm)</label>
                                        <div className="flex gap-2">
                                            <input value={anchoFinal} onChange={e => setAnchoFinal(Number(e.target.value))} type="number" step="0.1" className="w-full px-3 py-2 rounded border border-slate-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Ancho Final" title="Ancho Final" />
                                            <span className="self-center font-bold text-slate-400">x</span>
                                            <input value={largoFinal} onChange={e => setLargoFinal(Number(e.target.value))} type="number" step="0.1" className="w-full px-3 py-2 rounded border border-slate-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Largo Final" title="Largo Final" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Costos y Merma</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <input value={costoPliego} onChange={e => setCostoPliego(Number(e.target.value))} type="number" step="0.01" className="w-full px-3 py-2 rounded border border-slate-300 text-sm" placeholder="Costo Madre" title="Costo Madre ($)" />
                                                <p className="text-[10px] text-slate-500 mt-1">$ Costo Madre</p>
                                            </div>
                                            <div className="flex-1">
                                                <input value={mermaPorcentaje} onChange={e => setMermaPorcentaje(Number(e.target.value))} type="number" step="1" className="w-full px-3 py-2 rounded border border-slate-300 text-sm" placeholder="% Merma" title="Merma (%)" />
                                                <p className="text-[10px] text-slate-500 mt-1">% Merma</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-100/50 p-4 rounded-lg border border-blue-200 space-y-2">
                                    <h3 className="font-semibold text-blue-800 flex items-center gap-2"><Scissors className="w-4 h-4" /> Rendimiento Calculado</h3>
                                    <div className="flex justify-between text-sm text-blue-900 border-b border-blue-200 pb-2">
                                        <span>Formatos Finales por Pasada (Máquina):</span>
                                        <span className="font-bold">{piezasPorPasada} piezas final/pasada</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-blue-900 border-b border-blue-200 pb-2">
                                        <span>Formatos de Máquina en 1 Pliego Madre:</span>
                                        <span className="font-bold">{cortesMaquinaPorMadre} cortes/madre</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-blue-900 border-b border-blue-200 pb-2">
                                        <span className="font-semibold">Piezas Totales por cada Pliego Madre:</span>
                                        <span className="font-bold">{piezasTotalesPorPliegoMadre} piezas/madre</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-blue-900 border-b border-blue-200 pb-2">
                                        <span>Pasadas (Impresiones) a realizar + {mermaPorcentaje}% merma:</span>
                                        <span className="font-bold">{pasadasConMerma} impresiones</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-blue-900">
                                        <span>Pliegos Madres a comprar (Total papel):</span>
                                        <span className="font-bold">{pliegosMadreComprar} pliegos enteros</span>
                                    </div>
                                </div>

                                <div className="space-y-6 mt-4">
                                    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                                        <h3 className="text-sm font-semibold text-slate-700 mb-2">1. Del Pliego Madre al Formato de Máquina</h3>
                                        <CutVisualizer 
                                            anchoPliego={anchoPliego} 
                                            largoPliego={largoPliego} 
                                            anchoFinal={anchoMaquina} 
                                            largoFinal={largoMaquina} 
                                        />
                                    </div>
                                    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                                        <h3 className="text-sm font-semibold text-slate-700 mb-2">2. Del Formato de Máquina a Trabajos Finales</h3>
                                        <CutVisualizer 
                                            anchoPliego={anchoMaquina} 
                                            largoPliego={largoMaquina} 
                                            anchoFinal={anchoFinal} 
                                            largoFinal={largoFinal} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Colores a Imprimir</label>
                                        <input value={cantidadColores} onChange={e => setCantidadColores(Number(e.target.value))} type="number" min="1" step="1" className="w-full px-3 py-2 rounded border border-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Costo Planchas ($ / color)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input value={costoPlanchas} onChange={e => setCostoPlanchas(Number(e.target.value))} type="number" step="0.01" className="w-full pl-8 pr-3 py-2 rounded border border-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Costo Puesta Máquina ($ / color)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input value={costoPuestaMaquina} onChange={e => setCostoPuestaMaquina(Number(e.target.value))} type="number" step="0.01" className="w-full pl-8 pr-3 py-2 rounded border border-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Costo Millar Imp. ($ / pasada)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input value={costoColorMillar} onChange={e => setCostoColorMillar(Number(e.target.value))} type="number" step="0.01" className="w-full pl-8 pr-3 py-2 rounded border border-slate-300" />
                                        </div>
                                    </div>
                                    
                                    <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-200 mt-2">
                                        <h3 className="text-md font-semibold text-slate-800 mb-3">Troquelado y Terminaciones</h3>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Costo Puesta Troquelado ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input value={costoPuestaTroquelado} onChange={e => setCostoPuestaTroquelado(Number(e.target.value))} type="number" step="0.01" className="w-full pl-8 pr-3 py-2 rounded border border-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Costo Millar Troquelado ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input value={costoMillarTroquelado} onChange={e => setCostoMillarTroquelado(Number(e.target.value))} type="number" step="0.01" className="w-full pl-8 pr-3 py-2 rounded border border-slate-300" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700">Otros Procesos (Corte, Laminado...)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input value={otrosProcesos} onChange={e => setOtrosProcesos(Number(e.target.value))} type="number" step="0.01" className="w-full pl-8 pr-3 py-2 rounded border border-slate-300" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 md:col-span-2 mt-2 bg-slate-100 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-600">Total Impresión ({cantidadColores} colores):</span>
                                            <span className="font-bold text-slate-800">${costoImpresion.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-600">Total Troquelado ({millaresImpresion.toFixed(2)} millares):</span>
                                            <span className="font-bold text-slate-800">${costoTroquelado.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-slate-300 pt-2">
                                            <span className="text-sm font-bold text-slate-700">Costos de Procesos Subtotal:</span>
                                            <span className="font-black text-blue-700">${(costoImpresion + costoTroquelado + otrosProcesos).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FORMULARIO TEXTIL */}
                        {tipoTrabajo === 'TEXTIL' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="space-y-2 col-span-1 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700">Seleccionar Sustrato (Textil / Prenda)</label>
                                        <select 
                                            value={insumoTextilSeleccionado}
                                            onChange={handleInsumoTextilChange}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white"
                                        >
                                            <option value="">-- Ingreso Manual o Personalizado --</option>
                                            {insumosTextil.map((insumo) => (
                                                <option key={insumo.id} value={insumo.id}>
                                                    {insumo.nombre} {insumo.colores ? `(${insumo.colores})` : ''} - ${(insumo.costoUnitario || 0).toFixed(2)} c/u
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Costo Base de Prenda Unitaria ($)</label>
                                        <input value={costoPrenda} onChange={e => setCostoPrenda(Number(e.target.value))} type="number" step="0.01" className="w-full px-3 py-2 rounded border border-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Otros Costos Decoración (DTF, etc) x Prenda</label>
                                        <input value={procesosDecoracion} onChange={e => setProcesosDecoracion(Number(e.target.value))} type="number" step="0.01" className="w-full px-3 py-2 rounded border border-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Cantidad de Colores / Tintas</label>
                                        <input value={cantidadColoresTextil} onChange={e => setCantidadColoresTextil(Number(e.target.value))} type="number" min="0" step="1" className="w-full px-3 py-2 rounded border border-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Costo por Color x Prenda ($)</label>
                                        <input value={costoPorColorTextil} onChange={e => setCostoPorColorTextil(Number(e.target.value))} type="number" step="0.01" className="w-full px-3 py-2 rounded border border-slate-300" />
                                    </div>
                                </div>
                                <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-600">Total Decoración por Prenda:</span>
                                        <span className="font-bold text-slate-800">${(procesosDecoracion + (cantidadColoresTextil * costoPorColorTextil)).toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-slate-500">Los costos se multiplicarán por la cantidad total ({cantidad} unidades).</p>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* SECCION 3: RENTABILIDAD */}
                    {session?.user?.rol === 'ADMIN' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-emerald-500" /> Rentabilidad y Mark-up
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Margen de Ganancia (%)</label>
                                <input value={margenGanancia} onChange={e => setMargenGanancia(Number(e.target.value))} type="number" step="0.1" className="w-full px-4 py-2 text-emerald-700 font-bold bg-emerald-50 rounded-lg border border-emerald-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Impuestos / IVA Aplicado (%)</label>
                                <input value={impuestos} onChange={e => setImpuestos(Number(e.target.value))} type="number" step="0.1" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                            </div>
                        </div>
                    </div>
                    )}

                </form>
            </div>

            {/* PANEL DERECHO: RESUMEN FINANCIERO FIJO */}
            <div className="w-full lg:w-96">
                <div className="sticky top-8 bg-slate-900 rounded-2xl p-6 shadow-xl text-white">
                    <h2 className="text-xl font-bold border-b border-slate-700 pb-4 mb-4 text-slate-100">Resumen Financiero</h2>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-slate-400">
                            <span>Costo Materiales:</span>
                            <span className="font-medium text-slate-200">${costoMateriales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Costo Procesos:</span>
                            <span className="font-medium text-slate-200">${costoProcesos.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300 border-t border-slate-700 pt-3">
                            <span>Costo Real Total:</span>
                            <span className="font-bold text-white">${costoTotalPrevio.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-emerald-400 pt-3">
                            <span>Ganancia Estimada:</span>
                            <span className="font-bold">+ ${ganancia.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-slate-400 pt-3 border-t border-slate-700">
                            <span>Subtotal:</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Impuestos:</span>
                            <span className="font-medium">+ ${montoImpuestos.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl mb-6">
                        <div className="text-sm text-slate-400 mb-1">Precio Final Cliente</div>
                        <div className="text-4xl font-black text-blue-400">${precioFinal.toFixed(2)}</div>
                        <div className="text-sm text-slate-400 mt-2">
                            Unitario: <span className="text-white font-semibold">${precioUnitario.toFixed(2)}</span> ({cantidad} u.)
                        </div>
                    </div>

                    <button
                        type="submit"
                        form="presupuesto-form"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-lg shadow-blue-900/50 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                    >
                        <Check className="w-6 h-6" />
                        <span>{loading ? 'Generando...' : 'Aprobar Presupuesto'}</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
