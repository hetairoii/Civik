import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, sending, sent, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            // We show success regardless to prevent user enumeration
            setStatus('sent');
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recuperar Contraseña</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Ingresa tu correo para recibir un enlace de recuperación.</p>
                </div>
                
                {status === 'sent' ? (
                    <div className="text-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-green-800 dark:text-green-300 font-medium">¡Correo enviado!</p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-green)]"
                            >
                                {status === 'sending' ? 'Enviando...' : 'Enviar Enlace'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (newPassword !== confirmPassword) {
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        setStatus('submitting');
        try {
            const res = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setMessage(data.message);
            }
        } catch (err) {
            setStatus('error');
            setMessage('Error de conexión.');
        }
    };

    if (!token) return <div className="text-center pt-24 text-red-500">Token inválido.</div>;

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">¡Contraseña Restablecida!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                    <Button onClick={() => navigate('/login')} className="w-full">Iniciar Sesión</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Contraseña</h2>
                </div>
                
                {message && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Nueva contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                         <input
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Confirmar contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full"
                    >
                        {status === 'submitting' ? 'Guardando...' : 'Cambiar Contraseña'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
