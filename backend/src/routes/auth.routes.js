const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
// Middleware opcional para verificar token de admin en rutas protegidas
// const { verifyToken, isAdmin } = require('../middleware/auth'); 

router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas de Admin (Deberían estar protegidas con middleware en producción)
// router.get('/admin/pending-consultants', verifyToken, isAdmin, authController.getPendingConsultants);
router.get('/admin/pending-consultants', authController.getPendingConsultants);
router.put('/admin/approve/:userId', authController.approveConsultant);

module.exports = router;
