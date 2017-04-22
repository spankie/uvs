var express = require('express');
var router = express.Router();
// var { data } = require('../models/data');
// this is to eliminate other objects added to data from other routes...
myData = {
    title: "Leap Development Knights"
}
var { pool } = require('../models/db_config')

// var myData = data;
/* GET home page. */
router.get('/', function(req, res, next) {
    // check if there is an election today. //
    pool.getConnection(function(err, connection) {
        connection.query("SELECT id FROM elections WHERE DATE(date) = DATE(NOW())", function(err, results, fields) {
            if (err) {
                console.log(err);
                res.render('index', myData);
            } else {
                if(results.length > 0) {
                    myData.election = results[0].id;
                    console.log("ELECTION :: ", myData.election);
                    res.render('index', myData);
                } else {
                    // console.log("ELECTION2 :: ", data.election, data.candidates);
                    res.render('index', myData);
                }
            }
            connection.release();
        });
    });
});


router.get('/logout', function(req, res) {
    res.clearCookie('UVS');
    res.clearCookie('voter');
    res.redirect('/');
});

module.exports = router;