const Sequelize = require('sequelize');
const sequelize = require('../database');

const User = require('./users');
const ShelterProfile = require('./shelter');
const { Pet } = require('./pet');
const AdoptionApplication = require('./adoptionApplication');

//ShelterProfile with User one to one relationship
User.hasOne(ShelterProfile, {
  foreignKey: 'userId',
  as: 'shelterProfile'
});
ShelterProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

//ShelterProfile with Pet one to many relationship
ShelterProfile.hasMany(Pet, {
  foreignKey: 'shelterId',
  as: 'pets'
});
Pet.belongsTo(ShelterProfile, {
  foreignKey: 'shelterId',
  as: 'shelter'
});

//Pet with AdoptionApplication  one to many relationship
Pet.hasMany(AdoptionApplication, {
  foreignKey: 'petId',
  as: 'applications'
});
AdoptionApplication.belongsTo(Pet, {
  foreignKey: 'petId',
  as: 'pet'
});

//User with AdoptionApplication  one to many relationship
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