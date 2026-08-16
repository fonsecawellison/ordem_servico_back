const { validationResult } = require('express-validator');
const PaymentConfig = require('../models/PaymentConfig');

const getAllowedPaymentMethods = () => ['DINHEIRO', 'PIX', 'CARTAO', 'CREDITO', 'DEBITO', 'BOLETO'];

const getPaymentConfigs = async (req, res) => {
  try {
    const configs = await PaymentConfig.findAll({
      where: { isActive: true },
    });

    if (configs.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(configs);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar configurações de pagamento.',
      error: error.message,
    });
  }
};

const getPaymentConfigByMethod = async (req, res) => {
  try {
    const { method } = req.params;

    const allowedMethods = getAllowedPaymentMethods();
    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        message: 'Forma de pagamento inválida.',
      });
    }

    const config = await PaymentConfig.findOne({
      where: { paymentMethod: method, isActive: true },
    });

    if (!config) {
      return res.status(200).json({
        paymentMethod: method,
        pixKey: null,
        cardOwnerName: null,
        cardNumber: null,
        cardBank: null,
        instructions: null,
      });
    }

    return res.status(200).json(config);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar configuração de pagamento.',
      error: error.message,
    });
  }
};

const createPaymentConfig = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { paymentMethod, pixKey, cardOwnerName, cardNumber, cardBank, instructions } = req.body;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem criar configurações de pagamento.' });
    }

    const allowedMethods = getAllowedPaymentMethods();
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Forma de pagamento inválida.',
      });
    }

    const existingConfig = await PaymentConfig.findOne({
      where: { paymentMethod },
    });

    if (existingConfig) {
      return res.status(400).json({
        message: 'Já existe uma configuração para essa forma de pagamento.',
      });
    }

    const config = await PaymentConfig.create({
      paymentMethod,
      pixKey,
      cardOwnerName,
      cardNumber,
      cardBank,
      instructions,
      isActive: true,
    });

    return res.status(201).json({
      message: 'Configuração de pagamento criada com sucesso.',
      config,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao criar configuração de pagamento.',
      error: error.message,
    });
  }
};

const updatePaymentConfig = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { pixKey, cardOwnerName, cardNumber, cardBank, instructions, isActive } = req.body;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem atualizar configurações de pagamento.' });
    }

    const config = await PaymentConfig.findByPk(id);

    if (!config) {
      return res.status(404).json({
        message: 'Configuração de pagamento não encontrada.',
      });
    }

    await config.update({
      pixKey: pixKey ?? config.pixKey,
      cardOwnerName: cardOwnerName ?? config.cardOwnerName,
      cardNumber: cardNumber ?? config.cardNumber,
      cardBank: cardBank ?? config.cardBank,
      instructions: instructions ?? config.instructions,
      isActive: isActive ?? config.isActive,
    });

    return res.status(200).json({
      message: 'Configuração de pagamento atualizada com sucesso.',
      config,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar configuração de pagamento.',
      error: error.message,
    });
  }
};

const deletePaymentConfig = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem deletar configurações de pagamento.' });
    }

    const config = await PaymentConfig.findByPk(id);

    if (!config) {
      return res.status(404).json({
        message: 'Configuração de pagamento não encontrada.',
      });
    }

    await config.destroy();

    return res.status(200).json({
      message: 'Configuração de pagamento deletada com sucesso.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao deletar configuração de pagamento.',
      error: error.message,
    });
  }
};

module.exports = {
  getPaymentConfigs,
  getPaymentConfigByMethod,
  createPaymentConfig,
  updatePaymentConfig,
  deletePaymentConfig,
};
