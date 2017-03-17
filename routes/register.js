var express = require('express');
var router = express.Router();
var { data } = require('../models/data');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('register', data);
});

module.exports = router;