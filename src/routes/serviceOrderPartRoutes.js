const express = require('express');
const { body } = require('express-validator');

const {
  createPart,
  getParts,
  getPartById,
  updatePart,
  deletePart,
} = require('../controllers/serviceOrderPartController');

const router = express.Router();

//==================================================//
//             Adicionando Peça à OS                //
//==================================================//

router.post(
  '/',
  [
    body('serviceOrderId')
      .notEmpty()
      .withMessage('A Ordem de Serviço é obrigatória.')
      .isInt({ min: 1 })
      .withMessage('Informe uma Ordem de Serviço válida.'),

    body('description')
      .notEmpty()
      .withMessage('A descrição da peça é obrigatória.'),

    body('quantity')
      .notEmpty()
      .withMessage('A quantidade é obrigatória.')
      .isFloat({ gt: 0 })
      .withMessage('A quantidade deve ser maior que zero.'),

    body('unitPrice')
      .notEmpty()
      .withMessage('O valor unitário é obrigatório.')
      .isFloat({ min: 0 })
      .withMessage('O valor unitário deve ser maior ou igual a R$ 0,00.'),

    body('discount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('O desconto deve ser maior ou igual a R$ 0,00.'),
  ],
  createPart
);

//==================================================//
//            Listando Todas as Peças               //
//==================================================//

router.get('/', getParts);

//==================================================//
//             Buscando Peça por ID                 //
//==================================================//

router.get('/:id', getPartById);

//==================================================//
//             Atualizando Peça                     //
//==================================================//

router.put('/:id', updatePart);

//==================================================//
//              Excluindo Peça                      //
//==================================================//

router.delete('/:id', deletePart);

module.exports = router;