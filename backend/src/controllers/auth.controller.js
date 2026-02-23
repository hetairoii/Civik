const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

        // 1. Validar existencia previa (Email, Username, Cedula)
        // Nota: Supabase no soporta OR complejo facilmente en una sola llamada sin raw filters, 
        // hacemos check individual o usamos stored procedure. Verificamos email y cedula por separado para mejor feedback.
        
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
            
            // La estructura segun imagen: { error: false, data: { ... } }
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

        // 4. Determinar estado inicial
        const status = role === 'consultant' ? 'pending' : 'approved';
        
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
            return res.status(500).json({ message: 'Error guardando usuario en base de datos.', details: insertError.message });
        }

        // 6. Respuesta
        if (role === 'consultant') {
            return res.status(201).json({ 
                message: 'Registro exitoso. Su cuenta de consultor está pendiente de aprobación por un administrador.',
                userId: insertedUser.id
            });
        }

        // Para ciudadanos, generar token inmediatamente
        const token = jwt.sign(
            { id: insertedUser.id, role: insertedUser.role, status: insertedUser.status },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registro exitoso.',
            token,
            user: {
                id: insertedUser.id,
                full_name: insertedUser.full_name,
                role: insertedUser.role,
                username: insertedUser.username
            }
        });

    } catch (error) {
        console.error('Error global en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
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

module.exports = {
    register,
    login,
    getPendingConsultants,
    approveConsultant
};
