const express = require('express');
const { body } = require('express-validator');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

//==================================================//
//                Criando Produto                  //
//==================================================//

router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('O nome do produto é obrigatório.'),

    body('stockQuantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('A quantidade em estoque deve ser um número inteiro positivo.'),

    body('minimumStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('O estoque mínimo deve ser um número inteiro positivo.'),

    body('unitPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('O preço unitário deve ser maior ou igual a zero.'),
  ],
  createProduct
);

//==================================================//
//              Listando Produtos                  //
//==================================================//

router.get('/', getProducts);

//==================================================//
//              Buscando Produto por ID            //
//==================================================//

router.get('/:id', getProductById);

//==================================================//
//              Atualizando Produto                //
//==================================================//

router.put('/:id', updateProduct);

//==================================================//
//               Excluindo Produto                 //
//==================================================//

router.delete('/:id', deleteProduct);

module.exports = router;
