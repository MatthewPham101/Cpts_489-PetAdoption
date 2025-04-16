const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/users');

const setFlashMessage = (req, type, message) => {
  req.session.flash = { type, message };
};

router.get('/signup', (req, res) => {
    res.render('signup', {
      title: 'Sign Up - Pet Portal',
      user: req.session.userId || null,
      flash: req.session.flash,
      formData: req.session.formData || {} 
    });
    // Clear 
    delete req.session.flash;
    delete req.session.formData;
  });
  
  router.get('/login', (req, res) => {
    res.render('login', {
      title: 'Pet Portal - Login',  
      user: req.session.user || null, 
      flash: req.session.flash, 
      formData: req.session.formData || {}  
    });

    delete req.session.flash;
    delete req.session.formData;
  });

  router.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/');
    });
  });


router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, role } = req.body;

  try {
    // Validation
    if (password !== confirmPassword) {
      setFlashMessage(req, 'error', 'Passwords do not match');
      return res.redirect('/auth/signup');
    }

    if (password.length < 8) {
      setFlashMessage(req, 'error', 'Password must be at least 8 characters');
      return res.redirect('/auth/signup');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      setFlashMessage(req, 'error', 'Email already in use');
      return res.redirect('/auth/signup');
    }

    // Create user
    const hashedPassword = await bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'user' 
    });

    // auto login
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      role: newUser.role
    };

    setFlashMessage(req, 'success', 'Registration successful!');
    res.redirect('/');

  } catch (error) {
    console.error("Signup error:", error);
    setFlashMessage(req, 'error', 'Error  during registration');
    res.redirect('/auth/signup');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      setFlashMessage(req, 'error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    const isPasswordValid = await bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      setFlashMessage(req, 'error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role
    };

    setFlashMessage(req, 'success', 'Login successful!');
    
    const redirectPath = user.role === 'admin' ? '/admin' : '/';
    res.redirect(redirectPath);

  } catch (error) {
    console.error("Login error:", error);
    setFlashMessage(req, 'error', 'Error during login');
    res.redirect('/auth/login');
  }
});

module.exports = router;