const { validationResult } = require('express-validator');

const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderService = require('../models/ServiceOrderService');
const ServiceOrderHistory = require('../models/ServiceOrderHistory');

//==================================================//
//             Adicionando Serviço à OS             //
//==================================================//

const createService = async (req, res) => {
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
      quantity,
      unitPrice,
      discount,
    } = req.body;

    // Verifica se a Ordem de Serviço existe
    const serviceOrder = await ServiceOrder.findByPk(serviceOrderId);

    if (!serviceOrder) {
      return res.status(404).json({
        message: `Não existe uma Ordem de Serviço com o ID ${serviceOrderId}.`,
      });
    }

    // Calcula automaticamente o subtotal
    const subtotal =
      (Number(quantity) * Number(unitPrice)) - Number(discount || 0);

    const service = await ServiceOrderService.create({
      serviceOrderId,
      description,
      quantity,
      unitPrice,
      discount: discount || 0,
      subtotal,
    });

    await ServiceOrderHistory.create({
      serviceOrderId,
      eventType: 'SERVICO_ADICIONADO',
      description: 'Serviço adicionado à ordem',
      details: `Descrição: ${description}. Quantidade: ${quantity}. Valor unitário: ${unitPrice}. Desconto: ${discount || 0}.`,
      createdBy: 'sistema',
    });

    return res.status(201).json({
      message: 'Serviço adicionado com sucesso.',
      service,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//     Listando Serviços de uma Ordem de Serviço    //
//==================================================//

const getServices = async (req, res) => {
  try {

    const services = await ServiceOrderService.findAll({
      order: [['id', 'ASC']],
    });

    return res.status(200).json(services);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//      Buscando Serviço por ID                     //
//==================================================//

const getServiceById = async (req, res) => {
  try {

    const { id } = req.params;

    const service = await ServiceOrderService.findByPk(id);

    if (!service) {
      return res.status(404).json({
        message: 'Serviço não encontrado.',
      });
    }

    return res.status(200).json(service);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//            Atualizando Serviço                   //
//==================================================//

const updateService = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      description,
      quantity,
      unitPrice,
      discount,
    } = req.body;

    const service = await ServiceOrderService.findByPk(id);

    if (!service) {
      return res.status(404).json({
        message: 'Serviço não encontrado.',
      });
    }

    const newQuantity =
      quantity !== undefined ? Number(quantity) : Number(service.quantity);

    const newUnitPrice =
      unitPrice !== undefined ? Number(unitPrice) : Number(service.unitPrice);

    const newDiscount =
      discount !== undefined ? Number(discount) : Number(service.discount);

    const subtotal =
      (newQuantity * newUnitPrice) - newDiscount;

    await service.update({
      description: description ?? service.description,
      quantity: newQuantity,
      unitPrice: newUnitPrice,
      discount: newDiscount,
      subtotal,
    });

    return res.status(200).json({
      message: 'Serviço atualizado com sucesso.',
      service,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//             Excluindo Serviço                    //
//==================================================//

const deleteService = async (req, res) => {
  try {

    const { id } = req.params;

    const service = await ServiceOrderService.findByPk(id);

    if (!service) {
      return res.status(404).json({
        message: 'Serviço não encontrado.',
      });
    }

    await service.destroy();

    return res.status(200).json({
      message: 'Serviço excluído com sucesso.',
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
};