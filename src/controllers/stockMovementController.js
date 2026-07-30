const { validationResult } = require('express-validator');

const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const createMovement = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      productId,
      movementType,
      quantity,
      unitPrice,
      reference,
      notes,
    } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Produto não encontrado.',
      });
    }

    if (!['ENTRADA', 'SAIDA'].includes(movementType)) {
      return res.status(400).json({
        message: 'O tipo de movimentação deve ser ENTRADA ou SAIDA.',
      });
    }

    const quantityNumber = Number(quantity);

    if (movementType === 'SAIDA' && product.stockQuantity < quantityNumber) {
      return res.status(400).json({
        message: 'Estoque insuficiente para esta saída.',
      });
    }

    const newStockQuantity = movementType === 'ENTRADA'
      ? product.stockQuantity + quantityNumber
      : product.stockQuantity - quantityNumber;

    await product.update({ stockQuantity: newStockQuantity });

    const movement = await StockMovement.create({
      productId,
      movementType,
      quantity: quantityNumber,
      unitPrice: unitPrice || 0,
      reference: reference || null,
      notes: notes || null,
    });

    return res.status(201).json({
      message: 'Movimentação registrada com sucesso.',
      movement,
      product,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

const getMovements = async (req, res) => {
  try {

    const movements = await StockMovement.findAll({
      include: [
        {
          model: Product,
          as: 'product',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(movements);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

module.exports = {
  createMovement,
  getMovements,
};
