module.exports.login = function(req, res, next) {
    req.loggedin = false;
    next();
}