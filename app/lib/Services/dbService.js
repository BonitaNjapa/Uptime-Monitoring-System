const path = require("path");

var lib = {};

lib.baseDir = path.join(__dirname, "/.data/");

// db = {};

// db.checks = new Datastore({
//   filename: lib.baseDir + "checks.db",
//   autoload: true,
// });

// db.tokens = new Datastore({
//   filename: lib.baseDir + "tokens.db",
//   autoload: true,
// });
// You need to load each database (here we do it asynchronously)

// db.checks.loadDatabase();
// db.tokens.loadDatabase();

// module.exports = db;
module.exports = lib;
