const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentConfig = sequelize.define('PaymentConfig', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  pixKey: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  cardOwnerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  cardNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  cardBank: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },

}, {
  timestamps: true,
});

module.exports = PaymentConfig;
