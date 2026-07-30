const { validationResult } = require('express-validator');

const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderPart = require('../models/ServiceOrderPart');
const ServiceOrderHistory = require('../models/ServiceOrderHistory');

//==================================================//
//              Adicionando Peça à OS               //
//==================================================//

const createPart = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      serviceOrderId,
      description,
      brand,
      quantity,
      unitPrice,
      discount,
    } = req.body;

    const serviceOrder = await ServiceOrder.findByPk(serviceOrderId);

    if (!serviceOrder) {
      return res.status(404).json({
        message: `Não existe uma Ordem de Serviço com o ID ${serviceOrderId}.`,
      });
    }

    const subtotal =
      (Number(quantity) * Number(unitPrice)) - Number(discount || 0);

    const part = await ServiceOrderPart.create({
      serviceOrderId,
      description,
      brand,
      quantity,
      unitPrice,
      discount: discount || 0,
      subtotal,
    });

    await ServiceOrderHistory.create({
      serviceOrderId,
      eventType: 'PECA_ADICIONADA',
      description: 'Peça adicionada à ordem',
      details: `Descrição: ${description}. Marca: ${brand || 'N/A'}. Quantidade: ${quantity}. Valor unitário: ${unitPrice}. Desconto: ${discount || 0}.`,
      createdBy: 'sistema',
    });

    return res.status(201).json({
      message: 'Peça adicionada com sucesso.',
      part,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//          Listando Todas as Peças                 //
//==================================================//

const getParts = async (req, res) => {
  try {

    const parts = await ServiceOrderPart.findAll({
      order: [['id', 'ASC']],
    });

    return res.status(200).json(parts);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//             Buscando Peça por ID                 //
//==================================================//

const getPartById = async (req, res) => {
  try {

    const { id } = req.params;

    const part = await ServiceOrderPart.findByPk(id);

    if (!part) {
      return res.status(404).json({
        message: 'Peça não encontrada.',
      });
    }

    return res.status(200).json(part);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//             Atualizando Peça                     //
//==================================================//

const updatePart = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      description,
      brand,
      quantity,
      unitPrice,
      discount,
    } = req.body;

    const part = await ServiceOrderPart.findByPk(id);

    if (!part) {
      return res.status(404).json({
        message: 'Peça não encontrada.',
      });
    }

    const newQuantity =
      quantity !== undefined ? Number(quantity) : Number(part.quantity);

    const newUnitPrice =
      unitPrice !== undefined ? Number(unitPrice) : Number(part.unitPrice);

    const newDiscount =
      discount !== undefined ? Number(discount) : Number(part.discount);

    const subtotal =
      (newQuantity * newUnitPrice) - newDiscount;

    await part.update({
      description: description ?? part.description,
      brand: brand ?? part.brand,
      quantity: newQuantity,
      unitPrice: newUnitPrice,
      discount: newDiscount,
      subtotal,
    });

    return res.status(200).json({
      message: 'Peça atualizada com sucesso.',
      part,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//              Excluindo Peça                      //
//==================================================//

const deletePart = async (req, res) => {
  try {

    const { id } = req.params;

    const part = await ServiceOrderPart.findByPk(id);

    if (!part) {
      return res.status(404).json({
        message: 'Peça não encontrada.',
      });
    }

    await part.destroy();

    return res.status(200).json({
      message: 'Peça excluída com sucesso.',
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

module.exports = {
  createPart,
  getParts,
  getPartById,
  updatePart,
  deletePart,
};