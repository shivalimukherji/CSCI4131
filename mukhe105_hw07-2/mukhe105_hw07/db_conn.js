// the database connection utility
const mysql = require("mysql");

const dbCon = mysql.createConnection({
    host: "cse-mysql-classes-01.cse.umn.edu",
    user: "C4131DF23U70",               // replace with the database user provided to you
    password: "4950",                  // replace with the database password provided to you
    database: "C4131DF23U70",           // replace with the database user provided to you
    port: 3306,
    flags: '-INTERACTIVE'
});

console.log("Attempting database connection");
dbCon.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log("Connected to database!");
});

// export the connection
exports.get = function() {
    return dbCon;
}