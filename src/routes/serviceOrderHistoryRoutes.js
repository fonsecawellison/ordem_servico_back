const express = require('express');
const { body } = require('express-validator');

const {
  createHistory,
  getHistories,
  getHistoriesByServiceOrderId,
  getHistoryById,
  updateHistory,
  deleteHistory,
} = require('../controllers/serviceOrderHistoryController');

const router = express.Router();

//==================================================//
//          Registrando evento na Ordem de Serviço   //
//==================================================//

router.post(
  '/',
  [
    body('serviceOrderId')
      .notEmpty()
      .withMessage('A Ordem de Serviço é obrigatória.')
      .isInt({ min: 1 })
      .withMessage('Informe uma Ordem de Serviço válida.'),

    body('eventType')
      .notEmpty()
      .withMessage('O tipo do evento é obrigatório.'),

    body('description')
      .notEmpty()
      .withMessage('A descrição do evento é obrigatória.'),
  ],
  createHistory
);

//==================================================//
//        Listando histórico completo ou por OS      //
//==================================================//

router.get('/', getHistories);
router.get('/service-order/:serviceOrderId', getHistoriesByServiceOrderId);

//==================================================//
//          Buscando evento por ID                   //
//==================================================//

router.get('/:id', getHistoryById);

//==================================================//
//             Atualizando evento                    //
//==================================================//

router.put('/:id', updateHistory);

//==================================================//
//              Excluindo evento                     //
//==================================================//

router.delete('/:id', deleteHistory);

module.exports = router;
