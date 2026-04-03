'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Phone, MapPin, Calendar, HeartPulse, Building2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { createUsuario, updateUsuario } from '@/actions/usuarios';

export default function UsuarioForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [nombre, setNombre] = useState(initialData?.nombre || '');
    const [username, setUsername] = useState(initialData?.username || '');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState(initialData?.rol || 'VENDEDOR');
    const [activo, setActivo] = useState(initialData ? initialData.activo : true);
    
    // Datos Personales
    const [celular, setCelular] = useState(initialData?.celular || '');
    const [direccion, setDireccion] = useState(initialData?.direccion || '');
    const [fechaNacimiento, setFechaNacimiento] = useState(
        initialData?.fechaNacimiento ? new Date(initialData.fechaNacimiento).toISOString().split('T')[0] : ''
    );
    const [mutualista, setMutualista] = useState(initialData?.mutualista || '');
    const [porcentajeComision, setPorcentajeComision] = useState(initialData?.porcentajeComision || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            nombre,
            username,
            password,
            rol,
            activo,
            celular,
            direccion,
            fechaNacimiento,
            mutualista,
            porcentajeComision
        };

        let result;
        if (initialData?.id) {
            result = await updateUsuario(initialData.id, data);
        } else {
            result = await createUsuario(data);
        }
        
        if (result.success) {
            router.push('/admin/usuarios');
        } else {
            alert(result.error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            {/* Sección Datos de Acceso */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-5 h-5 text-indigo-500" /> Accesos y Permisos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nombre Completo *</label>
                        <input 
                            required 
                            value={nombre} 
                            onChange={e => setNombre(e.target.value)} 
                            type="text" 
                            placeholder="Ej: Juan Pérez"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nombre de Usuario *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                required 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                type="text" 
                                placeholder="jperez"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Contraseña {initialData ? '(Dejar en blanco para no cambiar)' : '*'}</label>
                        <input 
                            required={!initialData}
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            type="password" 
                            placeholder="••••••••"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Rol *</label>
                        <select 
                            value={rol}
                            onChange={e => setRol(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ADMIN">Administrador</option>
                            <option value="VENDEDOR">Vendedor</option>
                            <option value="DISENO">Diseño</option>
                            <option value="OFFSET">Offset</option>
                            <option value="SERIGRAFIA">Serigrafía</option>
                            <option value="EXPEDICION">Expedición</option>
                        </select>
                    </div>

                    <div className="space-y-2 flex items-center mt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={activo}
                                onChange={e => setActivo(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Usuario Activo en el Sistema</span>
                        </label>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Sección Datos Personales */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-emerald-500" /> Perfil y Contacto de Emergencia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Celular</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                value={celular} 
                                onChange={e => setCelular(e.target.value)} 
                                type="tel" 
                                placeholder="+54 9..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Dirección</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                value={direccion} 
                                onChange={e => setDireccion(e.target.value)} 
                                type="text" 
                                placeholder="Calle, Ciudad..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                value={fechaNacimiento} 
                                onChange={e => setFechaNacimiento(e.target.value)} 
                                type="date" 
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mutualista / Seg. Médico</label>
                        <div className="relative">
                            <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                value={mutualista} 
                                onChange={e => setMutualista(e.target.value)} 
                                type="text" 
                                placeholder="Emergencia médica y nro afiliado..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Sección Comercial */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-orange-500" /> Perfil Comercial
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Porcentaje de Comisión (%)</label>
                        <input 
                            value={porcentajeComision} 
                            onChange={e => setPorcentajeComision(parseFloat(e.target.value) || 0)} 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="Ej: 5"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                        />
                        <p className="text-xs text-slate-500 mt-1">Este porcentaje se aplica sobre el subtotal sin impuestos.</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
                <Link href="/admin/usuarios" className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                    Cancelar
                </Link>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    <span>{loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Usuario')}</span>
                </button>
            </div>
        </form>
    );
}
