import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Cases = () => {
    const [user, setUser] = useState(null);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Admin state for editing
    const [editingCase, setEditingCase] = useState(null);
    const [consultants, setConsultants] = useState([]); // List of available consultants for admin assignment

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            setLoading(false); // No user, stop loading to show "Access Denied"
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchCases();
            if (user.role === 'admin') {
                fetchConsultants();
            }
        }
    }, [user]);

    const fetchCases = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/denuncias', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error('Error al cargar casos');
            
            const data = await res.json();
            setCases(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchConsultants = async () => {
        try {
            const token = localStorage.getItem('token');
            // Assuming we reuse the endpoint but filter for approved consultants
            // Or create a new endpoint. For now, let's assume we implement GET /api/users?role=consultant
            const res = await fetch('http://localhost:3000/api/users?role=consultant', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConsultants(data);
            }
        } catch (err) {
            console.error("Failed to load consultants", err);
        }
    };

    const handleTakeCase = async (caseId) => {
        if (!window.confirm("¿Seguro que deseas tomar este caso?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/denuncias/${caseId}/take`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al tomar el caso");
            }
            
            // Refresh list
            fetchCases();
            alert("Caso asignado exitosamente.");
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateStatus = async (caseId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/denuncias/${caseId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Error actualizando estado");
            
            setCases(current => current.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
            if (editingCase && editingCase.id === caseId) {
                 setEditingCase(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAssignConsultant = async (caseId, consultantId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/denuncias/${caseId}/assign`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ consultantId })
            });

            if (!res.ok) throw new Error("Error asignando consultor");
            
            fetchCases(); // Refresh full list to get updated consultant info
            setEditingCase(null); // Close modal
        } catch (err) {
            alert(err.message);
        }
    };


    // ACCESS DENIED VIEW
    if (!user && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Restringido</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Debes iniciar sesión para ver tus casos o gestionar denuncias.
                    </p>
                    <Link to="/login">
                        <Button variant="primary" className="w-full">Iniciar Sesión</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // LOADING VIEW
    if (loading) {
        return <div className="min-h-screen pt-24 text-center">Cargando casos...</div>;
    }

    // FILTER LOGIC
    const filteredCases = cases.filter(c => {
        const matchesSearch = c.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (c.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()); // Searching by username if available (admin/consultant)
        
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const styles = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'dismissed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        const labels = {
            'pending': 'Pendiente',
            'in_progress': 'En Proceso',
            'resolved': 'Resuelto',
            'dismissed': 'Desestimado'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {user.role === 'citizen' ? 'Mis Denuncias' : 'Gestión de Casos'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {user.role === 'citizen' 
                                ? 'Historial de tus reportes realizados' 
                                : 'Administra y da seguimiento a los casos de la comunidad'}
                        </p>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="Buscar por descripción..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="in_progress">En Proceso</option>
                            <option value="resolved">Resuelto</option>
                            <option value="dismissed">Desestimado</option>
                        </select>
                    </div>
                </div>

                {/* Cases Grid */}
                {filteredCases.length === 0 ? (
                     <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No se encontraron casos.</p>
                     </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCases.map((c) => (
                            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col">
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        {getStatusBadge(c.status)}
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {c.created_at ? format(new Date(c.created_at), 'dd MMM yyyy') : 'Fecha desc.'}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-gray-800 dark:text-gray-200 font-medium line-clamp-3">
                                            {c.description}
                                        </p>
                                    </div>

                                    {/* Additional Info for non-Citizens */}
                                    {user.role !== 'citizen' && (
                                        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                                            <p><span className="font-semibold">Usuario:</span> {c.user?.username || 'Anónimo'}</p>
                                            <p className="mt-1">
                                                <span className="font-semibold">Consultor:</span> 
                                                {c.assigned_consultant ? (
                                                    <span className="text-blue-600 dark:text-blue-400 ml-1">{c.assigned_consultant.full_name}</span>
                                                ) : (
                                                    <span className="text-yellow-600 dark:text-yellow-500 ml-1">Sin asignar</span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Actions Footer */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                                    
                                    {/* Universal Detail View */}
                                    <Link to={`/casos/${c.id}`} className="w-full">
                                         <Button variant="secondary" className="text-sm w-full border-gray-200 dark:border-gray-600">
                                            Ver Detalles Completos
                                         </Button>
                                    </Link>

                                    {/* Action: Consultant Take Case */}
                                    {user.role === 'consultant' && !c.assigned_consultant_id && (
                                        <Button 
                                            onClick={() => handleTakeCase(c.id)} 
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                        >
                                            Tomar Caso
                                        </Button>
                                    )}
                                    
                                    {user.role === 'consultant' && c.assigned_consultant_id === user.id && (
                                         <span className="text-green-600 dark:text-green-400 text-sm font-semibold w-full text-center py-1">★ Asignado a ti</span>
                                    )}

                                    {/* Action: Admin Edit */}
                                    {user.role === 'admin' && (
                                        <Button 
                                            onClick={() => setEditingCase(c)} 
                                            variant="outline" 
                                            className="w-full text-sm"
                                        >
                                            Administrar Estado
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Admin Modal */}
            {editingCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Gestionar Caso</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Estado del Caso</label>
                            <select 
                                value={editingCase.status} 
                                onChange={(e) => handleUpdateStatus(editingCase.id, e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="in_progress">En Proceso</option>
                                <option value="resolved">Resuelto</option>
                                <option value="dismissed">Desestimado</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Asignar Consultor</label>
                            <select 
                                value={editingCase.assigned_consultant_id || ''} 
                                onChange={(e) => handleAssignConsultant(editingCase.id, e.target.value || null)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">-- Sin Asignar --</option>
                                {consultants.map(cons => (
                                    <option key={cons.id} value={cons.id}>
                                        {cons.full_name || cons.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                             <Button onClick={() => setEditingCase(null)} variant="ghost">Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
