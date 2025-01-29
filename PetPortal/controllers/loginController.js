const { User } = require('../models/app');
const bcrypt = require('bcrypt');

const authController = {
  getLogin: (req, res) => {
    res.render('auth/login');
  },

  postLogin: async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.render('auth/login', { error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.render('auth/login', { error: 'Invalid credentials' });
      }

  
      req.session.user = user;
      res.redirect('/');
       
    } catch (err) {
      console.error(err);
      res.render('auth/login', { error: 'Login failed' });
    }
  }
};

module.exports = authController;