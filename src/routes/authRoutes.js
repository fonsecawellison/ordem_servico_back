
const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registrar um novo usuário
// @access  Público
router.post(
  '/register',
  [
    body('name', 'Nome é obrigatório').not().isEmpty(),
    body('email', 'Por favor, inclua um email válido').isEmail(),
    body('password', 'Senha deve ter pelo menos 6 caracteres').isLength({ min: 6 }),
  ],
  register
);

// @route   POST /api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Público
router.post(
  '/login',
  [
    body('email', 'Por favor, inclua um email válido').isEmail(),
    body('password', 'Senha é obrigatória').exists(),
  ],
  login
);

// @route   GET /api/auth/me
// @desc    Obter dados do usuário autenticado
// @access  Privado
router.get('/me', auth, getMe);

module.exports = router;
