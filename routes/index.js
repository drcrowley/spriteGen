var config = require('../config');
var fs = require('fs');

var Settings   = require('../models/settings');
var Sprites   = require('../models/sprites');

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

  app.delete('/api/sprites/:id', function (req, res){
    return Sprites.findById(req.params.id, function (err, sprites) {
        if (err) throw err;
        if(!sprites) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }
        return sprites.remove(function (err) {
            if (!err) {
                deleteFolderRecursive('public/img/' + req.user._id + '/sprites/' + sprites.title)
                deleteFolderRecursive('public/img/' + req.user._id + '/elements/' + sprites.title)
                console.log("sprite removed");
                return res.send({ status: 'OK' });
            } else {
                res.statusCode = 500;
                console.log('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            }
        });
    });
  });

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
          padding: req.body.padding,
          prefix: req.body.prefix
        });

        settings.save(function(err) {
          if (err)
            throw err;
          res.redirect('/');
        });

      }
    });

  });

  app.post('/api/checktitle', function(req, res) {
    function check (callback) {
      Sprites.count({title : req.body.title}, function (err, count) {
        callback(err, count);
      });
    };

    check(function (err, exists) {
      if (err) throw err;
      if (exists) res.send(false);
      else res.send(true);
    });
  });

};

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
};

function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};