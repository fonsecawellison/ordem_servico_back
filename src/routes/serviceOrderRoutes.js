const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

const {
  createServiceOrder,
  getServiceOrders,
  getServiceOrderById,
  updateServiceOrder,
  deleteServiceOrder,
  completeServiceOrder,
  registerPaymentMethod,
  registerPaymentWithProof,
  confirmPaymentReceived,
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
//       Registrando Pagamento com Comprovante      //
//==================================================//

router.post('/:id/payment-proof', 
  upload.single('paymentProof'),
  [
    body('paymentMethod')
      .notEmpty()
      .withMessage('A forma de pagamento é obrigatória.')
      .isIn(['DINHEIRO', 'PIX', 'CARTAO', 'CREDITO', 'DEBITO', 'BOLETO'])
      .withMessage('Forma de pagamento inválida.'),
  ],
  registerPaymentWithProof
);

//==================================================//
//          Entregando Ordem de Serviço             //
//==================================================//

router.patch('/:id/payment', [
  body('paymentMethod')
    .notEmpty()
    .withMessage('A forma de pagamento é obrigatória.')
    .isIn(['DINHEIRO', 'PIX', 'CARTAO', 'CREDITO', 'DEBITO', 'BOLETO'])
    .withMessage('Forma de pagamento inválida.'),
], registerPaymentMethod);

router.patch('/:id/payment-confirmed', confirmPaymentReceived);

router.patch('/:id/deliver', deliverServiceOrder);

//==================================================//
//         Excluindo Ordem de Serviço               //
//==================================================//

router.delete('/:id', deleteServiceOrder);

module.exports = router;