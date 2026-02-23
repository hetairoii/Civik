import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';

export const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Select Type, 2: Form, 3: Success consultant
    const [userType, setUserType] = useState('citizen'); // 'citizen' or 'consultant'
    
    // Additional state for consultant
    const [organization, setOrganization] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        nacionalidad: 'V',
        cedula: '',
        phone: '', 
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Simple numeric validation for cedula
        if (name === 'cedula' && !/^\d*$/.test(value)) return;
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeSelection = (type) => {
        setUserType(type);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const role = userType === 'citizen' ? 'citizen' : 'consultant';

        console.log('--- Register Attempt ---');
        console.log('Role:', role);
        
        try {
            // Preparar payload
            const payload = {
                role: role,
                nationality: formData.nacionalidad,
                cedula: formData.cedula,
                password: formData.password,
                email: formData.email, 
                username: formData.username,
                phone: formData.phone // maps to 'telefono' in state but 'phone' in backend
            };

            // FIX: 'telefono' in state map to 'phone' in payload
            payload.phone = formData.phone; 

            if (role === 'consultant') {
                payload.organization = organization;
                payload.license_number = licenseNumber;
            }

            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro');
            }

            // Success
            if (role === 'consultant') {
                setStep(3); // Show pending approval screen
            } else {
                // Save token and correct role
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Registro exitoso. ¡Bienvenido!');
                navigate('/');
            }

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // --- Render Logic ---

    // Step 1: Selection
    if (step === 1) {
    return (
      <div className="min-h-screen py-20 px-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <h2 className="text-3xl font-bold mb-8 text-[var(--color-brand-green)] dark:text-white text-center">
          ¿Cómo deseas unirte a Civik?
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Option: Citizen */}
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-[var(--color-brand-green)] transition-all cursor-pointer transform hover:-translate-y-1"
               onClick={() => handleTypeSelection('citizen')}>
            <div className="text-5xl mb-6 text-center group-hover:scale-110 transition-transform">👤</div>
            <h3 className="text-2xl font-bold mb-3 text-center text-gray-800 dark:text-white">Ciudadano</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Quiero reportar casos, realizar denuncias y contribuir a mi comunidad.
            </p>
            <div className="mt-8 text-center">
              <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-[var(--color-brand-green)] font-semibold rounded-full group-hover:bg-[var(--color-brand-green)] group-hover:text-white transition-colors">
                Registrarme como Ciudadano
              </span>
            </div>
          </div>

          {/* Option: Consultant */}
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer transform hover:-translate-y-1"
               onClick={() => handleTypeSelection('consultant')}>
            <div className="text-5xl mb-6 text-center group-hover:scale-110 transition-transform">⚖️</div>
            <h3 className="text-2xl font-bold mb-3 text-center text-gray-800 dark:text-white">Consultor Jurídico</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Soy profesional del derecho y quiero ofrecer orientación y asistencia legal.
            </p>
            <div className="mt-8 text-center">
              <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-blue-600 font-semibold rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Aplicar como Consultor
              </span>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-[var(--color-brand-green)] font-medium underline underline-offset-4">
            ¿Ya tienes cuenta? Inicia Sesión
          </Link>
        </div>
      </div>
    );
  }

  // Step 3: Success Message for Consultant
  if (step === 3 && userType === 'consultant') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center border-t-4 border-blue-500">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Solicitud Recibida</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 font-medium">
             Su solicitud para unirse como Consultor Jurídico está en proceso de revisión.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-8 text-left border border-blue-100 dark:border-blue-800/30">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              <strong>Próximos pasos:</strong> Nuestro equipo administrativo verificará sus credenciales profesionales. Una vez aprobado, recibirá un correo electrónico de confirmación y podrá acceder a la plataforma para gestionar casos.
            </p>
          </div>
          <Link to="/">
            <Button variant="primary" className="w-full">Volver al Inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Step 2: Form
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col items-center">
       <button onClick={() => setStep(1)} className="self-start mb-8 text-gray-500 hover:text-[var(--color-brand-green)] flex items-center max-w-2xl mx-auto w-full font-medium transition-colors">
         &larr; Volver a selección
       </button>
       
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-[var(--color-brand-green)] py-6 px-8 relative overflow-hidden">
             {/* Decorative pattern/overlay could go here */}
             <div className="relative z-10 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {userType === 'consultor' ? 'Registro Profesional' : 'Registro de Usuario'}
                </h2>
                <p className="text-green-100 text-sm">
                    {userType === 'consultor' ? 'Únete a nuestra red de expertos legales' : 'Comienza a hacer la diferencia en tu comunidad'}
                </p>
             </div>
        </div>

        <div className="px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
               {/* Nacionalidad y Cedula */}
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula de Identidad <span className="text-red-500">*</span></label>
                  <div className="flex rounded-md shadow-sm">
                    <select 
                        name="nacionalidad" 
                        value={formData.nacionalidad} 
                        onChange={handleInputChange} 
                        className="rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-700 text-sm focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="V">V</option>
                      <option value="E">E</option>
                    </select>
                    <input 
                        required 
                        type="text" 
                        name="cedula" 
                        value={formData.cedula} 
                        onChange={handleInputChange} 
                        placeholder="12345678" 
                        className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-md border border-gray-300 focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors" 
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Sólo números. Verificaremos tu identidad automáticamente.</p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de Usuario <span className="text-red-500">*</span></label>
                <input required type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="juanperez99" />
              </div>

              {/* Telefono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono <span className="text-red-500">*</span></label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="04121234567" />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="tu@correo.com" />
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña <span className="text-red-500">*</span></label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="********" />
              </div>
              
              {/* Consultant Specific Extra Fields */}
              {userType === 'consultant' && (
                  <>
                    <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Información Profesional</h4>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organización / Bufete</label>
                        <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Legal Solutions C.A." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. de Impreabogado / Licencia</label>
                        <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="N-12345" />
                    </div>
                  </>
              )}

            </div>

            <Button type="submit" variant="primary" className={`w-full mt-8 py-3 text-lg ${userType === 'consultant' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
              {userType === 'consultant' ? 'Enviar Solicitud de Registro' : 'Completar Registro'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};