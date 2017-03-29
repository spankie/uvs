var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config')

router.get("/election/:id", function(req, res, next) {
    data.query = req.query;
    var p = req.params;
    data.election = p.id;
    res.render("view", data);
});

router.post("/election/:id", function(req, res, next) {
    var body = req.body;
    var p = req.params;
    const cookieParams = {
        httpOnly: true,
        signed: true
        // maxAge: 300000,
    };
    
    pool.getConnection(function(err, connection) {
        if(err) {
            console.log(err);
            res.redirect("/view/election/" + p.id + "?err=Matric+number+or+password+is+incorrect");
        } else {
            connection.query("SELECT * FROM voters WHERE matno = ? AND password = ?", [body.matno, body.password], function(err, results, fields){
                if(err) {
                    console.log(err);
                    res.redirect("/view/election/" + p.id + "?err=Matric+number+or+password+is+incorrect");
                } else {
                    if(results.length > 0) {
                        res.cookie("voter", results, cookieParams);
                        res.redirect('/vote');
                    } else {
                        res.redirect("/view/election/" + p.id + "?err=Matric+number+or+password+is+incorrect");
                    }
                }
                connection.release();
            });
        }
    });
});

module.exports = router;