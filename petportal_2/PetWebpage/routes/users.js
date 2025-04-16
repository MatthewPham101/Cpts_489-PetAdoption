var express = require('express');
var router = express.Router();
const { Pet, AdoptionApplication, User, ShelterProfile } = require('../models');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// GET all users as JSON for admin page
router.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role'] // Select fields to expose
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/api/users/:id', async (req, res) => {
  try {
    const users = await User.findOne({
      where: { id: req.params.id },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
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

// GET adoption application form with pet info
router.get('/adoption-application', async (req, res) => {
  try {
    const petId = req.query.petId;
    let pet = null;
    
    if (petId) {
      pet = await Pet.findByPk(petId, {
        include: [{
          model: ShelterProfile,
          as: 'shelter'
        }]
      });
      
      if (!pet) {
        return res.redirect('/browse-pets');
      }
    }

    res.render('adoption-application', {
      title: 'Adoption Application',
      user: req.session.user || null,
      pet: pet ? pet.get({ plain: true }) : null
    });
  } catch (error) {
    console.error('Error loading adoption application:', error);
    res.status(500).render('error', {
      message: 'Error loading application form',
      error: error.message,
      user: req.session.user || null
    });
  }
});

// POST submit adoption application
router.post('/submit-application', async (req, res) => {
  try {
    const { petId, fullName, email, phone, address, livingSituation, adoptionReason } = req.body;
    const userId = req.session.user ? req.session.user.id : null;

    // Create the application
    const application = await AdoptionApplication.create({
      petId,
      userId,
      applicantName: fullName,
      applicantEmail: email,
      applicantPhone: phone,
      applicantAddress: address,
      livingSituation,
      adoptionReason,
      status: 'pending'
    });

    // Update pet status to pending if it was available
    await Pet.update(
      { status: 'pending' },
      { where: { id: petId, status: 'available' } }
    );

    res.redirect('/application-submitted');
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).render('error', {
      message: 'Error submitting application',
      error: error.message,
      user: req.session.user || null
    });
  }
});

// GET application submitted confirmation
router.get('/application-submitted', (req, res) => {
  res.render('application-submitted', {
    title: 'Application Submitted',
    user: req.session.user || null
  });
});


// GET edit user form
router.get('/edit/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).render('error', {
        message: 'User not found',
        error: 'The user you are trying to edit does not exist',
        user: req.session.user || null
      });
    }
    res.render('edit-user', { user: user.get({ plain: true }), userSession: req.session.user || null });
  } catch (error) {
    console.error('Error loading edit user form:', error);
    res.status(500).render('error', {
      message: 'Error loading edit user form',
      error: error.message,
      user: req.session.user || null
    });
  }
});

// POST update user
router.post('/edit/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).render('error', {
        message: 'User not found',
        error: 'The user you are trying to update does not exist',
        user: req.session.user || null
      });
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.role = role;

    await user.save();

    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('error', {
      message: 'Error updating user',
      error: error.message,
      user: req.session.user || null
    });
  }
});


// DELETE user by ID with admin deletion protection
router.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
