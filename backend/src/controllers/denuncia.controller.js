const supabase = require('../config/supabase');
const { sendStatusUpdateEmail } = require('../utils/mailer');

const createDenuncia = async (req, res) => {
    try {
        const { description } = req.body;
        // Ahora sí usamos el user.id del token
        const userId = req.user.id;
        
        const files = req.files || {};
        
        // --- 1. Validaciones ---
        const supportingDocs = files['supportingDocs'] || [];

        // Validación total documentos (300MB)
        const totalDocsSize = supportingDocs.reduce((acc, file) => acc + file.size, 0);
        if (totalDocsSize > 300 * 1024 * 1024) {
            return res.status(400).json({ message: 'El tamaño total de los documentos excede 300MB.' });
        }

        console.log('--- Iniciando registro de denuncia ---');

        // --- 2. Insertar Denuncia (Tabla Principal) ---
        // Se asume que la tabla 'denuncias' ahora tiene columnas distintas
        const { data: denunciaData, error: denunciaError } = await supabase
            .from('denuncias')
            .insert([{ 
                description: description,
                user_id: userId
            }])
            .select()
            .single();

        if (denunciaError) throw denunciaError;

        const denunciaId = denunciaData.id;
        console.log('Denuncia creada con ID:', denunciaId);

        // --- 3. Subir Archivos a Storage y Guardar Referencia en DB ---
        const uploadedFiles = [];

        // Función auxiliar para subir y registrar
        const uploadAndRecord = async (file, folderName, fileType) => {
            const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
            const filePath = `${denunciaId}/${folderName}/${fileName}`; // Estructura: ID_DENUNCIA/carpeta/archivo

            // A) Subir a Storage (Bucket 'denuncias-files')
            const { error: uploadError } = await supabase.storage
                .from('denuncias-files') // REVISA QUE ESTE NOMBRE SEA EXACTO EN SUPABASE > STORAGE
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype
                });

            if (uploadError) {
                console.error(`ERROR SUPABASE STORAGE:`, uploadError); 
                console.error(`Error subiendo ${fileName}:`, uploadError);
                return null;
            }

            // B) Obtener URL Pública
            const { data: urlData } = supabase.storage
                .from('denuncias-files')
                .getPublicUrl(filePath);

            // C) Insertar en tabla 'denuncia_archivos'
            const { error: dbError } = await supabase
                .from('denuncia_archivos')
                .insert([{
                    denuncia_id: denunciaId,
                    file_url: urlData.publicUrl,
                    file_path: filePath,
                    file_type: fileType // 'id_photo' o 'supporting_doc'
                }]);

            if (dbError) {
                console.error(`Error guardando referencia de ${fileName}:`, dbError);
                return null;
            }
        

            return { fileName, publicUrl: urlData.publicUrl };
        };

        // Procesar Documentos de Soporte
        for (const doc of supportingDocs) {
            const result = await uploadAndRecord(doc, 'evidence', 'supporting_doc');
            if (result) uploadedFiles.push(result);
        }

        // --- 4. Respuesta Final ---
        res.status(201).json({
            message: 'Denuncia registrada exitosamente',
            denunciaId,
            filesUploaded: uploadedFiles.length
        });

    } catch (error) {
        console.error('Error CRÍTICO al procesar denuncia:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
};

// --- GESTIÓN DE CASOS ---

const getCases = async (req, res) => {
    try {
        const { id, role } = req.user;
        let query = supabase
            .from('denuncias')
            .select(`
                *,
                user:user_id (id, username, full_name, role),
                assigned_consultant:assigned_consultant_id (id, full_name, username)
            `)
            .order('created_at', { ascending: false });

        if (role === 'citizen') {
            query = query.eq('user_id', id);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching cases:', error);
        res.status(500).json({ message: 'Error al obtener casos' });
    }
};

const getDenunciaById = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        const { data, error } = await supabase
            .from('denuncias')
            .select(`
                *,
                user:user_id (id, username, full_name, role, email),
                assigned_consultant:assigned_consultant_id (id, full_name, username),
                denuncia_archivos (*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Denuncia no encontrada' });

        // Access Control logic
        if (role === 'citizen' && data.user_id !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para ver esta denuncia.' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching denuncia details:', error);
        res.status(500).json({ message: 'Error al obtener detalles de la denuncia' });
    }
};

const takeCase = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { id: caseId } = req.params;

        if (role !== 'consultant') return res.status(403).json({ message: 'Solo consultores.' });

        const { data: existing, error: fetchError } = await supabase
            .from('denuncias')
            .select('assigned_consultant_id, user:user_id(email)')
            .eq('id', caseId)
            .single();

        if (fetchError) throw fetchError;
        if (existing.assigned_consultant_id) return res.status(400).json({ message: 'Caso ya asignado.' });

        // Update status and assignee
        const { error } = await supabase
            .from('denuncias')
            .update({ assigned_consultant_id: userId, status: 'in_progress' })
            .eq('id', caseId);

        if (error) throw error;

        // Notify User
        if (existing.user && existing.user.email) {
            await sendStatusUpdateEmail(existing.user.email, caseId, 'En Progreso (Asignado a Consultor)');
        }

        res.json({ message: 'Caso asignado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al tomar caso.' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { id: caseId } = req.params;
        const { status } = req.body;

        if (!['pending', 'in_progress', 'resolved', 'dismissed'].includes(status)) {
            return res.status(400).json({ message: 'Estado inválido.' });
        }

        // Check ownership if consultant
        if (role === 'consultant') {
            const { data } = await supabase.from('denuncias').select('assigned_consultant_id').eq('id', caseId).single();
            if (!data || data.assigned_consultant_id !== userId) {
                return res.status(403).json({ message: 'No tienes permiso.' });
            }
        } else if (role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado.' });
        }

        const { error } = await supabase.from('denuncias').update({ status }).eq('id', caseId);
        if (error) throw error;

        // Get user email to notify
        const { data: caseData } = await supabase
            .from('denuncias')
            .select('user:user_id(email)')
            .eq('id', caseId)
            .single();

        if (caseData && caseData.user && caseData.user.email) {
            await sendStatusUpdateEmail(caseData.user.email, caseId, status);
        }

        res.json({ message: 'Estado actualizado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error actualizando estado.' });
    }
};

const assignConsultant = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Solo admin.' });
        const { id: caseId } = req.params;
        const { consultantId } = req.body;

        const { error } = await supabase
            .from('denuncias')
            .update({ assigned_consultant_id: consultantId, status: 'in_progress' })
            .eq('id', caseId);

        if (error) throw error;

        // Get user email to notify
        const { data: caseData } = await supabase
            .from('denuncias')
            .select('user:user_id(email)')
            .eq('id', caseId)
            .single();

        if (caseData && caseData.user && caseData.user.email) {
            await sendStatusUpdateEmail(caseData.user.email, caseId, 'En Progreso (Reasignado por Admin)');
        }

        res.json({ message: 'Asignación actualizada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error asignando.' });
    }
};

module.exports = { 
    createDenuncia,
    getCases,
    getDenunciaById,
    takeCase,
    updateStatus,
    assignConsultant
};