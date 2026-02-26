import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { CardsContainer } from '../components/CardsContainer';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

// Mock Data for "Recent Activity" or similar
const MOCK_STATS = [
    { label: 'Denuncias Activas', value: '1,240+', icon: '📢' },
    { label: 'Casos Resueltos', value: '850', icon: '✅' },
    { label: 'Consultores Aliados', value: '45', icon: '⚖️' },
    { label: 'Comunidades Atendidas', value: '12', icon: '🏘️' },
];

const STEPS = [
    { 
        title: 'Regístrate', 
        desc: 'Crea tu cuenta de forma segura verificando tu identidad.',
        icon: '👤'
    },
    { 
        title: 'Reporta', 
        desc: 'Describe el incidente y adjunta evidencias de manera anónima si lo prefieres.',
        icon: '📝'
    },
    { 
        title: 'Seguimiento', 
        desc: 'Nuestros consultores revisan tu caso y te notifican los avances por correo.',
        icon: '🔍'
    },
];

export const Home = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* HERO SECTION */}
            <Hero />

            {/* STATISTICS BANNER */}
            <section className="bg-[var(--color-brand-green)] dark:bg-green-900/40 py-12 text-white">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {MOCK_STATS.map((stat, idx) => (
                        <div key={idx} className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="text-4xl mb-2">{stat.icon}</div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-green-100/80 text-sm uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SERVICES SECTION */}
            <CardsContainer />

            {/* HOW IT WORKS */}
            <section className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        ¿Cómo funciona Civik?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-16">
                        Hemos simplificado el proceso para que puedas alzar tu voz de manera rápida y efectiva.
                    </p>

                    <div className="grid md:grid-cols-1 md:grid-cols-3 gap-8 relative items-start">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>

                        {STEPS.map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 bg-[var(--color-brand-beige)] dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-6 shadow-md border-4 border-white dark:border-gray-800">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS (Optional) */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Lo que dice nuestra comunidad</h2>
                        <p className="text-gray-600 dark:text-gray-400">Historias reales de impacto positivo.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative hover:shadow-md transition-shadow">
                            <span className="text-6xl text-green-200 dark:text-green-900 absolute top-4 left-4 font-serif opacity-50">"</span>
                            <div className="relative z-10">
                                <p className="text-gray-600 dark:text-gray-300 italic mb-6 pt-4">
                                    Gracias a Civik pude reportar una situación irregular en mi comunidad sin miedo a represalias. La respuesta fue rápida y profesional.
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl">👩‍🏫</div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">María González</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Docente</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative hover:shadow-md transition-shadow">
                            <span className="text-6xl text-green-200 dark:text-green-900 absolute top-4 left-4 font-serif opacity-50">"</span>
                            <div className="relative z-10">
                                <p className="text-gray-600 dark:text-gray-300 italic mb-6 pt-4">
                                    Como abogado consultor, esta plataforma me permite conectar con casos reales donde mi experiencia puede generar un impacto social positivo y directo.
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl">👨‍⚖️</div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Dr. Carlos Pérez</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Abogado Penalista</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* CALL TO ACTION */}
             <section className="py-24 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                        Juntos construimos una sociedad más justa
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        No te quedes callado. Únete a miles de ciudadanos que ya están informando y haciendo la diferencia.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/signup" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto px-8 py-4 text-lg bg-[var(--color-brand-green)] hover:bg-opacity-90 border-none rounded-full shadow-lg shadow-green-900/50 transition-transform hover:scale-105">
                                Crear Cuenta Gratis
                            </Button>
                        </Link>
                        <Link to="/casos" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-gray-900 rounded-full transition-all">
                                Ver Casos Recientes
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

             <Footer />
        </div>
    );
};