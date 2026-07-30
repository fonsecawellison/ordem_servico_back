const express = require('express');
const { body } = require('express-validator');

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');

const router = express.Router();

//==================================================//
//                 Criando Cliente                  //
//==================================================//

router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('O nome é obrigatório.'),

    body('email')
      .optional()
      .isEmail()
      .withMessage('Informe um e-mail válido.'),
  ],
  createClient
);

//==================================================//
//            Buscando Todos os Clientes           //
//==================================================//

router.get('/', getClients);

//==================================================//
//             Buscando Cliente por ID             //
//==================================================//

router.get('/:id', getClientById);

//==================================================//
//              Atualizando Cliente                //
//==================================================//

router.put(
  '/:id',
  [
    body('name')
      .notEmpty()
      .withMessage('O nome é obrigatório.'),

    body('email')
      .optional()
      .isEmail()
      .withMessage('Informe um e-mail válido.'),
  ],
  updateClient
);

//==================================================//
//               Excluindo Cliente                 //
//==================================================//

router.delete('/:id', deleteClient);

module.exports = router;