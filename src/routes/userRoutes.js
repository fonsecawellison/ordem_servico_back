
const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Obter todos os usuários
// @access  Privado (admin, tecnico, cliente)
router.get('/', auth, authorizeRoles('admin', 'tecnico', 'cliente'), getAllUsers);

// @route   GET /api/users/:id
// @desc    Obter usuário por ID
// @access  Privado (admin, tecnico, ou próprio usuário)
router.get('/:id', auth, getUserById);

// @route   POST /api/users
// @desc    Criar novo usuário
// @access  Privado (admin)
router.post(
  '/',
  auth,
  authorizeRoles('admin'),
  [
    body('name', 'Nome é obrigatório').not().isEmpty(),
    body('email', 'Por favor, inclua um email válido').isEmail(),
    body('password', 'Senha deve ter pelo menos 6 caracteres').isLength({ min: 6 }),
  ],
  createUser
);

// @route   PUT /api/users/:id
// @desc    Atualizar usuário
// @access  Privado (admin, ou próprio usuário)
router.put(
  '/:id',
  auth,
  [
    body('name', 'Nome é obrigatório').optional().not().isEmpty(),
    body('email', 'Por favor, inclua um email válido').optional().isEmail(),
    body('password', 'Senha deve ter pelo menos 6 caracteres').optional().isLength({ min: 6 }),
  ],
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Deletar usuário
// @access  Privado (admin)
router.delete('/:id', auth, authorizeRoles('admin'), deleteUser);

module.exports = router;
