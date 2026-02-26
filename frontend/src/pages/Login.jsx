// src/pages/Login.jsx
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';

export const Login = () => {
    const [loginMethod, setLoginMethod] = useState('email'); // 'email', 'cedula', 'username'
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleMethodChange = (method) => {
        setLoginMethod(method);
        setIdentifier('');
        setError('');
    };

    const validateInput = (value) => {
        if (!value) return true; // Let required handle empty
        
        switch (loginMethod) {
            case 'email':
                // Simple email regex
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'cedula':
                // Only numbers
                return /^\d+$/.test(value);
            case 'username':
                // Alphanumeric, underscores, and dots
                return /^[a-zA-Z0-9_.]+$/.test(value);
            default:
                return true;
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        
        // For cedula, prevent non-numeric input
        if (loginMethod === 'cedula' && val && !/^\d+$/.test(val)) {
            return;
        }
        
        setIdentifier(val);
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores previos
        
        // Validación del lado del cliente (opcional, ya tienes validateInput)
        let isValid = true;
        let msg = '';
        if (loginMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
             msg = 'Por favor ingresa un correo válido'; isValid = false;
        } else if (loginMethod === 'cedula' && !/^\d+$/.test(identifier)) {
             msg = 'La cédula debe contener solo números'; isValid = false;
        } else if (loginMethod === 'username' && !/^[a-zA-Z0-9_.]+$/.test(identifier)) {
             msg = 'El usuario contiene caracteres inválidos'; isValid = false;
        }

        if (!isValid) {
            setError(msg);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier,
                    password,
                    loginMethod
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            // Guardar token y usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redireccionar según el rol si es necesario, o al home
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        }
    };

  return (
    <div className="min-h-screen py-24 px-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selecciona tu método de ingreso
            </p>
        </div>

        {/* Method Selection Tabs */}
        <div className="flex justify-center mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
                type="button"
                onClick={() => handleMethodChange('email')}
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                    loginMethod === 'email' 
                    ? 'border-b-2 border-[var(--color-brand-green)] text-[var(--color-brand-green)]' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
                Correo
            </button>
            <button
                type="button"
                onClick={() => handleMethodChange('cedula')}
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                    loginMethod === 'cedula' 
                    ? 'border-b-2 border-[var(--color-brand-green)] text-[var(--color-brand-green)]' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
                Cédula
            </button>
            <button
                type="button"
                onClick={() => handleMethodChange('username')}
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                    loginMethod === 'username' 
                    ? 'border-b-2 border-[var(--color-brand-green)] text-[var(--color-brand-green)]' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
                Usuario
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {loginMethod === 'email' && 'Correo Electrónico'}
                    {loginMethod === 'cedula' && 'Número de Cédula'}
                    {loginMethod === 'username' && 'Nombre de Usuario'}
                </label>
                
                {loginMethod === 'email' && (
                    <input 
                        required 
                        type="email" 
                        value={identifier} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="tu@correo.com"
                    />
                )}

                {loginMethod === 'cedula' && (
                    <input 
                        required 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={identifier} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="12345678"
                    />
                )}

                {loginMethod === 'username' && (
                    <input 
                        required 
                        type="text" 
                        value={identifier} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="nombre_usuario"
                    />
                )}
                
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contraseña
                    </label>
                    <Link to="/forgot-password" class="text-xs text-[var(--color-brand-green)] hover:underline">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <input 
                    required 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>

            <Button type="submit" variant="primary" className="w-full">
                Iniciar Sesión
            </Button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="font-medium text-[var(--color-brand-green)] hover:text-green-500">
                    Regístrate aquí
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};