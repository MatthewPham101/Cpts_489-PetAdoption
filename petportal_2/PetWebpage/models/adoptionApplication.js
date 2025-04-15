const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AdoptionApplication = sequelize.define('AdoptionApplication', {
  applicantName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  applicantEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  applicantPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  applicantAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  livingSituation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  adoptionReason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'adoption_applications'
});

module.exports = AdoptionApplication;