const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceOrderHistory = sequelize.define('ServiceOrderHistory', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  serviceOrderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  eventType: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  createdBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

}, {
  timestamps: true,
});

module.exports = ServiceOrderHistory;
