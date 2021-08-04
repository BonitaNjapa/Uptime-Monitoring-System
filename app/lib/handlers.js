const _data = require("./data");
const helpers = require("./helpers");
var config = require("./config");
const Datastore = require("nedb");

const { baseDir } = require("../lib/Services/dbService");

let lib = {};
db = {};
db.users = new Datastore("/lib..users.db");

// You need to load each database (here we do it asynchronously)
db.users.loadDatabase();
db.robots.loadDatabase();
const handlers = {};
handlers.users = (data, callback) => {
  const allowMethods = ["GET", "POST", "PUT", "DELETE"];

  if (allowMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};
handlers._users.POST = (data, callback) => {
  let name =
    typeof data.payload.firstname == "string" &&
    data.payload.firstname.trim().length > 0
      ? data.payload.firstname
      : false;
  let lname =
    typeof data.payload.lastname == "string" &&
    data.payload.lastname.trim().length > 0
      ? data.payload.lastname
      : false;
  let phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;
  let password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 1
      ? data.payload.password
      : false;
  let tosAgreement =
    typeof data.payload.tosAgreement == "boolean" ? true : false;
  let email = typeof data.payload.email == "string" ? true : false;
  console.log(name);
  if (name && lname && phone && password && tosAgreement && email) {
    // _data.findUserByEmail(email, (err) => {
    //   if (!err) {
    let hashedPwd = helpers.hash(password);
    if (hashedPwd) {
      let newusr = {
        firstname: name,
        lastname: lname,
        email: email,
        phone: phone,
        hashedPassword: hashedPwd,
        tosAgreement: true,
      };

      //  }
    } else {
    }
    //});
  } else {
  }
};

handlers._users.GET = (data, callback) => {
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        // let sdata =  JSON.parse(data)
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

handlers._users.PUT = (data, callback) => {
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;

  // Check for optional fields
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      _data.read("users", phone, (err, userData) => {
        if (!err && userData) {
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }

          _data.update("users", phone, userData, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not update the user." });
            }
          });
        } else {
          callback(400, { Error: "Specified user does not exist." });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update." });
    }
  } else {
    callback(400, { Error: "Missing required field." });
  }
};

handlers._users.DELETE = (data, callback) => {
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // Lookup the user
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        _data.delete("users", phone, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the specified user" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified user." });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

handlers.sample = (data, callback) => {
  callback(200, { name: "sample handler" });
};

handlers.ping = (data, callback) => {
  lib.users.insert(data.payload, (err, newDoc) => {
    if (err) {
      console.log(err);
    }
  });
};

handlers.notFound = (data, callback) => {
  callback(404);
};

handlers.tokens = (data, callback) => {
  const allowMethods = ["GET", "POST", "PUT", "DELETE"];
  if (allowMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};
handlers._tokens = {};

handlers._tokens.POST = (data, callback) => {
  let phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;
  let password =
    typeof data.payload.phone == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password
      : false;

  if (phone && password) {
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        let hashedPassword = helpers.hash(password);

        if (
          hashedPassword == helpers.parseJsonToObject(userData).hashedPassword
        ) {
          //create token object
          let tokenId = helpers.createRandomString(20);
          let expire = Date.now() + 1000 * 60 * 120;

          let token = {
            phone: phone,
            id: tokenId,
            expires: expire,
          };
          _data.create("tokens", tokenId, token, (err) => {
            if (!err) {
              callback(200, token);
            } else {
              callback(500, { Error: "Couldn't generate new token." });
            }
          });
        } else {
          callback(400, {
            Error:
              "Password did not match the specified user's stored password.",
          });
        }
      } else {
        callback(400, { Error: "Cannot find specified user." });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields to perform operation." });
  }
};

handlers._tokens.GET = (data, callback) => {
  let id =
    typeof data.queryStringObject.token == "string" &&
    data.queryStringObject.token.trim().length == 20
      ? data.queryStringObject.token
      : false;
  if (id) {
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, helpers.parseJsonToObject(tokenData));
      } else {
        callback(404);
      }
    });
  } else {
    allback(400, { Error: "Missing required field, or field invalid" });
  }
};

handlers._tokens.PUT = (data, callback) => {
  let id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  let extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;
  if (id && extend) {
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        if (helpers.parseJsonToObject(tokenData).expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          _data.update(
            "tokens",
            id,
            helpers.parseJsonToObject(tokenData),
            (err) => {
              if (!err) {
                callback(200, helpers.parseJsonToObject(tokenData));
              } else {
                callback(500, {
                  Error: "Could not update the token's expiration.",
                });
              }
            }
          );
        } else {
          callback(400, {
            Error: "The token has already expired, and cannot be extended.",
          });
        }
      } else {
        callback(400, { Error: "Specified user does not exist." });
      }
    });
  } else {
    callback(400, {
      Error: "Missing required field(s) or field(s) are invalid.",
    });
  }
};
handlers._tokens.DELETE = (data, callback) => {
  // Check that id is valid
  let id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // Delete the token
        _data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the specified token" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token." });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

