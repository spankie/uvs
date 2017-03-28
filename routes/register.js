var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config');

/* GET users listing. */
router.get('/', function(req, res, next) {
    data.query = req.query;
    res.render('register', data);
});

router.post('/', function(req, res, next) {
    var body = req.body;
    // console.log(body.fname);
    if(body.fname != "" && body.mname != "" && body.lname != "" && body.matno != "" && body.soo != "" && body.lga != "" && body.dept != "") {
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log(err);
                res.redirect('/register?err=Unable+to+register.+Please+try+again');
            } else {
                // check if the student is eligible to register //
                connection.query("SELECT matno FROM students WHERE matno = ?", [body.matno], function(err, results, fields) {
                    if(err){
                        // if there is a connection error...
                        console.log(err);
                        res.redirect('/register?err=Unable+to+register.+Please+try+again');
                        conection.release();
                    } else {
                        if(results.length > 0) {
                            // the student is eligible to register ...
                            // now, check if matric number has been used before //
                            // Might need to check for other things //
                            connection.query("SELECT * FROM voters WHERE matno = ?", [body.matno], function(err, results, fields) {
                                if(err) {
                                    // if there is a connection error...
                                    console.log(err);
                                    res.redirect('/register?err=Unable+to+register.+Please+try+again');
                                    conection.release();                                    
                                } else {
                                    // if no connection error ...
                                    if (results.length > 0) {
                                        // if there is a user with the same matric number ...
                                        res.redirect('/register?err=Matric+number+has+already+been+used.');
                                        conection.release();
                                        // should probably not let the user know the matric number has been used
                                    } else {
                                        // if there is no user with the same matric number ...
                                        connection.query("INSERT INTO voters VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)",
                                        [body.fname, body.mname, body.lname, body.matno, body.password, body.soo, body.lga, body.dept],
                                        function(err, results, fields) {
                                            if(err) {
                                                console.log(err);
                                                res.redirect('/register?err=Unable+to+register.+Please+try+again');
                                            } else {
                                                console.log('Results: ', results);
                                                console.log('fields: ', fields);
                                                res.redirect('/register?status=Registeration+Successful.');
                                            }
                                            connection.release();
                                        });
                                    }
                                }
                            });
                        } else {
                            // the matric number is not registered, therefore cannot register as a voter.
                            res.redirect('/register?err=You+are+not+eligible+to+vote.');
                            connection.release();
                        }
                    }
                });
                    
            }
        });
    } else {
        console.log(err);
        res.redirect('/register?err=Please+fill+out+all+required+fields');
    }
});

module.exports = router;