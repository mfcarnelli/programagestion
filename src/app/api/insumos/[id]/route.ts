import { getInsumoById } from '@/actions/insumos';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const insumo = await getInsumoById(params.id);
        if (!insumo) {
            return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
        }
        return NextResponse.json({ insumo });
    } catch (error) {
        console.error('API Insumo Error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
