const express = require('express');
const router = express.Router();
const models = require('../models/app');


router.get('/', async (req, res) => {
  res.render('login', { error: null });
});

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});


// router.post('/register', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {

//     const existingUser = await models.User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.render('register', { error: 'Email already in use.' });
//     }


//     await models.User.create({ name, email, password });


//     res.redirect('/');
//   } catch (err) {
//     console.error('Error during registration:', err);
//     res.status(500).render('register', { error: 'Internal Server Error' });
//   }
// });
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match.' });
  }

  try {
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('register', { error: 'Email already in use.' });
    }

    await models.User.create({ firstName, lastName, email, password });

    res.redirect('/');
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).render('register', { error: 'Internal Server Error' });
  }
});



router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await models.User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
      return res.render('login', { error: 'Invalid email or password.' });
    }


    req.session.user = user;


    res.redirect('/dashboard'); 
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).render('login', { error: 'Internal Server Error' });
  }
});


router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', { 
        user: req.session.user, 
        content: '' 
    });
});

router.get('/about-us', (req, res) => {
  res.render('about-us');
});

router.get('/adoption-application', (req, res) => {
  res.render('adoption-application');
});

router.get('/browse-pets', (req, res) => {
  res.render('browse-pets');
});

router.get('/pet-compatability', (req, res) => {
  res.render('pet-compatability');
});

router.get('/about-us', (req, res) => {
  res.render('about-us');
});

  


module.exports = router;
