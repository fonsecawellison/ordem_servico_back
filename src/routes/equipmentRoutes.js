const express = require('express');
const { body } = require('express-validator');

const {
  createEquipment,
  getEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');

const router = express.Router();

//==================================================//
//              Criando Equipamento                 //
//==================================================//

router.post(
  '/',
  [
    body('clientId')
      .notEmpty()
      .withMessage('O cliente é obrigatório.')
      .isInt()
      .withMessage('O cliente deve ser um ID válido.'),

    body('type')
      .notEmpty()
      .withMessage('O tipo do equipamento é obrigatório.'),

    body('brand')
      .notEmpty()
      .withMessage('A marca é obrigatória.'),

    body('model')
      .notEmpty()
      .withMessage('O modelo é obrigatório.'),
  ],
  createEquipment
);

//==================================================//
//         Buscando Todos os Equipamentos           //
//==================================================//

router.get('/', getEquipments);

//==================================================//
//          Buscando Equipamento por ID             //
//==================================================//

router.get('/:id', getEquipmentById);

//==================================================//
//           Atualizando Equipamento                //
//==================================================//

router.put(
  '/:id',
  [
    body('clientId')
      .optional()
      .isInt()
      .withMessage('O cliente deve ser um ID válido.'),

    body('type')
      .optional()
      .notEmpty()
      .withMessage('O tipo do equipamento é obrigatório.'),

    body('brand')
      .optional()
      .notEmpty()
      .withMessage('A marca é obrigatória.'),

    body('model')
      .optional()
      .notEmpty()
      .withMessage('O modelo é obrigatório.'),
  ],
  updateEquipment
);

//==================================================//
//             Excluindo Equipamento                //
//==================================================//

router.delete('/:id', deleteEquipment);

module.exports = router;