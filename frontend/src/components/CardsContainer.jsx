import { Card } from "./Card"
import IconLaw from '../assets/images/icon-law.png'

export const CardsContainer = () => {
  
  const services = [
    {
        id:1,
        title: 'Asesoría Legal',
        description: 'Brindamos asesoría legal en temas de derecho civil, penal, laboral y administrativo.',
        img: IconLaw,
        color: ''
    },
    {
        id:2,
        title: 'Servicios Administrativos',
        description: 'Ofrecemos servicios administrativos para optimizar la gestión de tu empresa.',
        img: '',
        color: ''
    },
    {
        id:3,
        title: 'Consultoría Empresarial',
        description: 'Proporcionamos consultoría empresarial para mejorar la eficiencia y rentabilidad de tu negocio.',
        img: '',
        color: ''
    },
    {
        id:4,
        title: 'Servicios de Comunicación',
        description: 'Brindamos servicios de comunicación para mejorar la interacción con tus clientes y empleados.',
        img: '',
        color: ''
    },
  ]
    return (
    <section>
        {
            services.map(service => {
                return (
                    <Card key={service.id} 
                        title={service.title} 
                        description={service.description}
                        img={service.img}
                    />
                )
            })
        }
    </section>
  )
}
