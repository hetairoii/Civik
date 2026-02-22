import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

return (
    <nav className="bg-[var(--color-brand-beige)] dark:bg-[var(--color-brand-green)] shadow-md transition-colors duration-300 w-full fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                <div className="flex items-center">
                    <div className="h-10 w-10 mr-0 shrink-0">
                        <img
                            src={theme === 'dark' ? "/civik-logo-dark.png" : "/civik-logo.png"}
                            alt="civik-logo"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <span className="text-2xl font-bold text-[var(--color-brand-green)] dark:text-[var(--color-brand-beige)]">
                        Civik
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-[var(--color-brand-green)] dark:hover:text-[var(--color-brand-blue)] transition-colors">Inicio</a>
                    <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-[var(--color-brand-green)] dark:hover:text-[var(--color-brand-blue)] transition-colors">Casos</a>
                    <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-[var(--color-brand-green)] dark:hover:text-[var(--color-brand-blue)] transition-colors">Nosotros</a>
                    
                    <Button variant="outline" onClick={toggleTheme} className="!px-3 !py-1">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </Button>
                    
                    <Button variant="primary">
                        Denuncia Ahora
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                     <Button variant="outline" onClick={toggleTheme} className="!px-3 !py-1 mr-2">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </Button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-[var(--color-brand-green)] dark:text-[var(--color-brand-beige)] focus:outline-none"
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

        {/* Mobile Menu */}
        {isOpen && (
            <div className="md:hidden bg-[var(--color-brand-beige)] dark:bg-[var(--color-brand-green)] px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-[var(--color-brand-blue)] hover:text-white">Inicio</a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-[var(--color-brand-blue)] hover:text-white">Casos</a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-[var(--color-brand-blue)] hover:text-white">Nosotros</a>
                <div className="mt-4">
                     <Button variant="primary" className="w-full">
                        Denuncia Ahora
                    </Button>
                </div>
            </div>
        )}
    </nav>
);
};
