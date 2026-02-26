const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendStatusUpdateEmail = async (toEmail, caseId, newStatus) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: `Actualización de Estado - Caso #${caseId}`,
            html: `
                <h1>Actualización de tu Denuncia</h1>
                <p>El estado de tu caso (ID: ${caseId}) ha sido actualizado.</p>
                <p><strong>Nuevo Estado:</strong> ${newStatus}</p>
                <p>Puedes ver más detalles iniciando sesión en la plataforma Civik.</p>
                <br>
                <p>Atentamente,<br>El equipo de Civik</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendVerificationEmail = async (toEmail, token) => {
    const url = `http://localhost:5173/verify-email?token=${token}`;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Verifica tu cuenta en Civik',
            html: `
                <h1>Bienvenido a Civik</h1>
                <p>Para activar tu cuenta, por favor haz clic en el siguiente enlace:</p>
                <a href="${url}">Verificar Cuenta</a>
                <p>Este enlace es válido por un solo uso.</p>
            `
        });
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};

const sendPasswordResetEmail = async (toEmail, token) => {
    const url = `http://localhost:5173/reset-password?token=${token}`;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Restablecer Contraseña - Civik',
            html: `
                <h1>Restablecer Contraseña</h1>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <a href="${url}">Restablecer Contraseña</a>
                <p>Si no solicitaste esto, ignora este correo.</p>
            `
        });
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

module.exports = { sendStatusUpdateEmail, sendVerificationEmail, sendPasswordResetEmail };
