const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdditionalServiceRequest = sequelize.define('AdditionalServiceRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  serviceOrderId: { type: DataTypes.INTEGER, allowNull: false },
  serviceCatalogId: { type: DataTypes.INTEGER, allowNull: false },
  requestedBy: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  steps: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'AGUARDANDO_ADMIN' },
  clientDecision: { type: DataTypes.STRING, allowNull: true },
  decidedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

module.exports = AdditionalServiceRequest;
