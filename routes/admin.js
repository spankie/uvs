var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config');
var cookieParser = require('cookie-parser');
var login = require('../auth/auth').login;

router.use(login);

/* GET admin dashboard page. */
router.get('/', function(req, res, next) {
    if (req.loggedin) {
        data.page = 'loggedin';
    } else {
        data.page = 'login';
    }

    res.render('admin', data);
});

router.get('/login', function(req, res, next) {
    data.page = 'login';
    res.render('admin', data);
});

/* GET allvoter page to list all eligible voters. */
router.get('/allvoter', function(req, res, next) {
    data.page = 'allvoters';
    res.render('admin', data);
});

/* GET newelection page to create a new election. */
router.get('/newelection', function(req, res, next) {
    data.page = 'newelection';
    res.render('admin', data);
});

/* GET ongoing page to view ongoing election. */
router.get('/ongoing', function(req, res, next) {
    data.page = 'ongoing';
    res.render('admin', data);
});

/* GET addstudent page to add new eligible student. */
router.get('/addstudent', function(req, res, next) {
    data.page = 'addstudent';
    res.render('admin', data);
});

router.post('/login', function(req, res, next) {
    var body = req.body;
    // console.log(JSON.stringify(body));
    // check for login
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
        }
        connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [body.username, body.password], function(err, result, fields) {
            if (err) {
                //throw err;
                console.log(err);
            }
            // console.log(result);
            if (result.length > 0) {
                // TODO: look for a way to encode the cookie
                res.cookie('UVS', result);
                res.redirect('/admin');
            } else {
                console.log(result.length);

            }

            connection.release();

        });
    });
});

module.exports = router;