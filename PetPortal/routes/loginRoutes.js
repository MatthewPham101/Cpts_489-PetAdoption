const express = require('express');
const router = express.Router();
const authController = require('../controllers/loginController');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('login'); 
    });
  });
  
module.exports = router;