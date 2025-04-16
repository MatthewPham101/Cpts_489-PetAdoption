var express = require('express');
var router = express.Router();
const { Pet, AdoptionApplication, User, ShelterProfile } = require('../models');




// home page 
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role'] 
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


// get to the browse pet ppage 
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

    console.log('Pets found:', pets.length); 

    res.render('browse-pets', {
      title: 'Browse Pets',
      user: req.session.user || null,
      pets: pets.map(pet => pet.get({ plain: true })) 
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

// profile page of the pet when the user click on it
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
        error: 'errors no pet found',
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
      message: 'Erro loading in the pet',
      error: error.message,
      user: req.session.user || null
    });
  }
});

// get the pet application page
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

// POST when the user submit adoption application
router.post('/submit-application', async (req, res) => {
  try {
    const { petId, fullName, email, phone, address, livingSituation, adoptionReason } = req.body;
    const userId = req.session.user ? req.session.user.id : null;

    // the applications
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

    // update the pet status
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

// pet app when submitted
router.get('/application-submitted', (req, res) => {
  res.render('application-submitted', {
    title: 'Application Submitted',
    user: req.session.user || null
  });
});


router.get('/about-us', (req, res) => {
  res.render('about-us', { user: req.session.userId });
});

router.get('/adoption-application', (req, res) => {
  res.render('adoption-application', { user: req.session.userId });
});

router.get('/browse-pets', (req, res) => {
  res.render('browse-pets', { user: req.session.userId });
});

router.get('/pet-compatability', (req, res) => {
  res.render('pet-compatibility', { user: req.session.userId });
});


router.post('/pet-compatability/results', (req, res) => {
  const { time, home, 'other-pets': otherPets, personality } = req.body;

  function getRecommendPet() {
    if (time === 'low')
    {
      if (home === 'apartment') return 'Cat';
      if (home === 'house' && personality === 'affectionate') return 'Rabbit';
      if (home === 'farm') return 'Barn Cat';
      return 'Older Cat';
    }

    if (time === 'medium')
    {
      if (home === 'apartment') return 'Small Dog';
      if (home === 'house') return 'Medium Dog';
      if (home === 'farm') return 'Goat or Farm Cat';
    }

    if (time === 'low')
    {
      if (home === 'apartment' && personality === 'affectionate') return 'Parrot or Ferret';
      if (home === 'house' && personality === 'playful') return 'Labrador Retriever';
      if (home === 'house' && personality === 'affectionate') return 'Golden Retriever';
      if (home === 'farm') return 'Border Collie';
    }

    return 'Mixed breed or rescue animal';
  }

  const recommendation = getRecommendPet();

  res.render('pet-quiz-result', {recommendation});
})


module.exports = router;



