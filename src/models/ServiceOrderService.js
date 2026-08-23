const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceOrderService = sequelize.define('ServiceOrderService', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  serviceOrderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1,
  },

  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  serviceType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ORIGINAL',
  },

  additionalRequestId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  steps: {
    type: DataTypes.JSON,
    allowNull: true,
  },

}, {
  timestamps: true,
});

module.exports = ServiceOrderService;