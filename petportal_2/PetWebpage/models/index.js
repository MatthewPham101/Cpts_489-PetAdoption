// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../database');

const User = require('./users');
const ShelterProfile = require('./shelter');
const { Pet } = require('./pet');

// Associate ShelterProfile with User (One-to-One)
User.hasOne(ShelterProfile, {
  foreignKey: 'userId',
  as: 'shelterProfile'
});
ShelterProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Associate ShelterProfile with Pet (One-to-Many)
ShelterProfile.hasMany(Pet, {
  foreignKey: 'shelterId',
  as: 'pets'
});
Pet.belongsTo(ShelterProfile, {
  foreignKey: 'shelterId',
  as: 'shelter'
});


module.exports = {
  sequelize,
  Sequelize,
  User,
  ShelterProfile,
  Pet
};
