// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-[var(--color-brand-green)] dark:text-white">Civik</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Plataforma dedicada al empoderamiento ciudadano y la gestión transparente de denuncias para una comunidad más justa.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Plataforma</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/" className="hover:text-[var(--color-brand-green)] transition-colors">Inicio</Link></li>
            <li><Link to="/casos" className="hover:text-[var(--color-brand-green)] transition-colors">Casos Recientes</Link></li>
            <li><Link to="/denuncia" className="hover:text-[var(--color-brand-green)] transition-colors">Reportar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Comunidad</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><a href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Guía Legal</a></li>
            <li><a href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Voluntariado</a></li>
            <li><a href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Blog</a></li>
          </ul>
        </div>

        {/* Subscribe */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Mantente informado</h4>
          <form className="flex gap-2">
            <input 
              type="email" 
              placeholder="Tu correo" 
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:border-[var(--color-brand-green)]"
            />
            <button className="bg-[var(--color-brand-green)] text-white px-3 py-2 rounded-md hover:bg-opacity-90">
              →
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 dark:text-gray-600">
        <p>&copy; {new Date().getFullYear()} Civik. Todos los derechos reservados.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacidad</a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-white">Términos</a>
        </div>
      </div>
    </footer>
  );
};
