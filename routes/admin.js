var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config');
var cookieParser = require('cookie-parser');
var login = require('../auth/auth').login;

router.use(login);

/* GET login page */
router.get('/login', function(req, res, next) {
    var get = req.query;
    
    data.get_err = get.err;
    data.page = 'login';
    // console.log(typeof data.get_err);
    res.render('admin', data);
});

/* GET admin dashboard page. */
router.get('/', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'loggedin';
    res.render('admin', data);
});

/* GET allvoters page to list all eligible voters. */
router.get('/voters', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'voters';
    res.render('admin', data);
});

/* GET newelection page to create a new election. */
router.get('/elections', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'elections';
    res.render('admin', data);
});

/* GET ongoing page to view ongoing election. */
router.get('/ongoing', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'ongoing';
    res.render('admin', data);
});

/* GET addstudent page to add new eligible student. */
router.get('/students', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'students';
    res.render('admin', data);
});

router.post('/login', function(req, res, next) {
    var body = req.body;
    // console.log(JSON.stringify(body));
    // check for login
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.redirect('/admin/login?err=username+or+password+is+incorrect');
        } else {
            connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [body.username, body.password], function(err, result, fields) {
                if (err) {
                    //throw err;
                    console.log(err);
                    res.redirect('/admin/login?err=username+or+password+is+incorrect');
                } else {
                    // console.log(result);
                    if (result.length > 0) {
                        // TODO: look for a way to encode the cookie
                        res.cookie('UVS', result);
                        res.redirect('/admin');
                    } else {
                        res.redirect('/admin/login?err=username+or+password+is+incorrect');
                        // console.log(result.length);
                    }
                }
                connection.release();
            });
        }
    });
});

module.exports = router;