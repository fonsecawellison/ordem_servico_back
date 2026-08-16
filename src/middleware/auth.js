
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { resolveClientForUser } = require('../services/clientContext');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    if (user.role === 'cliente') {
      await resolveClientForUser(user);
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado: permissões insuficientes' });
    }

    next();
  };
};

module.exports = { auth, authorizeRoles };
