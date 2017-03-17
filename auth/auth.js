module.exports.login = function(req, res, next) {
    req.loggedin = true;
    next();
}