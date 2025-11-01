// src/middleware/checkAdmin.middleware.js

/**
 * Middleware para verificar si el usuario es Administrador.
 * DEBE usarse SIEMPRE DESPUÉS de 'authMiddleware'.
 */
const checkAdmin = (req, res, next) => {
  // authMiddleware ya debe haber adjuntado 'req.chef'
  if (!req.chef) {
    return res.status(401).json({ message: 'No autorizado, token inválido o chef no encontrado' });
  }

  // Verificamos el rol del chef que encontramos en la BD
  if (req.chef.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  // Si es admin, permitimos continuar a la siguiente función
  next();
};

module.exports = checkAdmin;