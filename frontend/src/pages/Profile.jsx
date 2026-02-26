import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No has iniciado sesión.');

                const res = await fetch('http://localhost:3000/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Error al cargar perfil.');
                
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="text-center pt-24">Cargando perfil...</div>;
    if (error) return <div className="text-center pt-24 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pt-24">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-[var(--color-brand-green)] p-6 text-white">
                    <h1 className="text-2xl font-bold">Mi Perfil</h1>
                    <p className="opacity-90">{profile.email}</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
                            👤
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 capitalize">{profile.role === 'citizen' ? 'Ciudadano' : profile.role}</p>
                        </div>
                        <div className="ml-auto">
                           {profile.is_verified ? (
                               <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Verificado</span>
                           ) : (
                               <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">No Verificado</span>
                           )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuario</label>
                            <p className="text-gray-900 dark:text-gray-200">{profile.username}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cédula</label>
                            <p className="text-gray-900 dark:text-gray-200">{profile.nationality_type}-{profile.identification_number}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</label>
                            <p className="text-gray-900 dark:text-gray-200">{profile.phone || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Miembro desde</label>
                            <p className="text-gray-900 dark:text-gray-200">
                                {profile.created_at ? format(new Date(profile.created_at), 'dd MMM yyyy', { locale: es }) : '-'}
                            </p>
                        </div>

                        {profile.role === 'consultant' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Organización</label>
                                    <p className="text-gray-900 dark:text-gray-200">{profile.organization || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Licencia</label>
                                    <p className="text-gray-900 dark:text-gray-200">{profile.license_number || '-'}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
