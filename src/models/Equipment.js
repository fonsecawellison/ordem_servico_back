const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Equipment = sequelize.define('Equipment', {
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  serialNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  accessories: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});




module.exports = Equipment;