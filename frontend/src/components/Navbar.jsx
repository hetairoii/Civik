import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for logged in user on mount and route change
    useEffect(() => {
        const checkUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    setUser(JSON.parse(userStr));
                } catch (e) {
                    console.error("Error parsing user", e);
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', checkUser); // Listen for cross-tab changes
        checkUser(); // Initial check

        return () => window.removeEventListener('storage', checkUser);
    }, [location.pathname]); // Re-check on route change (e.g. after login redirect)

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md dark:bg-gray-900/90 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 w-full fixed top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                         {/* Logo Placeholder - You can replace src with your actual logo path */}
                        <div className="h-8 w-8 bg-[var(--color-brand-green)] rounded-lg flex items-center justify-center text-white font-bold">
                            C
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Civik
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[var(--color-brand-green)] dark:hover:text-white transition-colors">
                            Inicio
                        </Link>
                        
                        {/* Admin Link */}
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                Panel Admin
                            </Link>
                        )}

                        <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[var(--color-brand-green)] dark:hover:text-white transition-colors">
                            Casos
                        </a>
                        
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                        <Button 
                            variant="ghost" 
                            onClick={toggleTheme} 
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </Button>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Hola, <span className="font-semibold">{user.username}</span></span>
                                <Button variant="outline" onClick={handleLogout} className="text-xs">
                                    Salir
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Iniciar Sesión
                                </Link>
                                <Button variant="primary" onClick={() => navigate('/signup')} className="shadow-lg shadow-green-900/20">
                                    Regístrate
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={toggleTheme} 
                            className="p-1 rounded-full text-gray-500 dark:text-gray-400"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </Button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 dark:text-gray-300 focus:outline-none"
                        >
                             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 absolute w-full shadow-xl">
                    <div className="px-4 py-4 space-y-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-700 dark:text-gray-200">
                            Inicio
                        </Link>
                        {user?.role === 'admin' && (
                             <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-base font-medium text-blue-600 dark:text-blue-400">
                                Panel Admin
                            </Link>
                        )}
                        <a href="#" className="block text-base font-medium text-gray-700 dark:text-gray-200">
                            Casos
                        </a>
                        
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            {user ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Sesión iniciada como <strong>{user.username}</strong></p>
                                    <Button variant="outline" onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full justify-center">
                                        Cerrar Sesión
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" onClick={() => { navigate('/login'); setIsOpen(false); }} className="justify-center">
                                        Entrar
                                    </Button>
                                    <Button variant="primary" onClick={() => { navigate('/signup'); setIsOpen(false); }} className="justify-center">
                                        Registrarse
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
