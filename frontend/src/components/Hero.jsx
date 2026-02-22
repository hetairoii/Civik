import React from 'react'
import { Button } from './Button'

export const Hero = () => {
  return (
    <div className="bg-[var(--color-brand-beige)] dark:bg-[var(--color-brand-green)] transition-colors duration-300 py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-[var(--color-brand-green)] dark:text-[var(--color-brand-beige)] mb-6">
        Haz oír tu voz con Civik
      </h1>
      <p className="text-xl max-w-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
        Apoyamos a las personas en la denuncia de actos delictivos, corrupción y violación de derechos humanos.
        Tu reporte es seguro y anónimo.
      </p>
      <div className="flex gap-4">
        <Button variant="primary" onClick={() => console.log('Redirigir a denuncia')}>
          Realizar Denuncia
        </Button>
        <Button variant="outline">
          Saber más
        </Button>
      </div>
    </div>
  )
}
