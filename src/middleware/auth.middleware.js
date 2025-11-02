const jwt = require('jsonwebtoken');
const Chef = require('../models/chef.model');

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.chef = await Chef.findById(decoded.id).select('-password');
      
      if (!req.chef) {
        return res.status(401).json({ message: 'No autorizado, chef no encontrado' });
      }

      next();
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
