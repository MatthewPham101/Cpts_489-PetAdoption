const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth'); // Renamed for consistency

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Changed to true
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
  res.locals.user = req.session.userId || null;
  next();
});

// Route mounting - ORDER MATTERS!
app.use('/', indexRouter);
app.use('/auth', authRouter); // Changed variable name to match import
app.use('/users', usersRouter);







app.get('/about-us', (req, res) => {
  res.render('about-us', { user: req.session.userId });
});

app.get('/adoption-application', (req, res) => {
  res.render('adoption-application', { user: req.session.userId });
});

app.get('/browse-pets', (req, res) => {
  res.render('browse-pets', { user: req.session.userId });
});

app.get('/pet-compatibility', (req, res) => {
  res.render('pet-compatibility', { user: req.session.userId });
});






// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
