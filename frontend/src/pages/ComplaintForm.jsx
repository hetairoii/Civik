// src/pages/ComplaintForm.jsx
import React, { useState } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import axios from 'axios';
// Note: For now, using a placeholder site key for testing. Replace with your actual site key.
// To implement Cloudflare Turnstile instead, consider replacing this component with a Turnstile component.

export const ComplaintForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        idPhoto: null,
        phone: '',
        email: '',
        description: '',
        supportingDocs: []
    });
    const [isVerified, setIsVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Limits
    const MAX_ID_PHOTO_SIZE_MB = 25;
    const MAX_DOCS_TOTAL_SIZE_MB = 300;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleIdPhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > MAX_ID_PHOTO_SIZE_MB) {
            setErrors(prev => ({ ...prev, idPhoto: `El archivo excede los ${MAX_ID_PHOTO_SIZE_MB}MB permitidos.` }));
            return;
        }

        setFormData(prev => ({ ...prev, idPhoto: file }));
        setErrors(prev => ({ ...prev, idPhoto: null }));
    };

    const handleSupportingDocsUpload = (e) => {
        const newFiles = Array.from(e.target.files);
        
        let currentTotalSize = formData.supportingDocs.reduce((acc, file) => acc + file.size, 0);
        let newDocs = [...formData.supportingDocs];

        for (const file of newFiles) {
            if (currentTotalSize + file.size > MAX_DOCS_TOTAL_SIZE_MB * 1024 * 1024) {
                 setErrors(prev => ({ ...prev, supportingDocs: `El tamaño total de los documentos no puede exceder los ${MAX_DOCS_TOTAL_SIZE_MB}MB.` }));
                 return;
            }
            currentTotalSize += file.size;
            newDocs.push(file);
        }

        setFormData(prev => ({ ...prev, supportingDocs: newDocs }));
        setErrors(prev => ({ ...prev, supportingDocs: null }));
    };

    const removeSupportingDoc = (index) => {
        const newDocs = formData.supportingDocs.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, supportingDocs: newDocs }));
    };

    const onCaptchaChange = (value) => {
        console.log("Captcha value:", value);
        setIsVerified(!!value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isVerified) {
            setErrors(prev => ({ ...prev, submit: "Por favor, verifica que eres humano." }));
            return;
        }

        setIsSubmitting(true);

        try {
            // Nota: En una implementación real con archivos (fotos/videos), usarías FormData.
            // Por ahora enviamos JSON simple como placeholder hasta tener la lógica de archivos en backend.
            /*
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phone', formData.phone);
            data.append('email', formData.email);
            data.append('description', formData.description);
            if (formData.idPhoto) data.append('idPhoto', formData.idPhoto);
            formData.supportingDocs.forEach(file => data.append('supportingDocs', file));
            */

             // Placeholder simple JSON request
            const response = await axios.post('http://localhost:3000/api/denuncias', {
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                description: formData.description
            });
            
            console.log("Respuesta del backend:", response.data);
            
            setSubmissionSuccess(true);
        } catch (error) {
            console.error("Error al enviar:", error);
            setErrors(prev => ({ ...prev, submit: "Ocurrió un error al enviar el formulario. Inténtalo de nuevo." }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submissionSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in">
                <div className="bg-green-100 dark:bg-green-900 p-8 rounded-full mb-6">
                    <svg className="w-16 h-16 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">¡Denuncia recibida exitosamente!</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                    Su caso está siendo debidamente procesado. Nos pondremos en contacto con usted a la brevedad si requerimos más información.
                </p>
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="mt-8 px-6 py-3 bg-[var(--color-brand-green)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
                <div className="px-6 py-8 sm:p-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-8">
                        Formulario de Denuncia
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nombre Completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre Completo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        {/* Foto de Cédula */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Foto de Cédula/Identificación (Max 25MB) <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[var(--color-brand-green)] transition-colors dark:border-gray-600">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <label htmlFor="id-photo-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-[var(--color-brand-green)] hover:text-green-500 focus-within:outline-none">
                                            <span>Subir un archivo</span>
                                            <input id="id-photo-upload" name="idPhoto" type="file" required accept="image/*" className="sr-only" onChange={handleIdPhotoUpload} />
                                        </label>
                                        <p className="pl-1">o arrastrar y soltar</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF hasta 25MB</p>
                                </div>
                            </div>
                            {formData.idPhoto && (
                                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                                    <span className="mr-2">✓</span> Archivo seleccionado: {formData.idPhoto.name} ({(formData.idPhoto.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                            {errors.idPhoto && <p className="mt-2 text-sm text-red-600">{errors.idPhoto}</p>}
                        </div>

                        {/* Teléfono y Correo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Teléfono <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="+58 412 1234567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Correo Electrónico <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descripción de la Denuncia <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                rows="5"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Describa detalladamente los hechos..."
                            />
                        </div>

                        {/* Documentos de Soporte */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Documentos de Soporte (Max 300MB total)
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Puede adjuntar fotos, videos, PDF y DOCX.
                            </p>
                            
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="docs-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haga clic para subir</span> o arrastre y suelte</p>
                                    </div>
                                    <input id="docs-upload" type="file" multiple className="hidden" onChange={handleSupportingDocsUpload} accept="image/*,video/*,.pdf,.docx,.doc" />
                                </label>
                            </div>

                            {/* List of uploaded files */}
                            {formData.supportingDocs.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {formData.supportingDocs.map((file, index) => (
                                        <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
                                            <span className="truncate max-w-xs dark:text-gray-300">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            <button 
                                                type="button" 
                                                onClick={() => removeSupportingDoc(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            
                            {errors.supportingDocs && <p className="mt-2 text-sm text-red-600">{errors.supportingDocs}</p>}
                        </div>

                        {/* Recaptcha */}
                        <div className="flex justify-center mt-6">
                             {/* NOTE: Using a test key provided by Google for development purposes */}
                             <ReCAPTCHA
                                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                onChange={onCaptchaChange}
                                theme="light"
                              />
                        </div>
                        {errors.submit && <p className="text-center text-red-600 font-medium">{errors.submit}</p>}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full md:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[var(--color-brand-green)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Procesando...' : 'Procesar Denuncia'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};