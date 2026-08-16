const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');

const {
  getPaymentConfigs,
  getPaymentConfigByMethod,
  createPaymentConfig,
  updatePaymentConfig,
  deletePaymentConfig,
} = require('../controllers/paymentConfigController');

const router = express.Router();

router.use(auth);

//==================================================//
//      Buscando Todas as Configurações             //
//==================================================//

router.get('/', getPaymentConfigs);

//==================================================//
//   Buscando Configuração por Forma de Pagamento   //
//==================================================//

router.get('/:method', getPaymentConfigByMethod);

//==================================================//
//    Criando Configuração de Pagamento             //
//==================================================//

router.post(
  '/',
  [
    body('paymentMethod')
      .notEmpty()
      .withMessage('A forma de pagamento é obrigatória.')
      .isIn(['DINHEIRO', 'PIX', 'CARTAO', 'CREDITO', 'DEBITO', 'BOLETO'])
      .withMessage('Forma de pagamento inválida.'),
  ],
  createPaymentConfig
);

//==================================================//
//    Atualizando Configuração de Pagamento         //
//==================================================//

router.put('/:id', updatePaymentConfig);

//==================================================//
//    Deletando Configuração de Pagamento           //
//==================================================//

router.delete('/:id', deletePaymentConfig);

module.exports = router;
