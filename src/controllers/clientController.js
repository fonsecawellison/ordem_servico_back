const { validationResult } = require('express-validator');
const Client = require('../models/Client');
const User = require('../models/User');
const { syncCustomerIdentity } = require('../services/clientContext');

const ensureUserProfileForClient = async (client, password) => {
  if (!client || !client.email) {
    return null;
  }

  const { user } = await syncCustomerIdentity({
    client,
    ClientModel: Client,
    UserModel: User,
    defaultPassword: password || 'AutoFlow123',
  });

  return user;
};

//==================================================//
//                 Criando Cliente                  //
//==================================================//
const createClient = async (req, res) => {
  try {
    // Verifica se houve erros nas validações
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    // Recebe os dados enviados pelo frontend
    const { name, email, phone, address, password } = req.body;

    // Verifica se o e-mail já está cadastrado
    if (email) {
      const existingClient = await Client.findOne({
        where: { email },
      });

      if (existingClient) {
        return res.status(400).json({
          message: 'E-mail já está cadastrado.',
        });
      }
    }

    // Cria um novo cliente
    const client = await Client.create({
      name,
      email,
      phone,
      address,
    });

    await ensureUserProfileForClient(client, password || 'AutoFlow123');

    // Retorna sucesso
    return res.status(201).json({
      message: 'Cliente cadastrado com sucesso.',
      client,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};

//==================================================//
//              Buscando Todos os Clientes          //
//==================================================//

const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['id', 'ASC']],
    });

    return res.status(200).json(clients);

  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};

//==================================================//
//             Buscando Cliente por ID              //
//==================================================//

const getClientById = async (req, res) => {
  try {

    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({
        message: 'Cliente não encontrado.',
      });
    }

    return res.status(200).json(client);

  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};

//==================================================//
//                Atualizando Cliente               //
//==================================================//

const updateClient = async (req, res) => {
  try {

    const { id } = req.params;

    const { name, email, phone, address } = req.body;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({
        message: 'Cliente não encontrado.',
      });
    }

    if (email) {
      const existingClient = await Client.findOne({
        where: { email },
      });

      if (existingClient && existingClient.id !== client.id) {
        return res.status(400).json({
          message: 'E-mail já está cadastrado.',
        });
      }
    }

    await client.update({
      name,
      email,
      phone,
      address,
    });

    return res.status(200).json({
      message: 'Cliente atualizado com sucesso.',
      client,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};

//==================================================//
//                 Excluindo Cliente                //
//==================================================//

const deleteClient = async (req, res) => {
  try {

    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({
        message: 'Cliente não encontrado.',
      });
    }

    await client.destroy();

    return res.status(200).json({
      message: 'Cliente excluído com sucesso.',
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};



module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};