var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
// this is to eliminate other objects added to data from other routes...
myData = {
    title: data.title
}
var { pool } = require('../models/db_config')

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
                    // GET CANDIDATES TO DISPLAY THEIR PICTURES ON THE MAIN PAGE...
                    // GET ELECO TEAM TO DISPLAY...
                    res.render('index', myData);
                } else {
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