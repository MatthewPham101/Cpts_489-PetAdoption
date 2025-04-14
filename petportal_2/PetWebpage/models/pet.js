// models/pet.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Pet = sequelize.define('Pet', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'),
    allowNull: false
  },
  breed: {
    type: DataTypes.STRING,
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ageUnit: {
    type: DataTypes.ENUM('days', 'weeks', 'months', 'years'),
    allowNull: false,
    defaultValue: 'months'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'unknown'),
    allowNull: false
  },
  size: {
    type: DataTypes.ENUM('small', 'medium', 'large', 'extra-large'),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isVaccinated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('available', 'pending', 'adopted', 'not_available'),
    defaultValue: 'available'
  },
  specialNeeds: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  photoPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shelterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }

}, {
  tableName: 'pets',
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = { Pet }; 