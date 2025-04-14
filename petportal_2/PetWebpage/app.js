const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// Route imports
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const shelterRouter = require('./routes/shelter'); // Add this line


const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'password',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Changed from userId to user
  next();
});


const { Pet } = require('./models/pet');
const ShelterProfile = require('./models/shelter');

async function syncDatabase() {
  try {
    await ShelterProfile.sync({ force: false });
    await Pet.sync({ force: false }); // Keep false unless testing
    console.log('Database tables synced!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();


// Route handlers
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/', shelterRouter); // Now properly defined

// Individual routes (consider moving these to separate router files)
app.get('/about-us', (req, res) => {
  res.render('about-us', { 
    user: req.session.user || null,
    title: 'About Us'
  });
});

app.get('/adoption-application', (req, res) => {
  res.render('adoption-application', { 
    user: req.session.user || null,
    title: 'Adoption Application' 
  });
});

app.get('/browse-pets', (req, res) => {
  res.render('browse-pets', { 
    user: req.session.user || null,
    title: 'Browse Pets'
  });
});

app.get('/pet-compatibility', (req, res) => {
  res.render('pet-compatibility', { 
    user: req.session.user || null,
    title: 'Pet Compatibility Quiz'
  });
});

// Error handlers
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;