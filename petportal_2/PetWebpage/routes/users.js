var express = require('express');
var router = express.Router();
const { Pet, ShelterProfile } = require('../models');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/browse-pets', async (req, res) => {
  try {
    // Get all available pets with shelter info
    const pets = await Pet.findAll({
      where: { status: 'available' },
      include: [{
        model: ShelterProfile,
        as: 'shelter',
        attributes: ['shelterName', 'city', 'state']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('Pets found:', pets.length); // Debug log

    res.render('browse-pets', {
      title: 'Browse Pets',
      user: req.session.user || null,
      pets: pets.map(pet => pet.get({ plain: true })) // Ensure plain object
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).render('error', {
      message: 'Error loading pets',
      error: error.message,
      user: req.session.user || null
    });
  }
});

// GET pet profile page
router.get('/pet-profile/:id', async (req, res) => {
  try {
    const pet = await Pet.findOne({
      where: { id: req.params.id },
      include: [{
        model: ShelterProfile,
        as: 'shelter',
        attributes: ['shelterName', 'phone', 'address', 'city', 'state', 'zipCode', 'description']
      }]
    });

    if (!pet) {
      return res.status(404).render('error', {
        message: 'Pet not found',
        error: 'The pet you are looking for does not exist or has been removed',
        user: req.session.user || null
      });
    }

    res.render('pet-profile', {
      title: pet.name,
      user: req.session.user || null,
      pet: pet.get({ plain: true })
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).render('error', {
      message: 'Error loading pet profile',
      error: error.message,
      user: req.session.user || null
    });
  }
});



module.exports = router;
