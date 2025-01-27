const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./models'); // Fixed path (1)
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Fixed path (2)
app.set('view engine', 'ejs');
app.set('views', 'views'); // Fixed path (3)

// Database Sync (4)
const models = require('./models');
models.sequelize.sync()
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Database connection failed:', err));

// Routes
app.get('/', async (req, res) => {
    const users = await User.findAll();
    res.render('index', { users });
});

app.post('/add-user', async (req, res) => {
    const { name, email } = req.body;
    await User.create({ name, email });
    res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});