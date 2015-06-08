var config = require('../config');
var fs = require('fs');

var Settings   = require('../models/settings');
var Sprites   = require('../models/sprites');

var spriteGen   = require('../spritegen');

module.exports = function(app, passport) {


  app.locals.siteName = config.get('siteName');

  app.use(function (req, res, next) {
    app.locals.route = req.url;
    next();
  });

  app.get('/', isLoggedIn, function(req, res) {
    Sprites.find({ user: req.user._id }, function (err, sprites) {
      if (err) throw err;
      res.render('index', {
        title: 'Главная',
        user:  req.user.username,
        userId: req.user._id,
        sprites: sprites
      });
    });
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

  app.post('/api/sprites', spriteGen.addElements, function(req,res){
      var sprites = new Sprites({
          user: req.user._id,
          title: req.body.title
      });

      sprites.save(function(err) {
        if (err) throw err;
        spriteGen.createSprite(req, res, sprites._id);
      });
  });

  // app.post('/api/edit', spriteGen.addElements, function(req,res){
  //   spriteGen.createSprite(req);
  // });

  app.delete('/api/sprites/:id', function (req, res){
    spriteGen.delElements(req, res);
  });

  app.post('/api/settings', function(req, res) {
    Settings.findOne({ 'user' :  req.user._id }, function(err, settings) {
      if (settings) {
        settings.padding = req.body.padding;
        settings.prefix = req.body.prefix;
        settings.save(function(err) {
          if (err) throw err;      
          Sprites.find({}, function(err, sprites) {
              if (err) throw err;
              for(i=0; i<sprites.length-1; i++) {
                spriteGen.createSprite(req, res, sprites[i]._id);
              };
          });
        });
      } else {
        var settings = new Settings({
          user: req.user._id,
          padding: req.body.padding,
          prefix: req.body.prefix
        });
        settings.save(function(err) {
          if (err) throw err;
          Sprites.find({}, function(err, sprites) {
              if (err) throw err;
              for(i=0; i<sprites.length-1; i++) {
                spriteGen.createSprite(req, res, sprites[i]._id);
              };
          });      
        });
      }
    });
  });

  app.post('/api/checktitle', function(req, res) {
    var checkTitle = function(callback) {
      Sprites.count({title : req.body.title}, function (err, count) {
        callback(err, count);
      });
    };

    checkTitle(function (err, exists) {
      if (err) throw err;
      if (exists) res.send(false);
      else res.send(true);
    });
  });

};

var isLoggedIn = function(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
};