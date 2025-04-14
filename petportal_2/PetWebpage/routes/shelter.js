const express = require('express');
const router = express.Router();
const { Pet, ShelterProfile, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===== Multer Configuration =====
const uploadDir = path.join(__dirname, '../public/pets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'pet-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});
// ===== End Multer Configuration =====


router.get('/manage-pets', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'shelter') {
      return res.redirect('/');
    }

    const shelterWithPets = await ShelterProfile.findOne({
      where: { userId: req.session.user.id },
      include: [
        {
          model: Pet,
          as: 'pets'
        }
      ]
    });

    if (!shelterWithPets) {
      return res.redirect('/');
    }

    res.render('manage-pets', {
      title: 'Manage Pets',
      user: req.session.user,
      pets: shelterWithPets.pets || []
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
});

router.post('/delete-pet/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'shelter') {
      return res.status(403).send('Only shelters can delete pets');
    }

    const pet = await Pet.findOne({
      where: { id: req.params.id },
      include: [{
        model: ShelterProfile,
        as: 'shelter',
        where: { userId: req.session.user.id }
      }]
    });

    if (!pet) {
      return res.status(404).send('Pet not found or you do not have permission to delete it');
    }

    if (pet.photoPath) {
      const photoPath = path.join(__dirname, '../public', pet.photoPath);
      fs.unlink(photoPath, (err) => {
        if (err) console.error('Error deleting pet photo:', err);
      });
    }

    await pet.destroy();
    res.redirect('/manage-pets');
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).send('Server error while deleting pet');
  }
});

router.get('/edit-pet/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'shelter') {
      return res.redirect('/');
    }

    const pet = await Pet.findOne({
      where: { id: req.params.id },
      include: [{
        model: ShelterProfile,
        as: 'shelter',
        where: { userId: req.session.user.id }
      }]
    });

    if (!pet) {
      return res.status(404).send('Pet not found or you do not have permission to edit it');
    }

    res.render('edit-pet', {
      title: 'Edit Pet Profile',
      user: req.session.user,
      pet: pet.get({ plain: true })
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
});

router.post('/edit-pet/:id', upload.single('photo'), async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'shelter') {
      return res.status(403).send('Only shelters can edit pets');
    }

    const pet = await Pet.findOne({
      where: { id: req.params.id },
      include: [{
        model: ShelterProfile,
        as: 'shelter',
        where: { userId: req.session.user.id }
      }]
    });

    if (!pet) {
      return res.status(404).send('Pet not found or you do not have permission to edit it');
    }

    const { name, type, breed, age, ageUnit, gender, size, description, isVaccinated, specialNeeds, status } = req.body;
    
    const updateData = {
      name,
      type,
      breed,
      age: parseInt(age),
      ageUnit,
      gender,
      size,
      description,
      isVaccinated: isVaccinated === 'on',
      specialNeeds: specialNeeds || null,
      status
    };

    if (req.file) {
      if (pet.photoPath) {
        const oldPhotoPath = path.join(__dirname, '../public', pet.photoPath);
        fs.unlink(oldPhotoPath, (err) => {
          if (err) console.error('Error deleting old photo:', err);
        });
      }
      updateData.photoPath = '/pets/' + path.basename(req.file.path);
    }

    await pet.update(updateData);
    res.redirect('/manage-pets');
  } catch (error) {
    console.error('Error updating pet:', error);
    
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    
    res.status(500).render('error', { 
      message: 'Error updating pet profile',
      error: error.message,
      user: req.session.user
    });
  }
});

router.get('/browse-applications', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'shelter') {
    return res.redirect('/');
  }
  res.render('browse-applications', { 
    title: 'Browse Applications',
    user: req.session.user 
  });
});

router.get('/create-pet-profile', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'shelter') {
    return res.redirect('/');
  }
  res.render('create-pet-profile', { 
    title: 'Create Pet Profile',
    user: req.session.user 
  });
});

router.post('/create-pet-profile', upload.single('photo'), async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'shelter') {
      return res.status(403).send('Only shelters can create pet profiles');
    }

    if (!Pet || typeof Pet.create !== 'function') {
      throw new Error('Pet model is not properly initialized');
    }

    const { name, type, breed, age, ageUnit, gender, size, description, isVaccinated, specialNeeds } = req.body;
    
    const shelter = await ShelterProfile.findOne({
      where: { userId: req.session.user.id }
    });

    if (!shelter) {
      return res.status(404).send('Shelter profile not found.');
    }

    const petData = {
      name,
      type,
      breed,
      age: parseInt(age),
      ageUnit,
      gender,
      size,
      description,
      isVaccinated: isVaccinated === 'on',
      specialNeeds: specialNeeds || null,
      photoPath: req.file ? '/pets/' + path.basename(req.file.path) : null,
      shelterId: shelter.id,
      status: 'available'
    };

    const newPet = await Pet.create(petData);
    res.redirect('/manage-pets');
  } catch (error) {
    console.error('Full error stack:', error);
    console.error('Error details:', {
      message: error.message,
      modelStatus: Pet ? 'Model exists' : 'Model missing',
      createMethod: Pet?.create ? 'Exists' : 'Missing'
    });

    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    
    res.status(500).render('error', { 
      message: 'Error creating pet profile',
      error: error.message,
      user: req.session.user
    });
  }
});

router.get('/edit-shelter', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'shelter') {
    return res.redirect('/');
  }

  const shelter = await ShelterProfile.findOne({
    where: { userId: req.session.user.id }
  });

  res.render('edit-shelter', { 
    title: 'Edit Shelter Profile',
    user: req.session.user,
    shelter
  });
});

router.post('/edit-shelter', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'shelter') {
    return res.redirect('/');
  }

  try {
    const { shelterName, phone, address, city, state, zipCode, description } = req.body;

    const [profile, created] = await ShelterProfile.findOrCreate({
      where: { userId: req.session.user.id },
      defaults: {
        shelterName,
        phone,
        address,
        city,
        state,
        zipCode,
        description,
        userId: req.session.user.id
      }
    });

    if (!created) {
      await profile.update({
        shelterName,
        phone,
        address,
        city,
        state,
        zipCode,
        description
      });
    }

    res.redirect('/edit-shelter');
  } catch (error) {
    console.error('Error updating shelter profile:', error);
    res.status(500).send('Server error while updating profile');
  }
});


router.get('/about-us', (req, res) => {
  res.render('about-us', { 
    title: 'About Us',
    user: req.session.user || null 
  });
});

router.get('/adoption-application', (req, res) => {
  res.render('adoption-application', { 
    title: 'Adoption Application',
    user: req.session.user || null 
  });
});

router.get('/browse-pets', (req, res) => {
  res.render('browse-pets', { 
    title: 'Browse Pets',
    user: req.session.user || null 
  });
});

router.get('/pet-compatibility', (req, res) => {
  res.render('pet-compatibility', { 
    title: 'Pet Compatibility Quiz',
    user: req.session.user || null 
  });
});

module.exports = router;