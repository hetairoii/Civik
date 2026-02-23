const { Router } = require('express');
const { createDenuncia } = require('../controllers/denuncia.controller');
const multer = require('multer');

const router = Router();

// Configuración de Multer
const storage = multer.memoryStorage(); // Guardamos en memoria para procesar o subir a la nube luego
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 300 * 1024 * 1024, // Limite general alto (300MB), la validación fina se hará en el controlador o middleware específico
    }
});

// Middleware para manejar los campos de archivos
// NOTA: Se ha removido idPhoto ya que no se pide en la nueva versión
const uploadFields = upload.fields([
    { name: 'supportingDocs', maxCount: 10 }
]);

// Define el endpoint para recibir denuncias
router.post('/denuncias', uploadFields, createDenuncia);

module.exports = router;
