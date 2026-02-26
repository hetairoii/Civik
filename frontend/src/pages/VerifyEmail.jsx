import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Token de verificación no encontrado.');
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Error desconocido.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Error de conexión.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                {status === 'verifying' && (
                    <>
                        <h2 className="text-2xl font-bold mb-4 dark:text-white">Verificando...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-green-600">¡Cuenta Verificada!</h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>
                        <Button onClick={() => navigate('/login')} className="w-full">Iniciar Sesión</Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-red-600">Error de Verificación</h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>
                        <Button onClick={() => navigate('/login')} variant="secondary" className="w-full">Volver al Inicio</Button>
                    </>
                )}
            </div>
        </div>
    );
};
