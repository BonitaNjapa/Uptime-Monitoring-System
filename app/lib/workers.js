let path = require("path");
let fs = require("fs");
let _data = require("./data");
let https = require("https");
let http = require("http");
let helpers = require("./helpers");
let url = require("url");

//Instantiate container
let workers = {};

// Lookup all checks, get their data, send to validator
workers.gatherAllChecks = () => {
  // Get all the checks
  _data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // Read in the check data
        _data.read("checks", check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // Pass it to the check validator, and let that function continue the function or log the error(s) as needed
            workers.validateCheckData(originalCheckData);
          } else {
            console.log("Error reading one of the check's data: ", err);
          }
        });
      });
    } else {
      console.log("Error: Could not find any checks to process");
    }
  });
};

// Sanity-check the check-data,
workers.validateCheckData = (originalCheckData) => {
  originalCheckData =
    typeof originalCheckData == "object" && originalCheckData !== null
      ? originalCheckData
      : {};
  originalCheckData.id =
    typeof originalCheckData.id == "string" &&
    originalCheckData.id.trim().length == 20
      ? originalCheckData.id.trim()
      : false;
  originalCheckData.userPhone =
    typeof originalCheckData.userPhone == "string" &&
    originalCheckData.userPhone.trim().length == 10
      ? originalCheckData.userPhone.trim()
      : false;
  originalCheckData.protocol =
    typeof originalCheckData.protocol == "string" &&
    ["http", "https"].indexOf(originalCheckData.protocol) > -1
      ? originalCheckData.protocol
      : false;
  originalCheckData.url =
    typeof originalCheckData.url == "string" &&
    originalCheckData.url.trim().length > 0
      ? originalCheckData.url.trim()
      : false;
  originalCheckData.method =
    typeof originalCheckData.method == "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(originalCheckData.method) > -1
      ? originalCheckData.method
      : false;
  originalCheckData.successCodes =
    typeof originalCheckData.successCodes == "object" &&
    originalCheckData.successCodes instanceof Array &&
    originalCheckData.successCodes.length > 0
      ? originalCheckData.successCodes
      : false;
  originalCheckData.timeoutSeconds =
    typeof originalCheckData.timeoutSeconds == "number" &&
    originalCheckData.timeoutSeconds % 1 === 0 &&
    originalCheckData.timeoutSeconds >= 1 &&
    originalCheckData.timeoutSeconds <= 5
      ? originalCheckData.timeoutSeconds
      : false;
  // Set the keys that may not be set (if the workers have never seen this check before)
  originalCheckData.state =
    typeof originalCheckData.state == "string" &&
    ["up", "down"].indexOf(originalCheckData.state) > -1
      ? originalCheckData.state
      : "down";
  originalCheckData.lastChecked =
    typeof originalCheckData.lastChecked == "number" &&
    originalCheckData.lastChecked > 0
      ? originalCheckData.lastChecked
      : false;

  // If all checks pass, pass the data along to the next step in the process
  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds
  ) {
    workers.performCheck(originalCheckData);
  } else {
    // If checks fail, log the error and fail silently
    console.log(
      "Error: one of the checks is not properly formatted. Skipping."
    );
  }
};

// Perform the check, send the originalCheck data and the outcome of the check process to the next step in the process
workers.performCheck = (originalCheckData) => {
  // Prepare the intial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };

  // Mark that the outcome has not been sent yet
  let outcomeSent = false;

  // Parse the hostname and path out of the originalCheckData
  let parsedUrl = url.parse(
    originalCheckData.protocol + "://" + originalCheckData.url,
    true
  );
  let hostName = parsedUrl.hostname;
  let path = parsedUrl.path; // Using path not pathname because we want the query string

  // Construct the request
  let requestDetails = {
    protocol: originalCheckData.protocol + ":",
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  // Instantiate the request object (using either the http or https module)
  let _moduleToUse = originalCheckData.protocol == "http" ? http : https;
  let req = _moduleToUse.request(requestDetails, (res) => {
    // Grab the status of the sent request
    let status = res.statusCode;

    // Update the checkOutcome and pass the data along
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the error event so it doesn't get thrown
  req.on("error", (e) => {
    // Update the checkOutcome and pass the data along
    checkOutcome.error = { error: true, value: e };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the timeout event
  req.on("timeout", () => {
    // Update the checkOutcome and pass the data along
    checkOutcome.error = { error: true, value: "timeout" };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // End the request
  req.end();
};

//Export Module
module.exports = workers;
