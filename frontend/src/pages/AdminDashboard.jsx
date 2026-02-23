import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

/**
 * AdminDashboard - Displays pending consultant applications
 * Allows approving or rejecting them.
 */
export const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:3000/api/auth'; 

  // Check auth & role on mount (simple client-side check)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    // TODO: stricter role check -> if (user.role !== 'admin') navigate('/');
    // For now, let's allow access to verify the UI, or just check loosely.
    // Ideally this route is protected by backend too.
  }, [navigate]);


  const fetchPending = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Note: Backend endpoint for fetching pending consultants:
      // GET /api/auth/admin/pending-consultants
      const res = await fetch(`${API_URL}/admin/pending-consultants`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (!res.ok) {
        throw new Error('Error al cargar solicitudes pendientes');
      }
      
      const data = await res.json();
      setPendingUsers(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado a: ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('token');
      // Backend endpoint: PUT /api/auth/admin/approve/:userId
      // Body: { status: 'approved' | 'rejected' }
      const res = await fetch(`${API_URL}/admin/approve/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error actualizando estado');
      }

      // Success: Remove user from list locally
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      alert(`Usuario ${newStatus === 'approved' ? 'aprobado' : 'rechazado'} correctamente.`);
      
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando panel de administración...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona solicitudes de consultores y usuarios</p>
          </div>
          <Button onClick={fetchPending} variant="outline">
            Refrescar Lista
          </Button>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Solicitudes Pendientes ({pendingUsers.length})
            </h2>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p>No hay solicitudes pendientes por revisar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Usuario / Cédula</th>
                    <th className="px-6 py-4">Nombre Completo</th>
                    <th className="px-6 py-4">Email / Info Profesional</th>
                    <th className="px-6 py-4">Fecha Registro</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex flex-col">
                          <span>{user.username}</span>
                          <span className="text-xs text-gray-500">V-{user.identification_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span>{user.email}</span>
                          {/* If backend stored extra fields in a JSON column or separate table, fetch them here. 
                              Assuming 'users' table has basic info. */}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleStatusChange(user.id, 'approved')}
                            className="bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded text-xs font-semibold transition-colors"
                          >
                            Aprobar
                          </button>
                          <button 
                            onClick={() => handleStatusChange(user.id, 'rejected')}
                            className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded text-xs font-semibold transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
