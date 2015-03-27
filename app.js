var express = require('express');
var path = require('path');
var config = require('./config');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.pretty = true;

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require('./routes')(app);


var multer = require('multer');
var done = false;

app.use(multer({ dest: './uploads/',
  rename: function (fieldname, filename) {
    return filename+Date.now();
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
    done=true;
  }
}));

app.post('/api/photo',function(req,res){
  if(done==true){
    res.end("File uploaded. ");
  }
});

var fs = require('fs');
var spritesmith = require('spritesmith');

var getFileList = function(filePath) {
  fs.readdir( filePath, function(err, files) {
    if (err) {
      throw err;
    }
    var fileList = [];

    for(i=0; i<files.length; i++) {
      fileList.push(filePath + '/' + files[i]);
    }
    makeSprite(fileList);

  });
};

var makeSprite = function(fileList) {
  spritesmith({src:fileList}, function handleResult (err, result) {
    if (err) {
      throw err;
    }
    fs.writeFileSync(__dirname + '/public/img/canvassmith.png', result.image, 'binary');
    result.coordinates, result.properties; // Coordinates and properties
  });
};

var filePath =  __dirname + '/uploads';

fs.watch(filePath, function (event, filename) {
    getFileList(filePath);
});

getFileList(filePath);

app.get('/sprite', function(req, res) {
  var file = new fs.ReadStream(__dirname + '/public/img/canvassmith.png');
  file.pipe(res);
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;