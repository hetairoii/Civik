import { Card } from "./Card"
import IconLaw from '../assets/images/icon-law.png'
import ddhhIcon from '../assets/images/derechos-humanos.png'
import documentIcon from '../assets/images/document-icon.png'

export const CardsContainer = () => {
  
  const services = [
    {
        id:1,
        title: 'Asesoría Legal',
        description: 'Brindamos asesoría legal experta en temas de derecho civil, penal, laboral y administrativo.',
        img: IconLaw,
        color: ''
    },
    {
        id:2,
        title: 'Gestión Documental',
        description: 'Ayudamos en la tramitación y gestión segura de documentos legales y denuncias.',
        // Placeholder for missing image
        img: documentIcon, 
        color: ''
    },
    {
        id:3,
        title: 'Protección de DDHH',
        description: 'Canalizamos denuncias sobre violaciones de Derechos Humanos ante los organismos competentes.',
        img: ddhhIcon,
        color: ''
    },
  ]

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 px-4">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--color-brand-green)] dark:text-[var(--color-brand-beige)]">
                Nuestros Servicios de Apoyo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map(service => (
                    <Card 
                        key={service.id}
                        title={service.title}
                        description={service.description}
                        img={service.img}
                        color={service.color}
                    />
                ))}
            </div>
        </div>
    </section>
  )
}

