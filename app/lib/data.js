const fs = require("fs");
const path = require("path");
const userService = require("../lib/Services/userService");
const tokenService = require("../lib/Services/tokenService");
const checksService = require("../lib/Services/checksService");

var lib = {};
lib.baseDir = path.join(__dirname, "/../.data/");

lib.addNewData = (model, data, callback) => {
  if (model && data) {
    newusr;
    // switch (model) {
    //   case "user":
    //     return callback(userService.addNewUser(data));
    //   case "token":
    //     return callback(tokenService.addNewToken(data));
    //   case "check":
    //     return callback(checksService.addNewCheck(data));
    //   default:
    //     return callback("Invalid model");
    // }
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

lib.findUserByEmail = (email, callback) => {
  if (email) {
    callback(userService.findUserByEmail(email));
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

lib.create = (dir, file, data, callback) => {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        let stringData = JSON.stringify(data);
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback("Error closing file.");
              }
            });
          } else {
            callback("Error writing to file");
          }
        });
      } else {
        callback("Couldnt create file, file already exists");
      }
    }
  );
};

lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf-8",
    (err, data) => {
      callback(err, data);
    }
  );
};

lib.update = (dir, file, data, callback) => {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        let stringData = JSON.stringify(data);
        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Error closing existing file");
                  }
                });
              }
            });
          } else {
            callback("Error truncating file!");
            console.log(err);
          }
        });
      }
    }
  );
};

lib.delete = (dir, file, callback) => {
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting this file");
    }
  });
};

module.exports = lib;
