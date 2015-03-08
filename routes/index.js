var config = require('config');

module.exports = function(app) {

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

  app.get('/registration', function(req, res) {
    res.render('registration', { title: 'Регистрация'});
  });

};


