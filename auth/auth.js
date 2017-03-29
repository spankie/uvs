module.exports.login = function(req, res, next) {
    var cookie = req.signedCookies.UVS;
    // if logged in, allow to admin page else show the login page.
    if (cookie === undefined) {

        req.loggedin = false;
        // res.redirect('/admin/login');
    } else {
        // res.redirect('/admin');
        req.loggedin = true;
        console.log("cookie: " + cookie[0].email);
    }
    next();
}