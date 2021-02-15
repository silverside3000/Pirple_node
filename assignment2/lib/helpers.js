/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('./config');
var crypto = require('crypto');
var https = require('https');
var querystring =  require('querystring');

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
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

//Check provided email validity
helpers.emailCheck = (email) => {
  var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if(email.match(mailformat))
    return true;
  else
    return false;
};

//Converts email to unique and acceptable file names by allowing only letters and numbers
helpers.convertEmailToValidFileName = (email) => {
  email = email.replace(/[^\w\s]/gi,'');//removes all special characters
  email = email.replace(/ /g, ''); //removes all spaces globally
  return email;
};


helpers.sendStripeOrder = function(amount, description, callback){
  // Validate parameters
  amount = typeof(amount) == 'number' && amount > 0 ? amount : false;
  description = typeof(description) == 'string' && description.trim().length > 0  ? description.trim() : false;
  if(amount && description){
    // Configure the request payload
    description = encodeURI(description);
    var payload = {
      'amount' : amount,
      'description' : description
    };
    var stringPayload = querystring.stringify(payload);


    // Configure the request details
    var requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.stripe.com',
      'method' : 'POST',
      'path' : '/v1/charges/sk_test_4eC39HqLyjWDarjtT1zdp7dc:/Idempotency-Key:32NyuniQzDYfTBUE/amount='+amount+'/currency=ngn/description='+description+'/source=tok_mastercard',
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails,function(res){
        // Grab the status of the sent request
        var status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          callback(false);
        } else {
          callback('Status code returned was '+status);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid' + amount + " " + description);
  }
};


helpers.sendMailGunEmail = function(from, to, subject, message, callback){
  // Validate parameters
  subject = typeof(from) == 'string' && from.trim().length > 0 ? from.trim() : false;
  subject = typeof(to) == 'string' && to.trim().length > 0 ? to.trim() : false;
  subject = typeof(subject) == 'string' && subject.trim().length > 0 ? subject.trim() : false;
  message = typeof(message) == 'string' && message.trim().length > 0  ? message.trim() : false;
  if(from && to && subject && message){
    // Configure the request payload
    message = encodeURI(message);
    subject = encodeURI(subject);
    var payload = {
      'from' : from,
      'to' : to,
      'subject': subject,
      'message' : message
    };
    var stringPayload = querystring.stringify(payload);


    // Configure the request details
    var requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.mailgun.net',
      'method' : 'POST',
      'path' : '/v3/sandboxdf33b79340c946b686a12756c6f2d451.mailgun.org/messages/from='+from+'/to='+to+'subject='+subject+'/text='+message,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails,function(res){
        // Grab the status of the sent request
        var status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          callback(false);
        } else {
          callback('Status code returned was '+status);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid'/* + from +" | "+ to +" | "+ subject + " | " + message */);
  }
};

// Export the module
module.exports = helpers;