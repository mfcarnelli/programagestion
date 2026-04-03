'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, User, Building2, MapPin, FileText, Phone, Mail, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { updateCliente, deleteCliente, getClienteById } from '@/actions/clientes';
import AddressAutocomplete from '@/components/clientes/AddressAutocomplete';

export default function EditarClientePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [deleting, setDeleting] = useState(false);
    
    // Form State
    const [nombre, setNombre] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [documento, setDocumento] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [provincia, setProvincia] = useState('');
    const [notas, setNotas] = useState('');

    useEffect(() => {
        const fetchCliente = async () => {
            const data = await getClienteById(params.id);
            if (data) {
                setNombre(data.nombre);
                setEmpresa(data.empresa || '');
                setDocumento(data.documento || '');
                setEmail(data.email || '');
                setTelefono(data.telefono || '');
                setDireccion(data.direccion || '');
                setCiudad(data.ciudad || '');
                setProvincia(data.provincia || '');
                setNotas(data.notas || '');
            } else {
                alert('Cliente no encontrado');
                router.push('/clientes');
            }
            setLoadingData(false);
        };
        fetchCliente();
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            nombre, empresa, documento, email, telefono, direccion, ciudad, provincia, notas
        };

        const result = await updateCliente(params.id, data);
        
        if (result.success) {
            router.push(`/clientes/${params.id}`);
        } else {
            alert(result.error);
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) return;
        
        setDeleting(true);
        const result = await deleteCliente(params.id);
        
        if (result.success) {
            router.push('/clientes');
        } else {
            alert(result.error);
            setDeleting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/clientes/${params.id}`} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Editar Cliente</h1>
                        <p className="text-slate-500 mt-1">Modifica la información de contacto o facturación.</p>
                    </div>
                </div>

                <button 
                    onClick={handleDelete}
                    disabled={deleting || loading}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Eliminando...' : 'Eliminar Cliente'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                {/* Sección Datos Principales */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-blue-500" /> Información Principal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nombre Completo o Razón Social *</label>
                            <input 
                                required 
                                value={nombre} 
                                onChange={e => setNombre(e.target.value)} 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Empresa / Marca Comercial</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    value={empresa} 
                                    onChange={e => setEmpresa(e.target.value)} 
                                    type="text" 
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Documento (DNI / CUIT)</label>
                            <input 
                                value={documento} 
                                onChange={e => setDocumento(e.target.value)} 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Sección Contacto */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <Phone className="w-5 h-5 text-emerald-500" /> Medios de Contacto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    type="email" 
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Teléfono / WhatsApp</label>
                            <input 
                                value={telefono} 
                                onChange={e => setTelefono(e.target.value)} 
                                type="tel" 
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Sección Ubicación con API */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-indigo-500" /> Dirección de Facturación / Entrega
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Actualizar Dirección Automáticamente</label>
                            <AddressAutocomplete 
                                defaultValue={`${direccion} ${ciudad} ${provincia}`.trim()}
                                onAddressSelect={({ direccion, ciudad, provincia }) => {
                                    setDireccion(direccion);
                                    setCiudad(ciudad);
                                    setProvincia(provincia);
                                }} 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-1 md:col-span-3">
                                <label className="text-sm font-medium text-slate-700">Calle, Piso, Depto</label>
                                <input value={direccion} onChange={e => setDireccion(e.target.value)} type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Ciudad / Municipio</label>
                                <input value={ciudad} onChange={e => setCiudad(e.target.value)} type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Provincia / Estado</label>
                                <input value={provincia} onChange={e => setProvincia(e.target.value)} type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Sección Notas */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-amber-500" /> Notas Internas
                    </h3>
                    <textarea 
                        value={notas} 
                        onChange={e => setNotas(e.target.value)} 
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 h-24 resize-none" 
                    />
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
                    <Link href={`/clientes/${params.id}`} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                        Cancelar
                    </Link>
                    <button 
                        type="submit" 
                        disabled={loading || deleting}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
