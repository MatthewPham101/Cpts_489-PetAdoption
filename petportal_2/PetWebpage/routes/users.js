var express = require('express');
var router = express.Router();
const User = require('../models/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET all users for admin table */
router.get('/api/users', async (req, res) => {
  try {
    console.log('Session user:', req.user); // Log session user
    if (!req.user || req.user.role !== 'admin') {
      console.log('Unauthorized access attempt');
      return res.status(403).json({ 
        error: 'Unauthorized',
        details: req.user ? `User role: ${req.user.role}` : 'No user in session'
      });
    }
    
    console.log('Fetching users from database');
    const users = await User.findAll();
    console.log('Found users:', users.length);
    
    if (users.length === 0) {
      console.warn('No users found in database');
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/* UPDATE user */
router.put('/api/users/:id', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* DELETE user */
router.delete('/api/users/:id', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* GET user management page */
router.get('/admin', function(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/');
  }
  res.render('admin', { 
    title: 'Manage Users',
    user: req.user
  });
});

module.exports = router;
