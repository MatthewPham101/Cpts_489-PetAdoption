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
const TUser = require('./models/users')
const Application = require('./models/adoptionApplication')

async function syncDatabase() {
  try {
    await TUser.sync({ force: false });
    await ShelterProfile.sync({ force: false });
    await Pet.sync({ force: false }); // Keep false unless testing
    await Application.sync({ force: false });
    console.log('Database tables synced!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();


// Route handlers
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/', usersRouter); 
app.use('/', shelterRouter); 




// catch 404 and forward to error handler
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