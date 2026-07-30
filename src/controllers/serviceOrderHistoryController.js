const { validationResult } = require('express-validator');

const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderHistory = require('../models/ServiceOrderHistory');

//==================================================//
//           Registrando evento na OS               //
//==================================================//

const createHistory = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      serviceOrderId,
      eventType,
      description,
      details,
      createdBy,
    } = req.body;

    const serviceOrder = await ServiceOrder.findByPk(serviceOrderId);

    if (!serviceOrder) {
      return res.status(404).json({
        message: `Não existe uma Ordem de Serviço com o ID ${serviceOrderId}.`,
      });
    }

    const history = await ServiceOrderHistory.create({
      serviceOrderId,
      eventType,
      description,
      details: details || null,
      createdBy: createdBy || null,
    });

    return res.status(201).json({
      message: 'Evento registrado com sucesso.',
      history,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//        Listando histórico da Ordem de Serviço     //
//==================================================//

const getHistories = async (req, res) => {
  try {

    const { serviceOrderId } = req.query;

    const where = serviceOrderId ? { serviceOrderId } : {};

    const histories = await ServiceOrderHistory.findAll({
      where,
      order: [['eventDate', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json(histories);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//      Listando histórico por Ordem de Serviço      //
//==================================================//

const getHistoriesByServiceOrderId = async (req, res) => {
  try {

    const { serviceOrderId } = req.params;

    const serviceOrder = await ServiceOrder.findByPk(serviceOrderId);

    if (!serviceOrder) {
      return res.status(404).json({
        message: 'Ordem de Serviço não encontrada.',
      });
    }

    const histories = await ServiceOrderHistory.findAll({
      where: { serviceOrderId },
      order: [['eventDate', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json(histories);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//          Buscando evento por ID                   //
//==================================================//

const getHistoryById = async (req, res) => {
  try {

    const { id } = req.params;

    const history = await ServiceOrderHistory.findByPk(id);

    if (!history) {
      return res.status(404).json({
        message: 'Histórico não encontrado.',
      });
    }

    return res.status(200).json(history);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//             Atualizando evento                    //
//==================================================//

const updateHistory = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      eventType,
      description,
      details,
      createdBy,
    } = req.body;

    const history = await ServiceOrderHistory.findByPk(id);

    if (!history) {
      return res.status(404).json({
        message: 'Histórico não encontrado.',
      });
    }

    await history.update({
      eventType: eventType ?? history.eventType,
      description: description ?? history.description,
      details: details ?? history.details,
      createdBy: createdBy ?? history.createdBy,
    });

    return res.status(200).json({
      message: 'Evento atualizado com sucesso.',
      history,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//              Excluindo evento                     //
//==================================================//

const deleteHistory = async (req, res) => {
  try {

    const { id } = req.params;

    const history = await ServiceOrderHistory.findByPk(id);

    if (!history) {
      return res.status(404).json({
        message: 'Histórico não encontrado.',
      });
    }

    await history.destroy();

    return res.status(200).json({
      message: 'Evento excluído com sucesso.',
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

module.exports = {
  createHistory,
  getHistories,
  getHistoriesByServiceOrderId,
  getHistoryById,
  updateHistory,
  deleteHistory,
};
