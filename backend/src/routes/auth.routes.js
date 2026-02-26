const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Verificación y Recuperación de Contraseña
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Perfil de Usuario
router.get('/me', verifyToken, authController.getMe);

// Rutas de Admin (Deberían estar protegidas con middleware en producción)
// router.get('/admin/pending-consultants', verifyToken, isAdmin, authController.getPendingConsultants);
router.get('/admin/pending-consultants', authController.getPendingConsultants);
router.put('/admin/approve/:userId', authController.approveConsultant);

module.exports = router;
