
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const { validationResult } = require('express-validator');
const { resolveClientForUser } = require('../services/clientContext');

const attachClientContext = async (user) => {
  if (!user || user.role !== 'cliente') {
    return user;
  }

  await resolveClientForUser(user, Client);
  return user;
};

const register = async (req, res) => {
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
      const client = await Client.findOne({ where: { email: user.email } });
      if (!client) {
        await Client.create({ name: user.name, email: user.email });
      }
    }

    const userWithClient = await attachClientContext(user);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: userWithClient.id,
        name: userWithClient.name,
        email: userWithClient.email,
        role: userWithClient.role,
        ...(userWithClient.role === 'cliente' ? { clientId: userWithClient.clientId } : {}),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    //const user = await User.findOne({ where: { email } });
    const user = await User.findOne({ where: { email } });

    console.log("LOGIN:", email);
    console.log("USUÁRIO:", user);
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const userWithClient = await attachClientContext(user);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: userWithClient.id,
        name: userWithClient.name,
        email: userWithClient.email,
        role: userWithClient.role,
        ...(userWithClient.role === 'cliente' ? { clientId: userWithClient.clientId } : {}),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await attachClientContext(req.user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === 'cliente' ? { clientId: user.clientId } : {}),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

module.exports = { register, login, getMe };
