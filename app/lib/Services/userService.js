const Datastore = require("nedb");

const { baseDir } = require("./dbService");

let lib = {};
lib.users = new Datastore({
  filename: baseDir + "users.db",
  autoload: true,
});
lib.users.loadDatabase();

lib.addNewUser = (user, callback) => {
  lib.users.insert(user, (err, newDoc) => {
    // if (err) {
    //   callback(500, { error: err });
    // } else {
    //   if (callback) callback(200, newDoc);
    // }
  });
};

lib.findUserByEmail = (user, callback) => {
  lib.users.find({ email: user.email }, (err, doc) => {
    if (err) {
      callback(500, { error: err });
    } else {
      if (callback) callback(doc);
    }
  });
};

lib.findUserById = (user) => {
  lib.users.find({ _id: user._id }, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      callback(doc);
    }
  });
};

module.exports = lib;
