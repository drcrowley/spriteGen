var config = require('../config');

var ArticleModel    = require('../libs/mongoose').ArticleModel;

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

  app.post('/api/articles', function(req, res) {
      var article = new ArticleModel({
          title: req.body.title,
          author: req.body.author,
          description: req.body.description,
          // images: req.body.images
      });


      article.save(function (err) {
          if (!err) {
               console.log("article created");
              return res.send({ status: 'OK', article:article });
          } else {
              console.log(err);
              if(err.name == 'ValidationError') {
                  res.statusCode = 400;
                  res.send({ error: 'Validation error' });
              } else {
                  res.statusCode = 500;
                  res.send({ error: 'Server error' });
              }
               console.log('Internal error(%d): %s',res.statusCode,err.message);
          }
      });
  });

};


