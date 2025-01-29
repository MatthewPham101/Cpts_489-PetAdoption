const { User } = require('../models/app');

const homeController = {
  getHome: async (req, res) => {
    try {
      const users = await User.findAll();
      res.render('index', { users });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
};

module.exports = homeController;