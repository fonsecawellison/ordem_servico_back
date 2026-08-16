const { validationResult } = require('express-validator');

const ServiceOrder = require('../models/ServiceOrder');
const Client = require('../models/Client');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const ServiceOrderHistory = require('../models/ServiceOrderHistory');
const { buildServiceOrderAccessFilter, canManageServiceOrder, getAllowedStatusTransitions } = require('../services/serviceOrderAccess');
const { resolveClientForUser } = require('../services/clientContext');

//==================================================//
//             Criando Ordem de Serviço             //
//==================================================//

const createServiceOrder = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      clientId,
      equipmentId,
      technicianId,
      reportedIssue,
      diagnosis,
      solution,
      estimatedCompletion,
      notes,
    } = req.body;

    if (req.user?.role === 'tecnico') {
      return res.status(403).json({ message: 'Técnicos não podem criar ordens de serviço.' });
    }

    if (req.user?.role === 'cliente') {
      return res.status(403).json({ message: 'Clientes não podem criar ordens de serviço.' });
    }

    // Verifica se o cliente existe
    const client = await Client.findByPk(clientId);

    if (!client) {
      return res.status(404).json({
        message: `Não existe um cliente cadastrado com o ID ${clientId}.`,
      });
    }

    // Verifica se o equipamento existe
    const equipment = await Equipment.findByPk(equipmentId);

    if (!equipment) {
      return res.status(404).json({
        message: `Não existe um equipamento cadastrado com o ID ${equipmentId}.`,
      });
    }

    // Verifica se o equipamento pertence ao cliente informado
    if (equipment.clientId !== client.id) {
      return res.status(400).json({
        message: 'O equipamento informado não pertence ao cliente selecionado.',
      });
    }

    if (technicianId) {
      const technician = await User.findByPk(technicianId);

      if (!technician) {
        return res.status(404).json({
          message: `Não existe um usuário cadastrado com o ID ${technicianId}.`,
        });
      }

      if (!['admin', 'tecnico'].includes(technician.role)) {
        return res.status(400).json({
          message: 'O usuário informado não possui perfil de técnico.',
        });
      }
    }

    const serviceOrder = await ServiceOrder.create({
      clientId,
      equipmentId,
      technicianId: technicianId || null,
      reportedIssue,
      diagnosis,
      solution,
      estimatedCompletion,
      notes,
    });

    await ServiceOrderHistory.create({
      serviceOrderId: serviceOrder.id,
      eventType: 'ORDEM_CRIADA',
      description: 'Ordem de Serviço criada',
      details: 'A Ordem de Serviço foi criada com sucesso.',
      createdBy: 'sistema',
    });

    return res.status(201).json({
      message: 'Ordem de Serviço criada com sucesso.',
      serviceOrder,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//        Buscando Todas as Ordens de Serviço       //
//==================================================//

const getServiceOrders = async (req, res) => {
  try {
    if (req.user?.role === 'cliente') {
      await resolveClientForUser(req.user, Client);
    }

    const accessFilter = buildServiceOrderAccessFilter(req.user || {});

    const serviceOrders = await ServiceOrder.findAll({
      where: accessFilter,
      include: [
        {
          model: Client,
          as: 'client',
        },
        {
          model: Equipment,
          as: 'equipment',
        },
        {
          model: User,
          as: 'technician',
        },
      ],
      order: [['id', 'ASC']],
    });

    return res.status(200).json(serviceOrders);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//      Buscando Ordem de Serviço por ID            //
//==================================================//

const getServiceOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const accessFilter = buildServiceOrderAccessFilter(req.user || {});

    const serviceOrder = await ServiceOrder.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
        },
        {
          model: Equipment,
          as: 'equipment',
        },
        {
          model: User,
          as: 'technician',
        },
      ],
    });

    if (!serviceOrder) {
      return res.status(404).json({
        message: 'Ordem de Serviço não encontrada.',
      });
    }

    const matchesAccessFilter = Object.keys(accessFilter).every((key) => {
      if (key === 'clientId') return Number(serviceOrder.clientId) === Number(accessFilter.clientId);
      if (key === 'technicianId') return Number(serviceOrder.technicianId) === Number(accessFilter.technicianId);
      return true;
    });

    if (!canManageServiceOrder(req.user || {}, serviceOrder) && !matchesAccessFilter) {
      return res.status(403).json({ message: 'Acesso negado: esta ordem não está disponível para o seu perfil.' });
    }

    return res.status(200).json(serviceOrder);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//           Atualizando Ordem de Serviço           //
//==================================================//

