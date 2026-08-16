const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');

const {
  createServiceOrder,
  getServiceOrders,
  getServiceOrderById,
  updateServiceOrder,
  deleteServiceOrder,
  completeServiceOrder,
  deliverServiceOrder,
} = require('../controllers/serviceOrderController');

const router = express.Router();

router.use(auth);

//==================================================//
//            Criando Ordem de Serviço              //
//==================================================//

router.post(
  '/',
  [
    body('clientId')
      .notEmpty()
      .withMessage('O cliente é obrigatório.')
      .isInt({ min: 1 })
      .withMessage('Informe um cliente válido.'),

    body('equipmentId')
      .notEmpty()
      .withMessage('O equipamento é obrigatório.')
      .isInt({ min: 1 })
      .withMessage('Informe um equipamento válido.'),

    body('technicianId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Informe um técnico válido.'),

    body('reportedIssue')
      .notEmpty()
      .withMessage('O defeito informado é obrigatório.'),
  ],
  createServiceOrder
);

//==================================================//
//      Buscando Todas as Ordens de Serviço         //
//==================================================//

router.get('/', getServiceOrders);

//==================================================//
//       Buscando Ordem de Serviço por ID           //
//==================================================//

router.get('/:id', getServiceOrderById);

//==================================================//
//        Atualizando Ordem de Serviço              //
//==================================================//

router.put(
  '/:id',
  [
    body('clientId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Informe um cliente válido.'),

    body('equipmentId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Informe um equipamento válido.'),

    body('technicianId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Informe um técnico válido.'),

    body('reportedIssue')
      .optional()
      .notEmpty()
      .withMessage('O defeito informado não pode ficar vazio.'),

    body('status')
      .optional()
      .notEmpty()
      .withMessage('O status não pode ficar vazio.'),
  ],
  updateServiceOrder
);

//==================================================//
//         Concluindo Ordem de Serviço              //
//==================================================//

router.patch('/:id/complete', completeServiceOrder);

//==================================================//
//          Entregando Ordem de Serviço             //
//==================================================//

router.patch('/:id/deliver', deliverServiceOrder);

//==================================================//
//         Excluindo Ordem de Serviço               //
//==================================================//

router.delete('/:id', deleteServiceOrder);

module.exports = router;