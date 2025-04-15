// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../database');

const User = require('./users');
const ShelterProfile = require('./shelter');
const { Pet } = require('./pet');
const AdoptionApplication = require('./adoptionApplication');

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

// Associate Pet with AdoptionApplication (One-to-Many)
Pet.hasMany(AdoptionApplication, {
  foreignKey: 'petId',
  as: 'applications'
});
AdoptionApplication.belongsTo(Pet, {
  foreignKey: 'petId',
  as: 'pet'
});

// Associate User with AdoptionApplication (One-to-Many)
User.hasMany(AdoptionApplication, {
  foreignKey: 'userId',
  as: 'applications'
});
AdoptionApplication.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  ShelterProfile,
  Pet,
  AdoptionApplication
};