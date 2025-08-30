const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database'); // Adjust the path as needed

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv4,
    primaryKey: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;