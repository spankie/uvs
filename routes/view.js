var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config')

router.get("/election/:id", function(req, res, next) {
    data.query = req.query;
    var p = req.params;
    data.election = p.id;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT status FROM elections WHERE id = ?", [p.id], function(err, results, fields) {
            data.electionstatus = results[0].status;
            res.render("view", data);
            connection.release();
        });
    });
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
                        results[0].election = p.id;
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

router.post("/getvoteresult/:id", function(req, res, next) {
    var p = req.params;

    pool.getConnection(function(err, connection) {
        if(err) {
            console.log(err);
            res.setHeader('Content-Type', 'application/json');
            res.send({m: "err"});
        }
        connection.query("SELECT * FROM candidates WHERE election_id = ? ORDER BY votes DESC", [p.id], function(err, results, fields) {
            if(err) {
                console.log(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(results);
            connection.release();
        });
    });
});

router.post("/getresult/:id", function(req, res, next) {
    var p = req.params;
    var me = req.signedCookies.voter[0];
    console.log("me: " + JSON.stringify(me));
    pool.getConnection(function(err, connection) {
        if(err) {
            console.log(err);
            res.setHeader('Content-Type', 'application/json');
            res.send({m: "err"});
        }
        connection.query("SELECT * FROM candidates WHERE election_id = ? ORDER BY votes DESC", [p.id], function(err, results, fields) {
            if(err) {
                console.log(err);
            }
            var cands = results;
            // loop through the results array and remove those the user has voted for. ///
            connection.query("SELECT position FROM votes WHERE elect_id = ? AND matno = ?", [p.id, me.matno], function(err, results, fields) {
                if(err) {
                    console.log(err);
                }
                // var newcands = cands;
                // var indices = [];
                console.log("positions results: ", results);
                console.log("cands results: ", cands);
                // remove those results from cand //
                for (var i = 0; i < cands.length; i++) {
                    for(var j = 0; j < results.length; j++) {
                        if(cands[i].position == results[j].position) {
                            delete cands[i];
                            break;
                        }
                    }
                }
                // console.log("cands results: ", cands);
                res.setHeader('Content-Type', 'application/json');
                res.send(cands);
                connection.release();
            });
            
        });
    });
});

module.exports = router;