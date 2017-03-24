var mysql = require('mysql');
module.exports.pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'toor',
    database: 'uvs'
});