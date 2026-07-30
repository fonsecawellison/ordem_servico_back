const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  minimumStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ATIVO',
  },
}, {
  timestamps: true,
});

module.exports = Product;
