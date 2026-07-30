const { Op } = require('sequelize');
const sequelize = require('../config/database');

const ServiceOrder = require('../models/ServiceOrder');
const Client = require('../models/Client');
const Equipment = require('../models/Equipment');
const Product = require('../models/Product');
const User = require('../models/User');

const getDashboard = async (req, res) => {
  try {

    const totalServiceOrders = await ServiceOrder.count();
    const openServiceOrders = await ServiceOrder.count({ where: { status: 'ABERTA' } });
    const inProgressServiceOrders = await ServiceOrder.count({ where: { status: 'EM_ANDAMENTO' } });
    const completedServiceOrders = await ServiceOrder.count({ where: { status: 'CONCLUIDA' } });
    const deliveredServiceOrders = await ServiceOrder.count({ where: { status: 'ENTREGUE' } });

    const totalClients = await Client.count();
    const totalEquipments = await Equipment.count();
    const totalProducts = await Product.count();
    const totalTechnicians = await User.count({ where: { role: 'tecnico' } });

    const lowStockProducts = await Product.count({
      where: {
        stockQuantity: {
          [Op.lte]: sequelize.col('minimumStock'),
        },
      },
    });

    return res.status(200).json({
      summary: {
        totalServiceOrders,
        openServiceOrders,
        inProgressServiceOrders,
        completedServiceOrders,
        deliveredServiceOrders,
        totalClients,
        totalEquipments,
        totalProducts,
        totalTechnicians,
        lowStockProducts,
      },
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

module.exports = {
  getDashboard,
};
