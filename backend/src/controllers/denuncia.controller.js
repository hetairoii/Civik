const supabase = require('../config/supabase');

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

module.exports = { createDenuncia };