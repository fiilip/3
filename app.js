const createError = require('http-errors');
const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');


const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null,file.fieldname + "-" + Date.now() +  path.extname(file.originalname));
    }
});


// Init Upload

const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('myImage');


//check File Type
function checkFileType(file,cb){
    // allowed ext
    const filetypes = /jpeg|jpg|png|gif/;

    //check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //check mime
    const mimetype = filetypes.test(file.mimetype);
    if(extname){
        return cb(null,true);
    }else{
        cb('Error: Images Only!');
    }
}


const app = express();



app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) =>{
    upload(req, res, (err) => {
        if(err){
            res.render('index',{
                msg: err
            });
        } else{
            if(req.file == undefined){
                res.render('index',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                res.render('index',{
                    msg: 'file Uploaded!',
                    file: `uploads/${req.file.filename}`
                });
            }
        }
    });
});




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
