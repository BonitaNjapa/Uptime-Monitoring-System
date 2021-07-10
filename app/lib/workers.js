let path = require('path');
let fs = require('fs');
let _data = require('./data');
let https = require('https');
let http = require('http');
let helpers = require('./helpers');
let url = require('url');


//Instantiate container
let workers = {};

// Lookup all checks, get their data, send to validator
workers.gatherAllChecks = () => {
    // Get all the checks
    _data.list('checks',(err,checks) => {
      if(!err && checks && checks.length > 0){
        checks.forEach((check) => {
          // Read in the check data
          _data.read('checks',check,(err,originalCheckData) => {
            if(!err && originalCheckData){
              // Pass it to the check validator, and let that function continue the function or log the error(s) as needed
              workers.validateCheckData(originalCheckData);
            } else {
              console.log("Error reading one of the check's data: ",err);
            }
          });
        });
      } else {
        console.log('Error: Could not find any checks to process');
      }
    });
  };


//Export Module
module.exports = workers;