const updateServiceOrder = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    const serviceOrder = await ServiceOrder.findByPk(id);

    if (!serviceOrder) {
      return res.status(404).json({
        message: 'Ordem de Serviço não encontrada.',
      });
    }

    const {
      clientId,
      equipmentId,
      technicianId,
      reportedIssue,
      diagnosis,
      solution,
      status,
      estimatedCompletion,
      completionDate,
      deliveryDate,
      notes,
    } = req.body;

    const previousStatus = serviceOrder.status;
    const previousTechnicianId = serviceOrder.technicianId;
    const previousNotes = serviceOrder.notes;

    if (!canManageServiceOrder(req.user || {}, serviceOrder)) {
      return res.status(403).json({ message: 'Acesso negado: você não pode alterar esta ordem de serviço.' });
    }

    if (req.user?.role === 'tecnico' && (clientId !== undefined || equipmentId !== undefined || technicianId !== undefined || reportedIssue !== undefined || diagnosis !== undefined || solution !== undefined || estimatedCompletion !== undefined || completionDate !== undefined || deliveryDate !== undefined || notes !== undefined)) {
      return res.status(403).json({ message: 'Técnicos só podem atualizar o status da ordem de serviço.' });
    }

    if (status && req.user?.role === 'tecnico') {
      const allowedStatuses = getAllowedStatusTransitions(req.user.role);
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status não permitido para o perfil técnico.' });
      }
    }

    if (technicianId !== undefined) {
      if (technicianId) {
        const technician = await User.findByPk(technicianId);

        if (!technician) {
          return res.status(404).json({
            message: `Não existe um usuário cadastrado com o ID ${technicianId}.`,
          });
        }

        if (!['admin', 'tecnico'].includes(technician.role)) {
          return res.status(400).json({
            message: 'O usuário informado não possui perfil de técnico.',
          });
        }
      }
    }

    await serviceOrder.update({
      clientId: clientId ?? serviceOrder.clientId,
      equipmentId: equipmentId ?? serviceOrder.equipmentId,
      technicianId: technicianId ?? serviceOrder.technicianId,
      reportedIssue: reportedIssue ?? serviceOrder.reportedIssue,
      diagnosis: diagnosis ?? serviceOrder.diagnosis,
      solution: solution ?? serviceOrder.solution,
      status: status ?? serviceOrder.status,
      estimatedCompletion: estimatedCompletion ?? serviceOrder.estimatedCompletion,
      completionDate: completionDate ?? serviceOrder.completionDate,
      deliveryDate: deliveryDate ?? serviceOrder.deliveryDate,
      notes: notes ?? serviceOrder.notes,
    });

    if (status && status !== previousStatus) {
      await ServiceOrderHistory.create({
        serviceOrderId: serviceOrder.id,
        eventType: 'STATUS',
        description: `Status alterado para ${status}`,
        details: `Status anterior: ${previousStatus}. Status atual: ${status}`,
        createdBy: 'sistema',
      });
    }

    if (technicianId !== undefined && technicianId !== previousTechnicianId) {
      const previousTechnician = previousTechnicianId
        ? await User.findByPk(previousTechnicianId)
        : null;
      const newTechnician = technicianId
        ? await User.findByPk(technicianId)
        : null;

      const previousName = previousTechnician ? previousTechnician.name : 'Nenhum';
      const newName = newTechnician ? newTechnician.name : 'Nenhum';

      await ServiceOrderHistory.create({
        serviceOrderId: serviceOrder.id,
        eventType: 'TECNICO_ALTERADO',
        description: 'Técnico responsável alterado',
        details: `Responsável anterior: ${previousName}. Responsável atual: ${newName}.`,
        createdBy: 'sistema',
      });
    }

    if (notes !== undefined && notes !== previousNotes) {
      await ServiceOrderHistory.create({
        serviceOrderId: serviceOrder.id,
        eventType: 'OBSERVACAO_ADICIONADA',
        description: 'Observação adicionada',
        details: notes,
        createdBy: 'sistema',
      });
    }

    return res.status(200).json({
      message: 'Ordem de Serviço atualizada com sucesso.',
      serviceOrder,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//            Excluindo Ordem de Serviço            //
//==================================================//

const deleteServiceOrder = async (req, res) => {
  return res.status(501).json({
    message: 'Método será implementado na próxima etapa.',
  });
};

//==================================================//
//           Concluindo Ordem de Serviço           //
//==================================================//

const completeServiceOrder = async (req, res) => {
  try {

    const { id } = req.params;

    const serviceOrder = await ServiceOrder.findByPk(id);

    if (!serviceOrder) {
      return res.status(404).json({
        message: 'Ordem de Serviço não encontrada.',
      });
    }

    if (!canManageServiceOrder(req.user || {}, serviceOrder)) {
      return res.status(403).json({ message: 'Acesso negado: você não pode concluir esta ordem de serviço.' });
    }

    const completionDate = new Date();

    await serviceOrder.update({
      status: 'CONCLUIDA',
      completionDate,
    });

    await ServiceOrderHistory.create({
      serviceOrderId: serviceOrder.id,
      eventType: 'ORDEM_CONCLUIDA',
      description: 'Ordem de Serviço concluída',
      details: `A ordem foi marcada como concluída em ${completionDate.toISOString()}.`,
      createdBy: 'sistema',
    });

    return res.status(200).json({
      message: 'Ordem de Serviço concluída com sucesso.',
      serviceOrder,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//            Entregando Ordem de Serviço          //
//==================================================//

const deliverServiceOrder = async (req, res) => {
  try {

    const { id } = req.params;

    const serviceOrder = await ServiceOrder.findByPk(id);

    if (!serviceOrder) {
      return res.status(404).json({
        message: 'Ordem de Serviço não encontrada.',
      });
    }

    if (!canManageServiceOrder(req.user || {}, serviceOrder)) {
      return res.status(403).json({ message: 'Acesso negado: você não pode entregar esta ordem de serviço.' });
    }

    const deliveryDate = new Date();

    await serviceOrder.update({
      status: 'ENTREGUE',
      deliveryDate,
    });

    await ServiceOrderHistory.create({
      serviceOrderId: serviceOrder.id,
      eventType: 'ORDEM_ENTREGUE',
      description: 'Ordem de Serviço entregue',
      details: `A ordem foi marcada como entregue em ${deliveryDate.toISOString()}.`,
      createdBy: 'sistema',
    });

    return res.status(200).json({
      message: 'Ordem de Serviço entregue com sucesso.',
      serviceOrder,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

module.exports = {
  createServiceOrder,
  getServiceOrders,
  getServiceOrderById,
  updateServiceOrder,
  deleteServiceOrder,
  completeServiceOrder,
  deliverServiceOrder,
};