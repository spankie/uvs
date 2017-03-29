var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config')

// authenticate the voter first using the auth package///

router.get("/", function(req, res, next) {
    console.log(req.signedCookies);
    res.render("vote", data);
})

module.exports = router;