var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config')

/* GET home page. */
router.get('/', function(req, res, next) {
    // check if there is an election today. //
    pool.getConnection(function(err, connection) {
        connection.query("SELECT id FROM elections WHERE DATE(date) = DATE(NOW())", function(err, results, fields) {
            if (err) {
                console.log(err);
                res.render('index', data);
            } else {
                if(results.length > 0) {
                    data.election = results[0].id;
                    res.render('index', data);
                } else {
                    res.render('index', data);
                }
            }
        });
    });
});


router.get('/logout', function(req, res) {
    res.clearCookie('UVS');
    res.clearCookie('voter');
    res.redirect('/');
});

module.exports = router;