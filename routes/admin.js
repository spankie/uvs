var express = require('express');
var router = express.Router();
var { data } = require('../models/data');
var { pool } = require('../models/db_config');
var cookieParser = require('cookie-parser');
var login = require('../auth/auth').login;

router.use(login);

/* GET login page */
router.get('/login', function(req, res, next) {
    var get = req.query;
    
    data.get_err = get.err;
    data.page = 'login';
    // console.log(typeof data.get_err);
    res.render('admin', data);
});

router.use(function(req, res, next){
    data.admin = req.signedCookies.UVS[0].username;
    next();
});

/* GET admin dashboard page. */
router.get('/', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'loggedin';
    res.render('admin', data);
});

/* GET allvoters page to list all eligible voters. */
router.get('/voters', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'voters';
    pool.getConnection(function(err, connection) {
        connection.query("SELECT * FROM voters", function(err, results, fields) {
            if(err) {
                console.log(err);
                data.voters = false;
            } else {
                data.voters = results;
            }
            res.render('admin', data);
            connection.release();
        });
    });
    
});

/* GET newelection page to create a new election. */
router.get('/elections', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'elections';
    data.query = req.query;
    pool.getConnection(function(err, connection) {
        if(err) {
            console.log(err);
            res.render('admin', data);
            return;
            // res.redirect('/admin/elections?err=Could+not+add+new+election');
            // return;
        } else {
            connection.query("SELECT * FROM elections", function(err, results, fields) {
                if(err) {
                    console.log(err);
                    res.render('admin', data);
                    return;
                } else {
                    data.elections = results;
                    // console.log(typeof data.elections);
                    res.render('admin', data);
                    return;
                }
                
            });
        }
    });
});

router.post('/elections/new', function(req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection){
        if(err) {
            console.log(err);
            res.redirect('/admin/elections?err=Could+not+add+new+election');
            return
        } else {
            connection.query("INSERT INTO elections VALUES (NULL, ?, ?, ?, 'pending')", [body.type, body.date, body.duration], function(err, results, fields) {
                if(err) {
                    console.log(err);
                    res.redirect('/admin/elections?err=Could+not+add+new+election');
                    connection.release();
                    return;
                } else {
                    res.redirect('/admin/elections?status=New+Election+added.');
                    connection.release();
                    return;
                }
            });
        }
    });
    console.log('body:', body);
});

router.post("/savestudent", function(req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        connection.query("INSERT INTO students VALUES (NULL, ?, ?, ?, ?)", [body.matno, body.dob, body.state, body.lga], function(err, results, fields) {
            if(err) {
                console.log(err);
            } else {
                console.log("student saved");
                res.redirect("/admin/students");
            }
        });
    });
});

/* GET ongoing page to view ongoing election. */
// router.get('/ongoing', function(req, res, next) {
//     if (!req.loggedin) {
//         res.redirect("/admin/login");
//         return;
//     }
//     data.page = 'ongoing';
//     res.render('admin', data);
// });

/* GET addstudent page to add new eligible student. */
// router.get('/students', function(req, res, next) {
//     if (!req.loggedin) {
//         res.redirect("/admin/login");
//         return;
//     }
//     data.page = 'students';
//     res.render('admin', data);
// });

router.post('/login', function(req, res, next) {
    // if (!req.loggedin) {
    //     res.redirect("/admin/login");
    //     return;
    // }
    var body = req.body;
    const cookieParams = {
        httpOnly: true,
        signed: true
        // maxAge: 300000,
    };
    // console.log(JSON.stringify(body));
    // check for login
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.redirect('/admin/login?err=username+or+password+is+incorrect');
        } else {
            connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [body.username, body.password], function(err, result, fields) {
                if (err) {
                    //throw err;
                    console.log(err);
                    res.redirect('/admin/login?err=username+or+password+is+incorrect');
                } else {
                    // console.log(result);
                    if (result.length > 0) {
                        // TODO: look for a way to encode the cookie
                        res.cookie('UVS', result, cookieParams);
                        res.redirect('/admin');
                    } else {
                        res.redirect('/admin/login?err=username+or+password+is+incorrect');
                        // console.log(result.length);
                    }
                }
                connection.release();
            });
        }
    });
});

router.get('/elections/:election/start', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    pool.getConnection(function(err, connection) {
        connection.query("UPDATE elections SET status = 'started' WHERE id = ?", [req.params.election], function(err, results, fields){
            if(err) {
                console.log(err);
            }
            res.redirect("/admin/elections/" + req.params.election);
        });
    });
});

router.get('/elections/:election/stop', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    pool.getConnection(function(err, connection) {
        connection.query("UPDATE elections SET status = 'ended' WHERE id = ?", [req.params.election], function(err, results, fields){
            if(err) {
                console.log(err);
            }
            res.redirect("/admin/elections/" + req.params.election);
        });
    });
});

router.get('/elections/:election', function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    data.page = 'editelection';
    data.elect_id = req.params.election;
    data.query = req.query;
    // get the election details //
    pool.getConnection(function(err, connection) {
        if(err) {
            console.log(err);
            res.render("admin", data);            
            return;
        } else {
            connection.query("SELECT * FROM elections WHERE id = ?", [req.params.election], function(err, results, fields) {
                if(err) {
                    console.log(err);
                } else {
                    if(results.length > 0) {
                        data.election = results[0];                      
                    }
                    connection.query("SELECT * FROM candidates WHERE election_id = ?", [req.params.election], function(err, results, fields){
                        if(err) {
                            console.log(err);
                            res.render("admin", data);
                        } else {
                            if(results.length > 0) {
                                data.candidates = results;
                                res.render("admin", data);                                
                            } else {
                                res.render("admin", data);
                            }
                        }
                    });
                }
            });
        }
    });
});

router.post("/elections/:election/candidate", function(req, res, next) {
    if (!req.loggedin) {
        res.redirect("/admin/login");
        return;
    }
    var body = req.body;
    var p = req.params;
    // console.log(p);
    pool.getConnection(function(err, connection) {
        if(err) {
            console.log(err);
            res.redirect('/admin/elections/' + p.election + '?err=Could+not+add+this+candidate');
            return;
        } else {
            // check if the candidate has been registered before //
            connection.query("SELECT matno FROM candidates WHERE election_id = ? AND matno = ?", [p.election, body.matno], function(err, results, fields) {
                if(err) {
                    res.redirect('/admin/elections/' + p.election + '?err=Could+not+add+this+candidate');
                    connection.release();
                } else {
                    if(results.length > 0) {
                        res.redirect('/admin/elections/' + p.election + '?err=This+candidate+has+been+added+already');
                        connection.release();
                    } else {
                        connection.query("INSERT INTO candidates VALUES (NULL, ?, ?, ?, ?, 0)", [p.election, body.name, body.pos, body.matno], function(err, results, fields){
                            if(err) {
                                console.log(err);
                                res.redirect('/admin/elections/' + p.election + '?err=Could+not+add+this+candidate');
                            } else {
                                res.redirect('/admin/elections/' + p.election + '?status=New+candidate+inserted');
                            }
                            connection.release();
                        });
                    }
                }
            });
        }
    });
});

module.exports = router;