handlers.checks = (data, callback) => {
  const allowMethods = ["GET", "POST", "PUT", "DELETE"];
  if (allowMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};
handlers._checks = {};

handlers._checks.POST = (data, callback) => {
  // Validate inputs
  let protocol =
    typeof data.payload.protocol == "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  let url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  let method =
    typeof data.payload.method == "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  let successCodes =
    typeof data.payload.successCodes == "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  let timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Get token from headers
    let token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // Lookup the user phone by reading the token
    _data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        let userPhone = helpers.parseJsonToObject(tokenData).phone;

        // Lookup the user data
        _data.read("users", userPhone, (err, userDataCb) => {
          if (!err && userDataCb) {
            let userData = helpers.parseJsonToObject(userDataCb);
            let userChecks =
              typeof userData.checks == "object" &&
              userData.checks instanceof Array
                ? userData.checks
                : [];
            // Verify that user has less than the number of max-checks per user
            if (userChecks.length < config.maxChecks) {
              // Create random id for check
              let checkId = helpers.createRandomString(20);

              // Create check object including userPhone
              let checkObject = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCodes: successCodes,
                timeoutSeconds: timeoutSeconds,
              };

              // Save the object
              _data.create("checks", checkId, checkObject, (err) => {
                if (!err) {
                  // Add check id to the user's object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);
                  _data.update("users", userPhone, userData, (err) => {
                    if (!err) {
                      callback(200, checkObject);
                    } else {
                      callback(500, {
                        Error: "Could not update the user with the new check.",
                      });
                    }
                  });
                } else {
                  callback(500, { Error: "Could not create the new check" });
                }
              });
            } else {
              callback(400, {
                Error:
                  "The user already has the maximum number of checks (" +
                  config.maxChecks +
                  ").",
              });
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, { Error: "Missing required inputs, or inputs are invalid" });
  }
};

handlers._checks.GET = (data, callback) => {
  let id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    _data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        let token =
          typeof data.headers.token == "string" ? data.headers.token : false;
        console.log("This is check data", checkData);
        handlers._tokens.verifyToken(
          token,
          helpers.parseJsonToObject(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, helpers.parseJsonToObject(checkData));
            } else {
              callback(403);
            }
          }
        );
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field, or field invalid" });
  }
};

handlers._checks.PUT = (data, callback) => {
  // Check for required field
  let id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;

  // Check for optional fields
  let protocol =
    typeof data.payload.protocol == "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  let url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  let method =
    typeof data.payload.method == "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  let successCodes =
    typeof data.payload.successCodes == "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  let timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;
  // Error if id is invalid
  if (id) {
    // Error if nothing is sent to update
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // Lookup the check
      _data.read("checks", id, (err, checkData1) => {
        let checkData = helpers.parseJsonToObject(checkData1);
        if (!err && checkData) {
          // Get the token that sent the request
          let token =
            typeof data.headers.token == "string" ? data.headers.token : false;
          // Verify that the given token is valid and belongs to the user who created the check
          handlers._tokens.verifyToken(
            token,
            checkData.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                // Update check data where necessary
                if (protocol) {
                  checkData.protocol = protocol;
                }
                if (url) {
                  checkData.url = url;
                }
                if (method) {
                  checkData.method = method;
                }
                if (successCodes) {
                  checkData.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkData.timeoutSeconds = timeoutSeconds;
                }

                // Store the new updates
                _data.update("checks", id, checkData, (err) => {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, { Error: "Could not update the check." });
                  }
                });
              } else {
                callback(403);
              }
            }
          );
        } else {
          callback(400, { Error: "Check ID did not exist." });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update." });
    }
  } else {
    callback(400, { Error: "Missing required field." });
  }
};

handlers._checks.DELETE = (data, callback) => {
  // Check that id is valid
  let id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the check
    _data.read("checks", id, (err, checkData1) => {
      let checkData = helpers.parseJsonToObject(checkData1);
      if (!err && checkData) {
        // Get the token that sent the request
        let token =
          typeof data.headers.token == "string" ? data.headers.token : false;
        // Verify that the given token is valid and belongs to the user who created the check
        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // Delete the check data
              _data.delete("checks", id, (err) => {
                if (!err) {
                  // Lookup the user's object to get all their checks
                  _data.read("users", checkData.userPhone, (err, userData1) => {
                    let userData = helpers.parseJsonToObject(userData1);
                    if (!err) {
                      let userChecks =
                        typeof userData.checks == "object" &&
                        userData.checks instanceof Array
                          ? userData.checks
                          : [];
                      console.log(userChecks);

                      // Remove the deleted check from their list of checks
                      let checkPosition = userChecks.indexOf(id);
                      console.log(checkPosition);

                      if (checkPosition > -1) {
                        userChecks.splice(checkPosition, 1);
                        // Re-save the user's data
                        userData.checks = userChecks;
                        _data.update(
                          "users",
                          checkData.userPhone,
                          userData,
                          (err) => {
                            if (!err) {
                              callback(200);
                            } else {
                              callback(500, {
                                Error: "Could not update the user.",
                              });
                            }
                          }
                        );
                      } else {
                        callback(500, {
                          Error:
                            "Could not find the check on the user's object, so could not remove it.",
                        });
                      }
                    } else {
                      callback(500, {
                        Error:
                          "Could not find the user who created the check, so could not remove the check from the list of checks on their user object.",
                      });
                    }
                  });
                } else {
                  callback(500, { Error: "Could not delete the check data." });
                }
              });
            } else {
              callback(403);
            }
          }
        );
      } else {
        callback(400, { Error: "The check ID specified could not be found" });
      }
    });
  } else {
    callback(400, { Error: "Missing valid id" });
  }
};

handlers._tokens.verifyToken = (id, phone, callback) => {
  _data.read("tokens", id, (err, tokenDataparam) => {
    let tokenData = helpers.parseJsonToObject(tokenDataparam);
    if (!err && tokenData) {
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handlers;
