module.exports.login = function(req, res, next) {
    var cookie = req.cookies.UVS;
    if (cookie === undefined) {
        req.loggedin = false;
    } else {
        req.loggedin = true;
        console.log("cookie: " + cookie[0].email);
    }
    next();
}