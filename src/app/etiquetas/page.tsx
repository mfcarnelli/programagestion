'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Printer, Upload, Image as ImageIcon, Search } from 'lucide-react';
import { getClientes } from '@/actions/clientes';

export default function EtiquetasPage() {
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [clientes, setClientes] = useState<any[]>([]);
    const [filteredClientes, setFilteredClientes] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState({
        sr: '',
        fecha: new Date().toLocaleDateString('es-UY'),
        telCel: '',
        empresa: '',
        rut: '',
        direccion: '',
        ciudad: 'Montevideo',
        departamento: 'Montevideo',
        cantidad: 1
    });

    useEffect(() => {
        const fetchClientes = async () => {
            const clientesData = await getClientes();
            setClientes(clientesData);
        };
        fetchClientes();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBgImage(url);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'sr') {
            if (value.length > 0) {
                const filtered = clientes.filter(c => c.nombre.toLowerCase().includes(value.toLowerCase()));
                setFilteredClientes(filtered);
                setShowDropdown(true);
            } else {
                setShowDropdown(false);
            }
        }
    };

    const handleSelectCliente = (cliente: any) => {
        setData(prev => ({
            ...prev,
            sr: cliente.nombre,
            telCel: cliente.telefono || '',
            empresa: cliente.empresa || '',
            rut: cliente.documento || '',
            direccion: cliente.direccion || '',
            ciudad: cliente.ciudad || 'Montevideo',
            departamento: cliente.provincia || 'Montevideo'
        }));
        setShowDropdown(false);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto print:p-0 print:m-0 print:max-w-none">
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Imprimir Etiquetas</h1>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Printer className="w-5 h-5" />
                    Imprimir
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:gap-0">
                {/* Formulario - Oculto al imprimir */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 print:hidden space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Datos del Envío</h2>
                    
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Imagen Base (Fondo de Plantilla)</label>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600 w-full justify-center">
                                <Upload className="w-4 h-4" />
                                Subir Plantilla (JPG/PNG)
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                            {bgImage && (
                                <button onClick={() => setBgImage(null)} className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200">
                                    Quitar
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Sube la plantilla de Carnelli (tamaño recomendado: proporción cuadrada) para ubicar correctamente los textos.</p>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>

                    <div className="grid grid-cols-2 gap-4 relative">
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Sr./Sra. (Cliente)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    name="sr" 
                                    value={data.sr} 
                                    onChange={handleChange} 
                                    onFocus={() => {
                                        if (data.sr.length > 0 && filteredClientes.length > 0) setShowDropdown(true);
                                    }}
                                    className="w-full pl-9 pr-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" 
                                    placeholder="Buscar cliente..."
                                    autoComplete="off"
                                />
                            </div>
                            
                            {/* Autocomplete Dropdown */}
                            {showDropdown && filteredClientes.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredClientes.map(cliente => (
                                        <li 
                                            key={cliente.id} 
                                            onClick={() => handleSelectCliente(cliente)}
                                            className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                                        >
                                            <div className="font-medium text-slate-800 dark:text-white">{cliente.nombre}</div>
                                            {cliente.empresa && <div className="text-xs text-slate-500 font-semibold">{cliente.empresa}</div>}
                                            {cliente.direccion && <div className="text-xs text-slate-400 truncate">{cliente.direccion}</div>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Fecha</label>
                            <input type="text" name="fecha" value={data.fecha} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Tel. / Cel.</label>
                            <input type="text" name="telCel" value={data.telCel} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Empresa / Nombre Adicional</label>
                            <input type="text" name="empresa" value={data.empresa} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">RUT / Documento</label>
                            <input type="text" name="rut" value={data.rut} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Dirección</label>
                            <input type="text" name="direccion" value={data.direccion} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Ciudad</label>
                            <input type="text" name="ciudad" value={data.ciudad} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Departamento</label>
                            <input type="text" name="departamento" value={data.departamento} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Cantidad de Etiquetas</label>
                            <input type="number" min="1" name="cantidad" value={data.cantidad} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-700 dark:text-white" />
                        </div>
                    </div>
                </div>

                {/* Previsualización y área de impresión */}
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 print:hidden w-full text-left">Vista Previa (110 x 110 mm)</h2>
                    
                    <div className="bg-slate-100 border border-slate-300 dark:border-slate-700 p-8 rounded-lg w-full flex flex-col items-center gap-8 print:p-0 print:gap-0 print:border-none print:bg-transparent overflow-auto print-wrapper">
                        {Array.from({ length: Number(data.cantidad) || 1 }).map((_, i) => {
                            const total = Number(data.cantidad) || 1;
                            const bultoText = total === 1 ? '1' : `${i + 1}/${total}`;
                            
                            return (
                                <div 
                                    key={i}
                                    className="bg-white relative overflow-hidden print-container shadow-lg print:shadow-none"
                                    style={{ 
                                        width: '110mm', 
                                        height: '110mm',
                                        minWidth: '110mm',
                                        minHeight: '110mm',
                                        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                                        backgroundSize: 'contain',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        pageBreakInside: 'avoid',
                                        // Usa font sans-serif básica para impresión clara
                                        fontFamily: 'Arial, Helvetica, sans-serif'
                                    }}
                                >
                                    {/* Si no hay fondo, mostramos una guía */}
                                    {!bgImage && (
                                        <div className="absolute inset-0 border-2 border-dashed border-slate-300 flex items-center justify-center print:border-none">
                                            <span className="text-slate-400 flex flex-col items-center gap-2 text-center p-4">
                                                <ImageIcon className="w-8 h-8 opacity-50" />
                                                <span>Sin plantilla de fondo</span>
                                                <span className="text-xs">(Sube la imagen para ubicar los textos correctamente)</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* Área de campos de texto */}
                                    <div className="absolute top-[26mm] bottom-[32mm] left-0 right-0 px-[10mm] text-black flex flex-col justify-center">
                                        <div className="flex justify-between items-start text-[13pt] font-bold leading-none mb-[1.5mm]">
                                            <div className="flex items-start gap-1">
                                                <span className="text-gray-700 font-normal mr-1">Sr.:</span>
                                                <span className="whitespace-pre-wrap max-w-[55mm] leading-[1.1] text-[15pt]">{data.sr}</span>
                                            </div>
                                            <div className="text-[12pt] font-normal whitespace-nowrap">{data.fecha}</div>
                                        </div>

                                        <div className="flex items-center text-[13pt] font-bold leading-none mb-[1.5mm]">
                                            <span className="text-gray-700 font-normal mr-2 whitespace-nowrap">Tel. / Cel:</span>
                                            <span className="text-[15pt]">{data.telCel}</span>
                                        </div>

                                        <div className="text-[18pt] font-bold text-center leading-none mb-[1.5mm] tracking-wide min-h-[16px]">
                                            {data.empresa}
                                        </div>

                                        {data.rut && (
                                            <div className="text-[14pt] font-bold text-center leading-none mb-[1.5mm] tracking-wide min-h-[16px]">
                                                RUT: {data.rut}
                                            </div>
                                        )}

                                        <div className="flex items-start gap-1 text-[13pt] font-bold mb-[1.5mm]">
                                            <span className="text-gray-700 font-normal mr-1">Dirección:</span>
                                            <span className="whitespace-pre-line leading-[1.1] max-w-[70mm] text-[15pt]">{data.direccion}</span>
                                        </div>

                                        <div className="flex items-center text-[13pt] font-bold leading-none mb-[1.5mm]">
                                            <span className="text-gray-700 font-normal mr-2">Ciudad:</span>
                                            <span className="text-[15pt]">{data.ciudad}</span>
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-wrap items-center text-[13pt] font-bold leading-none max-w-[60mm]">
                                                <span className="text-gray-700 font-normal mr-2">Depto:</span>
                                                <span className="text-[15pt]">{data.departamento}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bulto centrado abs respecto a la etiqueta principal */}
                                    <div className="absolute right-[2mm] bottom-[11mm] w-[48mm] flex justify-center items-center text-black">
                                        <span className="text-[24pt] font-bold tracking-widest">{bultoText}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-4 print:hidden text-center max-w-sm">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Instrucciones de impresión:</strong>
                        </p>
                        <ul className="text-xs text-slate-500 mt-2 list-disc text-left pl-4 space-y-1">
                            <li>Elige "Guardar como PDF" o tu impresora configurada.</li>
                            <li>En ajustes, selecciona Tamaño de papel: <strong>Personalizado (110x110 mm)</strong>.</li>
                            <li>Ajusta Márgenes a <strong>"Ninguno" (None)</strong>.</li>
                            <li>Activa <strong>"Gráficos de fondo"</strong> si quieres imprimir la plantilla.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page {
                        size: 110mm 110mm;
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    .print-wrapper, .print-wrapper * {
                        visibility: visible !important;
                    }
                    .print-wrapper {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        display: block !important;
                    }
                    .print-container {
                        position: relative !important;
                        width: 110mm !important;
                        height: 110mm !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        page-break-inside: avoid !important;
                    }
                    .print-container + .print-container {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                }
            `}} />
        </div>
    );
}
