var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config');
var cookieParser = require('cookie-parser');

/* GET home page. */
router.get('/', function(req, res, next) {
    // if logged in, allow to admin page else show the login page.
    if (req.loggedin) {
        data.page = 'loggedin';
    } else {
        data.page = 'login';
    }
    res.render('admin', data);
});

router.post('/', function(req, res, next) {
    var body = req.body;
    // console.log(JSON.stringify(body));
    // check for login
    pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [body.username, body.password], function(err, result, fields) {
            // console.log(result);
            if (result.length > 0) {
                // look for a way to encode the cookie
                res.cookie('UVS', result);
                res.redirect('/admin');
            } else {
                console.log(result.length);

            }

            connection.release();
            if (err) {
                throw err;
            }
        });
    });

    // then set cookies and redirect admin...
});

module.exports = router;