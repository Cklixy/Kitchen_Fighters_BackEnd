// src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const Chef = require('../models/chef.model');

/**
 * Middleware para verificar el token JWT y autenticar al chef.
 */
const authMiddleware = async (req, res, next) => {
  let token;

  // 1. Buscamos el token en el header 'Authorization'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extraemos el token (formato: "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificamos el token con el secreto del .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET); //

      // 4. Buscamos al chef en la BD (sin la contraseña)
      //    y lo "adjuntamos" al objeto 'req' para que
      //    los siguientes controladores puedan usarlo.
      req.chef = await Chef.findById(decoded.id).select('-password');
      
      if (!req.chef) {
        return res.status(401).json({ message: 'No autorizado, chef no encontrado' });
      }

      next(); // ¡Todo bien! Continuar a la ruta.
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'No autorizado, token inválido' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

module.exports = authMiddleware;