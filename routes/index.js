var config = require('../config');
var login = require('../controllers/users/login');
var registration = require('../controllers/users/registration');
var logout = require('../controllers/users/logout');



var ArticleModel = require('../libs/mongoose').ArticleModel;

module.exports = function(app, passport) {


  app.locals.siteName = config.get('siteName');

  app.use(function (req, res, next) {
    app.locals.route = req.url;
    next();
  });

  app.get('/', function(req, res) {
    res.render('index', { title: 'Главная'});
  });

  app.get('/about', function(req, res) {
    res.render('about', { title: 'О сайте'});
  });

  app.get('/login', function(req, res) {
    res.render('login', {
      title: 'Вход',
      message: req.flash('loginMessage')
    });
  });

  app.get('/registration', function(req, res) {
    res.render('registration', {
      title: 'Регистрация',
      message: req.flash('signupMessage')
    });
  });

  app.post('/registration', passport.authenticate('local-signup', {
    successRedirect : '/',
    failureRedirect : '/registration',
    failureFlash : true // allow flash messages
  }));

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }), function(req, res) {});

};

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
