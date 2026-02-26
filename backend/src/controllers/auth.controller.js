const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');

// Cargar variables de entorno si no están cargadas (dotenv ya se carga en index)
const CEDULA_API_URL = 'https://api.cedula.com.ve/api/v1';
const APP_ID = process.env.APP_ID;
const TOKEN = process.env.CI_API_ACCESS_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeit';

const register = async (req, res) => {
    try {
        const { 
            email, 
            password, 
            username, 
            role, 
            nationality, // 'V' o 'E'
            cedula,      // Solo números
            phone,
            organization, // Solo consultor
            license_number // Solo consultor
        } = req.body;

        console.log('Intento de registro:', { email, username, cedula, role });

        // 0. Validar existencia del correo (básico)
        // Aunque esto no garantiza que el correo exista "en la realidad", 
        // enviar un correo de verificación es la forma estándar de validar la propiedad.
        // Aquí asumimos que Nodemailer manejará el envío.

        // 1. Validar existencia previa (Email, Username, Cedula)
        
        const { data: existingEmail } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
        if (existingEmail) return res.status(400).json({ message: 'El correo ya está registrado.' });

        if (username) {
            const { data: existingUser } = await supabase.from('users').select('id').eq('username', username).maybeSingle();
            if (existingUser) return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

        const { data: existingCedula } = await supabase.from('users').select('id').eq('identification_number', cedula).maybeSingle();
        if (existingCedula) return res.status(400).json({ message: 'La cédula ya está registrada.' });

        // 2. Validar con API de Cédula
        let apiData = {};
        try {
            const apiUrl = `${CEDULA_API_URL}?app_id=${APP_ID}&token=${TOKEN}&nacionalidad=${nationality}&cedula=${cedula}`;
            console.log(`Consultando API Cédula...`);
            const response = await axios.get(apiUrl);
            
            if (response.data.error || !response.data.data) {
                return res.status(400).json({ message: 'Cédula no encontrada o error en la validación de identidad.' });
            }
            apiData = response.data.data;
            console.log('Datos de API:', apiData);

        } catch (error) {
            console.error('Error consultando API Cédula:', error.message);
            return res.status(500).json({ message: 'Error validando la identidad con el servicio externo.' });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Determinar estado inicial y Token de Verificación
        // Para consultores, el status sigue siendo 'pending' de aprobación admin
        // Para todos, is_verified es FALSE hasta que verifiquen email
        const status = role === 'consultant' ? 'pending' : 'approved';
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Concatenar nombre completo desde API
        const fullNameFromApi = `${apiData.primer_nombre} ${apiData.segundo_nombre || ''} ${apiData.primer_apellido} ${apiData.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim();

        // 5. Insertar usuario
        const newUser = {
            email,
            username,
            password_hash: hashedPassword,
            full_name: fullNameFromApi,
            role,
            status,
            is_verified: false,
            verification_token: verificationToken,
            nationality_type: nationality,
            identification_number: cedula,
            rif: apiData.rif,
            first_name: apiData.primer_nombre,
            second_name: apiData.segundo_nombre,
            first_last_name: apiData.primer_apellido,
            second_last_name: apiData.segundo_apellido,
            phone,
            organization: role === 'consultant' ? organization : null,
            license_number: role === 'consultant' ? license_number : null
        };

        const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

        if (insertError) {
            console.error('Error insertando usuario:', insertError);
            return res.status(500).json({ message: 'Error guardando usuario. Intente nuevamente.' });
        }

        // 6. Enviar Correo de Verificación
        const emailSent = await sendVerificationEmail(email, verificationToken);
        if (!emailSent) {
            // Opcional: Podríamos borrar el usuario si falla el correo, o permitir re-envío
            console.warn('Fallo al enviar correo de verificación a', email);
        }

        res.status(201).json({ 
            message: 'Registro exitoso. Se ha enviado un correo de verificación a su dirección de email.',
            userId: insertedUser.id
        });

    } catch (error) {
        console.error('Error global en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token requerido.' });

        const { data: user, error } = await supabase
            .from('users')
            .select('id, is_verified')
            .eq('verification_token', token)
            .single();

        if (error || !user) return res.status(400).json({ message: 'Token inválido o expirado.' });
        if (user.is_verified) return res.json({ message: 'Cuenta ya verificada.' });

        // Actualizar usuario
        const { error: updateError } = await supabase
            .from('users')
            .update({ is_verified: true, verification_token: null })
            .eq('id', user.id);

        if (updateError) throw updateError;

        res.json({ message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verificando cuenta.' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const { data: user } = await supabase.from('users').select('id').eq('email', email).maybeSingle();

        if (!user) {
            // Por seguridad, no decimos si el correo existe o no explícitamente, o decimos "Si existe, se envió"
            return res.json({ message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora

        await supabase
            .from('users')
            .update({ 
                reset_password_token: token, 
                reset_password_expires: expires 
            })
            .eq('id', user.id);

        await sendPasswordResetEmail(email, token);

        res.json({ message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error procesando solicitud.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Buscar usuario por token y validar expiración
        // Supabase no permite filtrar por fecha > now() directamente con eq() facil, usaremos gte
        const { data: user, error } = await supabase
            .from('users')
            .select('id, reset_password_expires')
            .eq('reset_password_token', token)
            .single();

        if (error || !user) return res.status(400).json({ message: 'Token inválido.' });

        if (new Date() > new Date(user.reset_password_expires)) {
            return res.status(400).json({ message: 'El token ha expirado.' });
        }

        // Hash nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await supabase
            .from('users')
            .update({ 
                password_hash: hashedPassword, 
                reset_password_token: null, 
                reset_password_expires: null 
            })
            .eq('id', user.id);

        res.json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error restableciendo contraseña.' });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password, loginMethod } = req.body; // loginMethod del frontend: 'email', 'cedula', 'username'
        
        console.log(`Login attempt: ${loginMethod} - ${identifier}`);

        let query = supabase.from('users').select('*');

        // Construir query basado en método
        if (loginMethod === 'email') {
            query = query.eq('email', identifier);
        } else if (loginMethod === 'cedula') {
            query = query.eq('identification_number', identifier);
        } else if (loginMethod === 'username') {
            query = query.eq('username', identifier);
        } else {
            return res.status(400).json({ message: 'Método de inicio de sesión no válido.' });
        }

        const { data: user, error } = await query.maybeSingle();

        if (error) {
            console.error('Error buscando usuario:', error);
            return res.status(500).json({ message: 'Error de base de datos.' });
        }

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Verificar estado (aprobado o no)
        if (user.status !== 'approved') {
            return res.status(403).json({ message: 'Su cuenta aún no ha sido aprobada o está suspendida.' });
        }
        
        // UNCOMMENT TO ENFORCE EMAIL VERIF
        // if (!user.is_verified) return res.status(403).json({ message: 'Debes verificar tu correo electrónico antes de iniciar sesión.' });

        // Generar token
        const token = jwt.sign(
            { id: user.id, role: user.role, status: user.status },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Funciones para Admin
const getPendingConsultants = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'consultant')
            .eq('status', 'pending');

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error obteniendo consultores pendientes:', error);
        res.status(500).json({ message: 'Error al obtener lista de pendientes.' });
    }
};

const approveConsultant = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Estado inválido. Use approved o rejected.' });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', userId)
            .select();

        if (error) throw error;

        res.json({ message: `Usuario ${status} exitosamente.`, user: data });
    } catch (error) {
        console.error('Error aprobando consultor:', error);
        res.status(500).json({ message: 'Error al actualizar estado del usuario.' });
    }
};

const getMe = async (req, res) => {
    try {
        const { id } = req.user;
        const { data: user, error } = await supabase
            .from('users')
            .select(`
                id, email, username, full_name, role, status, is_verified, 
                nationality_type, identification_number, rif, 
                first_name, second_name, first_last_name, second_last_name,
                phone, organization, license_number, created_at
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obteniendo perfil.' });
    }
};

module.exports = {
    register,
    login,
    getPendingConsultants,
    approveConsultant,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe
};
