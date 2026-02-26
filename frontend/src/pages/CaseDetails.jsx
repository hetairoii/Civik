import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCaseDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:3000/api/denuncias/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    if (res.status === 403) throw new Error("No tienes permiso para ver este caso.");
                    if (res.status === 404) throw new Error("Caso no encontrado.");
                    throw new Error("Error al cargar los detalles del caso.");
                }

                const data = await res.json();
                setCaseData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCaseDetails();
    }, [id]);

    if (loading) return <div className="text-center pt-24">Cargando detalles...</div>;
    
    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-red-500 text-xl font-bold mb-4">{error}</div>
            <Button onClick={() => navigate('/cases')} variant="primary">Volver a Casos</Button>
        </div>
    );

    if (!caseData) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                
                {/* Header */}
                <div className="bg-[var(--color-brand-green)] p-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Detalles de la Denuncia</h1>
                        <p className="text-green-100 text-sm mt-1">ID: {caseData.id}</p>
                    </div>
                    <Button 
                        onClick={() => navigate('/cases')} 
                        variant="secondary" 
                        className="bg-white/20 hover:bg-white/30 text-white border-transparent"
                    >
                        ← Volver a Casos
                    </Button>
                </div>

                <div className="p-8 grid gap-8 md:grid-cols-2">
                    
                    {/* Column 1: Case Info */}
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Información del Caso
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-sm text-gray-500 dark:text-gray-400">Estado Actual</span>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1
                                        ${caseData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${caseData.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                                        ${caseData.status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
                                        ${caseData.status === 'dismissed' ? 'bg-red-100 text-red-800' : ''}
                                    `}>
                                        {caseData.status.toUpperCase().replace('_', ' ')}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</span>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        {format(new Date(caseData.created_at), 'PPP pp', { locale: es })}
                                    </p>
                                </div>

                                <div>
                                    <span className="block text-sm text-gray-500 dark:text-gray-400">Descripción</span>
                                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
                                        {caseData.description}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Column 2: Metadata & People */}
                    <div className="space-y-6">
                        {/* Denunciante Info */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Datos del Denunciante
                            </h2>
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg space-y-3">
                                <p className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{caseData.user?.full_name || 'N/A'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Usuario:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{caseData.user?.username || 'N/A'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{caseData.user?.email || 'N/A'}</span>
                                </p>
                            </div>
                        </section>

                        {/* Asignación */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Asignación
                            </h2>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Consultor Jurídico a cargo:</p>
                                {caseData.assigned_consultant ? (
                                    <>
                                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                            {caseData.assigned_consultant.full_name}
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            @{caseData.assigned_consultant.username}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-yellow-600 dark:text-yellow-500 font-medium italic">
                                        Pendiente de asignación
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Archivos Adjuntos */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Archivos Adjuntos
                            </h2>
                            {caseData.denuncia_archivos && caseData.denuncia_archivos.length > 0 ? (
                                <ul className="space-y-2">
                                    {caseData.denuncia_archivos.map((file) => (
                                        <li key={file.id}>
                                            <a 
                                                href={file.file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                            >
                                                <span className="text-2xl">📄</span>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-blue-600 truncate underline">
                                                        {file.file_path.split('/').pop()}
                                                    </p>
                                                    <span className="text-xs text-gray-500 uppercase">{file.file_type}</span>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No hay archivos adjuntos.</p>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
