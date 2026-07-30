const { validationResult } = require('express-validator');
const Equipment = require('../models/Equipment');
const Client = require('../models/Client');

//==================================================//
//              Criando Equipamento                 //
//==================================================//

const createEquipment = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      clientId,
      type,
      brand,
      model,
      serialNumber,
      password,
      accessories,
    } = req.body;

    // Verifica se o cliente existe
    const client = await Client.findByPk(clientId);

    if (!client) {
      return res.status(404).json({
        message: `Não existe um cliente cadastrado com o ID ${clientId}.`,
      });
    }

    // Verifica número de série duplicado (quando informado)
    if (serialNumber) {

      const existingEquipment = await Equipment.findOne({
        where: {
          serialNumber,
        },
      });

      if (existingEquipment) {
        return res.status(400).json({
          message: 'Já existe um equipamento cadastrado com este número de série.',
        });
      }
    }

    // Cria o equipamento
    const equipment = await Equipment.create({
      clientId,
      type,
      brand,
      model,
      serialNumber,
      password,
      accessories,
    });

    return res.status(201).json({
      message: 'Equipamento cadastrado com sucesso.',
      equipment,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//          Buscando Todos os Equipamentos          //
//==================================================//

const getEquipments = async (req, res) => {
  try {

    const equipments = await Equipment.findAll({
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['id', 'ASC']],
    });

    return res.status(200).json(equipments);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//          Buscando Equipamento por ID             //
//==================================================//

const getEquipmentById = async (req, res) => {
  try {

    const { id } = req.params;

    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!equipment) {
      return res.status(404).json({
        message: 'Equipamento não encontrado.',
      });
    }

    return res.status(200).json(equipment);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//             Atualizando Equipamento              //
//==================================================//

const updateEquipment = async (req, res) => {
  try {

    const { id } = req.params;

    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({
        message: 'Equipamento não encontrado.',
      });
    }

    const {
      clientId,
      type,
      brand,
      model,
      serialNumber,
      password,
      accessories,
    } = req.body;

    // Verifica se o cliente existe
    if (clientId) {

      const client = await Client.findByPk(clientId);

      if (!client) {
        return res.status(404).json({
          message: `Não existe um cliente cadastrado com o ID ${clientId}.`,
        });
      }

    }

    // Verifica número de série duplicado
    if (serialNumber) {

      const existingEquipment = await Equipment.findOne({
        where: {
          serialNumber,
        },
      });

      if (existingEquipment && existingEquipment.id !== equipment.id) {
        return res.status(400).json({
          message: 'Já existe um equipamento cadastrado com este número de série.',
        });
      }

    }

    await equipment.update({
      clientId,
      type,
      brand,
      model,
      serialNumber,
      password,
      accessories,
    });

    return res.status(200).json({
      message: 'Equipamento atualizado com sucesso.',
      equipment,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//              Excluindo Equipamento               //
//==================================================//

const deleteEquipment = async (req, res) => {
  try {

    const { id } = req.params;

    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({
        message: 'Equipamento não encontrado.',
      });
    }

    await equipment.destroy();

    return res.status(200).json({
      message: 'Equipamento excluído com sucesso.',
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

module.exports = {
  createEquipment,
  getEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
};