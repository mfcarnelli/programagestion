'use client';

interface CutVisualizerProps {
    anchoPliego: number;
    largoPliego: number;
    anchoFinal: number;
    largoFinal: number;
}

export default function CutVisualizer({ anchoPliego, largoPliego, anchoFinal, largoFinal }: CutVisualizerProps) {
    if (!anchoPliego || !largoPliego || !anchoFinal || !largoFinal) {
        return null;
    }

    // Calculamos las dos opciones
    // Opción 1: Sin girar (Ancho sobre Ancho, Largo sobre Largo)
    const cols1 = Math.floor(anchoPliego / anchoFinal);
    const rows1 = Math.floor(largoPliego / largoFinal);
    const total1 = cols1 * rows1;
    const desperdicio1 = (anchoPliego * largoPliego) - (total1 * anchoFinal * largoFinal);

    // Opción 2: Girado (Ancho sobre Largo, Largo sobre Ancho)
    const cols2 = Math.floor(anchoPliego / largoFinal);
    const rows2 = Math.floor(largoPliego / anchoFinal);
    const total2 = cols2 * rows2;
    const desperdicio2 = (anchoPliego * largoPliego) - (total2 * anchoFinal * largoFinal);

    // Seleccionamos la mejor opción (la que da más cortes)
    // Si dan los mismos cortes, elegimos la de menor desperdicio
    const isGiroBetter = total2 > total1 || (total2 === total1 && desperdicio2 < desperdicio1);

    const bestCols = isGiroBetter ? cols2 : cols1;
    const bestRows = isGiroBetter ? rows2 : rows1;
    const bestTotal = isGiroBetter ? total2 : total1;
    
    const cutWidth = isGiroBetter ? largoFinal : anchoFinal;
    const cutHeight = isGiroBetter ? anchoFinal : largoFinal;

    // Calculamos porcentajes de desperdicio
    const areaTotal = anchoPliego * largoPliego;
    const areaCortes = bestTotal * anchoFinal * largoFinal;
    const porcentajeDesperdicio = ((areaTotal - areaCortes) / areaTotal) * 100;

    // Para visualizar, necesitamos una escala. Escalamos el pliego madre a un máximo de 300px
    const MAX_SIZE = 300;
    const isPortrait = largoPliego > anchoPliego;
    
    const displayHeight = isPortrait ? MAX_SIZE : (largoPliego / anchoPliego) * MAX_SIZE;
    const displayWidth = isPortrait ? (anchoPliego / largoPliego) * MAX_SIZE : MAX_SIZE;

    const scale = displayWidth / anchoPliego;

    return (
        <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                Mapa de Corte Sugerido
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div 
                    className="relative bg-red-100 border-2 border-red-300 mx-auto"
                    style={{ 
                        width: `${displayWidth}px`, 
                        height: `${displayHeight}px` 
                    }}
                >
                    {/* Dibujamos los cortes */}
                    <div className="absolute top-0 left-0 w-full h-full p-px">
                        {Array.from({ length: bestRows }).map((_, rowIndex) => (
                            Array.from({ length: bestCols }).map((_, colIndex) => (
                                <div 
                                    key={`${rowIndex}-${colIndex}`}
                                    className="absolute bg-emerald-100 border border-emerald-500 flex items-center justify-center"
                                    style={{
                                        left: `${colIndex * cutWidth * scale}px`,
                                        top: `${rowIndex * cutHeight * scale}px`,
                                        width: `${cutWidth * scale}px`,
                                        height: `${cutHeight * scale}px`,
                                    }}
                                >
                                    <span className="text-[10px] text-emerald-800 font-medium">
                                        {cutWidth}x{cutHeight}
                                    </span>
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-sm text-slate-500">Total de Cortes Posibles</div>
                        <div className="text-2xl font-bold text-slate-800">{bestTotal} piezas</div>
                    </div>
                    
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-sm text-red-600">Desperdicio (Papel Sobrante)</div>
                        <div className="text-xl font-bold text-red-700">{porcentajeDesperdicio.toFixed(1)}%</div>
                        <div className="text-xs text-red-500 mt-1">
                            El área en <span className="inline-block w-3 h-3 bg-red-100 border border-red-300 mx-1 align-middle"></span> representa el desperdicio.
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded border border-blue-100">
                        <strong>Nota de Orientación:</strong> Los cortes ({anchoFinal}x{largoFinal} cm) se han posicionado como <strong>{cutWidth}x{cutHeight} cm</strong> para aprovechar mejor el pliego madre ({anchoPliego}x{largoPliego} cm).
                    </div>
                </div>
            </div>
        </div>
    );
}
