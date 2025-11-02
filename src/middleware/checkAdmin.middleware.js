const checkAdmin = (req, res, next) => {
  if (!req.chef) {
    return res.status(401).json({ message: 'No autorizado, token inválido o chef no encontrado' });
  }

  if (req.chef.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  next();
};

module.exports = checkAdmin;
