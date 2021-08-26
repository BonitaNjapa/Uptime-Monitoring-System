const crypto = require("crypto");
const config = require("./config");
const querystring = require("querystring");
const https = require("https");
let helpers = {};

helpers.hash = (str) => {
  if (typeof str == "string" && str.length > 0) {
    let hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");

    return hash;
  }
};

helpers.parseJsonToObject = (str) => {
  try {
    let obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

    // Start the final string
    let str = "";
    for (i = 1; i <= strLength; i++) {
      // Get a random charactert from the possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      // Append this character to the string
      str += randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

helpers.sendTwilioSms = (phone, msg, callback) => {
  // Validate parameters
  phone =
    typeof phone == "string" && phone.trim().length == 9 ? phone.trim() : false;
  msg =
    typeof msg == "string" && msg.trim().length > 0 && msg.trim().length <= 1600
      ? msg.trim()
      : false;
  if (phone && msg) {
    // Configure the request payload
    let payload = {
      From: config.twilio.fromPhone,
      To: "+27" + phone,
      Body: msg,
    };
    let stringPayload = querystring.stringify(payload);

    // Configure the request details
    let requestDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path:
        "/2010-04-01/Accounts/" + config.twilio.accountSid + "/Messages.json",
      auth: config.twilio.accountSid + ":" + config.twilio.authToken,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload),
      },
    };

    // Instantiate the request object
    let req = https
      .request(requestDetails, (res) => {
        // Grab the status of the sent request
        let status = res.statusCode;
        // Callback successfully if the request went through
        if (status == 200 || status == 201) {
          callback(false);
        } else {
          callback("Status code returned was " + status);
        }
      })
      .on("error", (e) => {
        callback(e);
      });

    // Bind to the error event so it doesn't get thrown
    // req.on("error", (e) => {
    //   callback(e);
    // });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();
  } else {
    callback("Given parameters were missing or invalid");
  }
};

module.exports = helpers;
