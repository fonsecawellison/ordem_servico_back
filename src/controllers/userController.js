
const User = require('../models/User');
const Client = require('../models/Client');
const { validationResult } = require('express-validator');
const { syncCustomerIdentity } = require('../services/clientContext');

const ensureClientProfileForUser = async (user) => {
  if (!user || user.role !== 'cliente') {
    return null;
  }

  const { client } = await syncCustomerIdentity({ user, ClientModel: Client, UserModel: User });
  return client;
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'cliente',
    });

    if (user.role === 'cliente') {
      await ensureClientProfileForUser(user);
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      ...(password && { password }),
    });

    if (user.role === 'cliente') {
      await ensureClientProfileForUser(user);
    }

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Você não pode deletar sua própria conta' });
    }

    await user.destroy();
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
