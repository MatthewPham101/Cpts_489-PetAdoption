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
app.use('/', shelterRouter); // Now properly defined



<<<<<<< HEAD
// Error handlers
=======




app.get('/about-us', (req, res) => {
  res.render('about-us', { user: req.session.userId });
});

app.get('/adoption-application', (req, res) => {
  res.render('adoption-application', { user: req.session.userId });
});

app.get('/browse-pets', (req, res) => {
  res.render('browse-pets', { user: req.session.userId });
});

app.get('/pet-compatability', (req, res) => {
  res.render('pet-compatibility', { user: req.session.userId });
});


app.post('/pet-compatability/results', (req, res) => {
  const { time, home, 'other-pets': otherPets, personality } = req.body;

  function getRecommendPet() {
    if (time === 'low')
    {
      if (home === 'apartment') return 'Cat';
      if (home === 'house' && personality === 'affectionate') return 'Rabbit';
      if (home === 'farm') return 'Barn Cat';
      return 'Older Cat';
    }

    if (time === 'medium')
    {
      if (home === 'apartment') return 'Small Dog';
      if (home === 'house') return 'Medium Dog';
      if (home === 'farm') return 'Goat or Farm Cat';
    }

    if (time === 'low')
    {
      if (home === 'apartment' && personality === 'affectionate') return 'Parrot or Ferret';
      if (home === 'house' && personality === 'playful') return 'Labrador Retriever';
      if (home === 'house' && personality === 'affectionate') return 'Golden Retriever';
      if (home === 'farm') return 'Border Collie';
    }

    return 'Mixed breed or rescue animal';
  }

  const recommendation = getRecommendPet();

  res.render('pet-quiz-result', {recommendation});
})



// catch 404 and forward to error handler
>>>>>>> 2c3b3695b6100d50bff19d800eedacd6d366f43d
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