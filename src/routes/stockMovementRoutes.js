const express = require('express');
const { body } = require('express-validator');

const {
  createMovement,
  getMovements,
} = require('../controllers/stockMovementController');

const router = express.Router();

router.post(
  '/',
  [
    body('productId')
      .notEmpty()
      .withMessage('O produto é obrigatório.')
      .isInt({ min: 1 })
      .withMessage('Informe um produto válido.'),

    body('movementType')
      .notEmpty()
      .withMessage('O tipo de movimentação é obrigatório.'),

    body('quantity')
      .notEmpty()
      .withMessage('A quantidade é obrigatória.')
      .isInt({ min: 1 })
      .withMessage('A quantidade deve ser um número inteiro maior que zero.'),
  ],
  createMovement
);

router.get('/', getMovements);

module.exports = router;
