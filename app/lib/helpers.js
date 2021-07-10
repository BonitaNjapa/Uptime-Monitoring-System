const crypto = require('crypto');
const config = require('./config');


let helpers = {};


helpers.hash = (str) => {
    if (typeof (str) == 'string' && str.length > 0) {

        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');

        return hash;
    }
};

helpers.parseJsonToObject = (str) => {
    try{
      let obj = JSON.parse(str);
      return obj;
    } catch(e){
      return {};
    }
  };

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};



module.exports = helpers;