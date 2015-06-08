var multer = require('multer');
var fs = require('fs');
var mkdirp = require('mkdirp');
var spritesmith = require('spritesmith');
var zip = require("node-native-zip");

var Sprites   = require('../models/sprites');

var Settings   = require('../models/settings');


var spriteGen = {
    addElements: multer({ dest: './public/img/',
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
                    onFileUploadComplete: function (file, req, res) {
                        var filePath = './public/img/' + req.user._id;
                        getSettings(filePath, req);
                    }
                }),
    delSprite: function(req, res) {
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
    },
};


module.exports = spriteGen;

var getSettings = function(filePath, req) {
    Settings.findOne( {user: req.user._id}, function(err, settings) {
        if (err) throw err;
        createSprite(filePath, settings, req);
    });
}

var createSprite = function(filePath, settings, req) {
    fs.readdir( filePath + '/elements/' + req.body.title, function(err, files) {
        if (err) throw err;

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
        css = '.'+ prefix + ' {background: url(sprite.png) 0 0;}',
        className,
        fileListName = [],
        bgPos = {},
        width,
        height,
        cssItem,
        cssTemplate =
                '\n.'+ prefix +'.'+ prefix +'_{className} {\n' +
                '\tbackground-position: -{x}px -{y}px;\n' +
                '\twidth: {width}px; \n'+
                '\theight: {height}px; \n'+
                '}';
    for (i in coord) {
        className = i.split('/');
        className = className[className.length-1];
        fileListName.push(className);
        className = className.replace(new RegExp("\.(gif|jpg|jpeg|tiff|png)$",'g'), '').replace(new RegExp("^[0-9]+",'g'), '');
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

    Sprites.update({title: req.body.title}, { $set: { css : css, elements : fileListName }}, function (err, css) {
        if (err) throw err;
    });
    createZip(dest, req);
};

var createZip = function(dest, req) {
    var archive = new zip();

    archive.addFiles([ 
        { name: "sprite.css", path: dest + "/sprite.css" },
        { name: "sprite.png", path: dest + "/sprite.png" }
    ], function (err) {
        if (err) return console.log("err while adding files", err);

        var buff = archive.toBuffer();

        fs.writeFile(dest + "/sprite.zip", buff, function () {
            console.log("Finished");
        });
    });
};

var deleteFolderRecursive = function(path) {
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