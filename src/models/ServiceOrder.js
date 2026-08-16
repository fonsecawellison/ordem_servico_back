const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceOrder = sequelize.define('ServiceOrder', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  technicianId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  reportedIssue: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  solution: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ABERTA',
  },

  entryDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

  estimatedCompletion: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  completionDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'PENDENTE',
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  timestamps: true,
});

module.exports = ServiceOrder;