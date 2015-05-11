var multer = require('multer');
var fs = require('fs');
var mkdirp = require('mkdirp');
var spritesmith = require('spritesmith');



var Sprites   = require('../models/sprites');

module.exports = function(app) {

    var filePath;
    var fileName;
    var done = false;

    app.use(multer({ dest: './public/img/',
        changeDest: function(dest, req, res) {
            var dest = dest + '/'+ req.user._id + '/elements/';
            var stat = null;
            try {
                stat = fs.statSync(dest);
            } catch(err) {
                mkdirp.sync(dest);
            }
            if (stat && !stat.isDirectory()) {
                throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
            }
            return dest;
        },
        rename: function (fieldname, filename) {
            return filename+Date.now();
        },
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...');
        },
        onFileUploadComplete: function (file, req, res) {
            console.log(file.fieldname + ' uploaded to  ' + file.path);
            fileName = file.originalname;
            filePath = './public/img/' + req.user._id;
            makeSprite(filePath);
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

};

var makeSprite = function(filePath) {
    fs.readdir( filePath + '/elements', function(err, files) {
        if (err) {
            throw err;
        }
        var fileList = [];

        for(i=0; i<files.length; i++) {
            fileList.push(filePath + '/elements/' + files[i]);
        }
        spritesmith({
            src: fileList,
            padding: 20
        }, function handleResult (err, result) {
            if (err) throw err;
            var dest = filePath + '/sprites/';
            var stat = null;
            try {
                stat = fs.statSync(dest);
            } catch(err) {
                mkdirp.sync(dest);
            }

            fs.writeFileSync(dest + 'canvassmith.png', result.image, 'binary');
            //result.coordinates, result.properties;
        });
    });
};

