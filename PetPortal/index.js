// index.js (updated)
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Database connection
const models = require('./models/app');
models.sequelize.sync()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('layout', 'base');

// Routes
// Replace the root route in index.js with:
const homeRoutes = require('./routes/homeRoutes');
app.use('/', homeRoutes);

// Add this root route handler
app.get('/', async (req, res) => {
  const users = await models.User.findAll(); // Use models.User
  res.render('index', { users });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});