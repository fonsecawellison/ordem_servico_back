const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceOrderPart = sequelize.define('ServiceOrderPart', {

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

  brand: {
    type: DataTypes.STRING,
    allowNull: true,
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

}, {
  timestamps: true,
});

module.exports = ServiceOrderPart;