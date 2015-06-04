var multer = require('multer');
var fs = require('fs');
var mkdirp = require('mkdirp');
var spritesmith = require('spritesmith');

var Sprites   = require('../models/sprites');

var Settings   = require('../models/settings');

module.exports = function(app) {

    var filePath;
    var fileName;

    var mMulter = multer({ dest: './public/img/',
        changeDest: function(dest, req, res) {
            var dest = dest + '/'+ req.user._id + '/elements/' + req.body.title;
            var stat = null;
            try {
                stat = fs.statSync(dest);
            } catch(err) {
                mkdirp.sync(dest);
            }
            if (stat && !stat.isDirectory()) {
                throw new Error('Директория не может быть создана');
            }
            return dest;
        },
        rename: function (fieldname, filename) {
            return Date.now()+filename;
        },
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...');
        },
        onFileUploadComplete: function (file, req, res) {

            console.log(file.fieldname + ' uploaded to  ' + file.path);
            fileName = file.originalname;
            filePath = './public/img/' + req.user._id;

            Settings.findOne( {user: req.user._id}, function(err, settings) {
                if (err) throw err;
                createSprite(filePath, settings, req);
            });

        }
    });


    app.post('/api/sprites', mMulter, function(req,res){

            var sprites = new Sprites({
                user: req.user._id,
                title: req.body.title
            });

            sprites.save(function(err) {
              if (err) throw err;
              res.redirect('/');
            });

    });

};

var createSprite = function(filePath, settings, req) {
    fs.readdir( filePath + '/elements/' + req.body.title, function(err, files) {
        if (err) {
            throw err;
        }
        var fileList = [];

        for(i=0; i<files.length; i++) {
            fileList.push(filePath + '/elements/' + req.body.title + '/' + files[i]);
        }
        spritesmith({
            src: fileList,
            padding: (settings) ? parseInt(settings.padding) : 20
        }, function handleResult (err, result) {
            if (err) throw err;
            var dest = filePath + '/sprites/' + req.body.title + '/';
            var stat = null;
            try {
                stat = fs.statSync(dest);
            } catch(err) {
                mkdirp.sync(dest);
            }

            fs.writeFileSync(dest + 'sprite.png', result.image, 'binary');

            createCss(result.coordinates, settings, dest, req);
        });
    });
};

var createCss = function(coord, settings, dest, req) {
    var prefix = (settings) ? settings.prefix : 'ico',
        css = '.'+ prefix + '{background: url(sprite.png) 0 0;}',
        className,
        bgPos = {},
        width,
        height,
        cssItem,
        cssTemplate =
                '\n.'+ prefix +'.'+ prefix +'_{className} {\n' +
                'background-position: -{x}px -{y}px;\n' +
                'width: {width}px; \n'+
                'height: {height}px; \n'+
                '}';

    for (i in coord) {
        className = i.split('/');
        className = className[className.length-1].replace(new RegExp("\.(gif|jpg|jpeg|tiff|png)$",'g'), '').replace(new RegExp("^[0-9]+",'g'), '');
        bgPos.x = coord[i].x;
        bgPos.y = coord[i].y;
        width = coord[i].width;
        height = coord[i].height;
        cssItem = cssTemplate.replace('{className}', className).replace('{x}', bgPos.x).replace('{y}', bgPos.y).replace('{width}', width).replace('{height}', height);
        css+= cssItem;
    }

    fs.writeFile(dest + '/sprite.css', css, function(err) {
        if(err) throw err;
        console.log("The file was created!");
    });


    Sprites.update({title: req.body.title}, { $set: { css : css }}, function (err, css) {
        if (err) throw err;
    });


};