var express = require('express');
var router = express.Router();
var { data } = require('../models/data');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', data);
});


router.get('/logout', function(req, res) {
    res.clearCookie('UVS');
    res.redirect('/');
});

module.exports = router;