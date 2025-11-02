// En: src/config/mailer.js
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com', // O el host de tu proveedor de email
  port: 465,
  secure: true, // true para puerto 465
  auth: {
    user: process.env.EMAIL_USER, // Tu email (ej: "tu-app@gmail.com")
    pass: process.env.EMAIL_PASS, // Tu "contraseña de aplicación" de Gmail
  },
});

transport.verify().then(() => {
  console.log('Nodemailer listo para enviar correos.');
}).catch(err => {
  console.error('Error al configurar Nodemailer. Revisa tus variables .env (EMAIL_USER, EMAIL_PASS):', err);
});

module.exports = transport;