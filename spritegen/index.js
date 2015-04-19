var multer = require('multer');
var fs = require('fs');
var spritesmith = require('spritesmith');

var filePath =  './uploads';
var done = false;


module.exports = function(app) {
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
            res.redirect('/');
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

        spritesmith({src:fileList}, function handleResult (err, result) {
            if (err) {
                throw err;
            }
            fs.writeFileSync('./public/img/canvassmith.png', result.image, 'binary');
            result.coordinates, result.properties;
        });
    });
};

