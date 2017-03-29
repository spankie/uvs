var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const cookieEncrypter = require('cookie-encrypter');
const secretKey = 'spankie';

// var login = require('./auth/auth').login;
var index = require('./routes/index');
var admin = require('./routes/admin');
var register = require('./routes/register');
var view = require('./routes/view');
var vote = require('./routes/vote');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));
app.use(express.static(path.join(__dirname, 'public')));

// test for login for all routes to /admin including post
// app.all("/admin/", login);

app.use('/', index);
app.use('/admin', admin);
app.use('/register', register);
app.use('/view', view);
app.use('/vote', vote);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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