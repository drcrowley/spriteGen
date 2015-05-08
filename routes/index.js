var config = require('../config');

var Settings   = require('../models/settings');

module.exports = function(app, passport) {


  app.locals.siteName = config.get('siteName');

  app.use(function (req, res, next) {
    app.locals.route = req.url;
    next();
  });

  app.get('/', isLoggedIn, function(req, res) {
    res.render('index', {
      title: 'Главная',
      user:  req.user.username});
  });



  app.get('/login',  function(req, res) {
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

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
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
  }));

  app.post('/api/settings', function(req, res) {

    Settings.findOne({ 'user' :  req.user._id }, function(err, settings) {
      if (settings) {
        settings.padding = req.body.padding;

        settings.save(function(err) {
          if (err)
            throw err;
          res.redirect('/');
        });

      } else {

        var settings = new Settings({
          user: req.user._id,
          padding: req.body.padding
        });

        settings.save(function(err) {
          if (err)
            throw err;
          res.redirect('/');
        });

      }

    });

  });


};

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
