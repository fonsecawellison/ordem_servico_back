const express = require('express');
const { body } = require('express-validator');

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceOrderServiceController');

const router = express.Router();

//==================================================//
//        Adicionando Serviço à Ordem de Serviço    //
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
      .withMessage('A descrição do serviço é obrigatória.'),

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
  createService
);

//==================================================//
//         Listando Todos os Serviços               //
//==================================================//

router.get('/', getServices);

//==================================================//
//          Buscando Serviço por ID                 //
//==================================================//

router.get('/:id', getServiceById);

//==================================================//
//            Atualizando Serviço                   //
//==================================================//

router.put('/:id', updateService);

//==================================================//
//             Excluindo Serviço                    //
//==================================================//

router.delete('/:id', deleteService);

module.exports = router;