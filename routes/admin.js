var express = require('express');
var router = express.Router();
var { data } = require('../models/data');

/* GET home page. */
router.get('/', function(req, res, next) {
    // if logged in, allow to admin page else show the login page.
    if (req.loggedin) {
        data.page = 'loggedin';
    } else {
        res.redirect('/');
        return;
    }
    res.render('admin', data);
});

module.exports = router;