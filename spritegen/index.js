var multer = require('multer');
var fs = require('fs');
var spritesmith = require('spritesmith');

var filePath =  './uploads';
var done = false;

var Sprites   = require('../models/sprites');

module.exports = function(app) {

    app.use(function (req, res, next) {
        next();
    });

    var fileName;

    app.use(multer({ dest: './uploads/',
        rename: function (fieldname, filename) {
            return filename+Date.now();
        },
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...')
        },
        onFileUploadComplete: function (file) {
            console.log(file.fieldname + ' uploaded to  ' + file.path)
            fileName = file.originalname;
            done=true;
        }
    }));

    app.post('/api/sprites',function(req,res){
        if(done==true){
            var sprites = new Sprites({
                user: req.user._id,
                title: req.body.title,
                img: fileName
            });

            sprites.save(function(err) {
              if (err) throw err;
              res.redirect('/');
            });
        }
    });

    fs.watch(filePath, function (event, filename) {
        makeSprite(filePath);
    });
};


var makeSprite = function(filePath) {
    fs.readdir( filePath, function(err, files) {
        if (err) {
            throw err;
        }
        var fileList = [];

        for(i=0; i<files.length; i++) {
            fileList.push(filePath + '/' + files[i]);
        }

        spritesmith({
            src:fileList,
            padding: 20
        }, function handleResult (err, result) {
            if (err) {
                throw err;
            }
            fs.writeFileSync('./public/img/canvassmith.png', result.image, 'binary');
            result.coordinates, result.properties;
        });
    });
};

