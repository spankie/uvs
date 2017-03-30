var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config');
var { votelogin } = require('../auth/auth');

// authenticate the voter first using the auth package///
router.use(votelogin);

router.get("/", function(req, res, next) {
    if(req.vote) {
        data.election = req.vote[0].election;
        console.log("election : " + data.election);
        res.render("vote", data);
    } else {
        res.redirect("/");
    }
})

router.post("/", function(req, res, next) {
    if(req.vote) {
        /// post the students vote ///
        var me = req.vote[0];
        // console.log(me);
        var myvote = req.body; 
        console.log("My vote: ", myvote);
        // cast the vote to reflect in the db. //
        
        pool.getConnection(function(err, connection) {
            if(err) {
                res.setHeader('Content-Type', 'application/json');
                res.send({message: "error"});
            } else {
                console.log(me);
                for (var key in myvote) {
                    console.log("key:", key);
                    if (myvote.hasOwnProperty(key) && myvote[key] != "") {
                        votenow(connection, me.matno, key, myvote[key], me.election);
                    }
                }
            }
        });

        res.clearCookie('voter');
        res.setHeader('Content-Type', 'application/json');
        res.send({message: "ok"});
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send({message: "error"});
    }
});

function votenow(connection, matno, key, myvote_key, election) {
    // check if the user has voted for this position before //
    connection.query("SELECT * FROM votes WHERE elect_id = ? AND matno = ? AND position = ?", [election, matno, key], function(err, results, fields) {
        if(results.length > 0) {
            console.log("already voted for :", key);
        } else {
            connection.query("INSERT INTO votes VALUES (NULL, ?, ?, ?, ?)", [matno, key, myvote_key, election], function(err, results, fields) {
                connection.query("UPDATE candidates SET votes = (votes + 1) WHERE id = ?", [myvote_key], function(err, results, fields) {
                    console.log("voted : " + key);
                    console.log(election, myvote_key, key);
                });
            });
        }
    });
}
module.exports = router;