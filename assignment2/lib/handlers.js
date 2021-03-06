/*
 * Request Handlers
 *
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

// Define all the handlers
var handlers = {};

// Users
handlers.users = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the users methods
handlers._users  = {};

// Users - post
// Required data: name, email address, and street address, tosAgreement
// Optional data: none
handlers._users.post = function(data,callback){
  // Check that all required fields are filled out
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var street_address = typeof(data.payload.street_address) == 'string' && data.payload.street_address.trim().length > 0 ? data.payload.street_address.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(name && email && street_address && tosAgreement){
    // Make sure the user doesnt already exist
    _data.read('users', helpers.convertEmailToValidFileName(email),function(err,data){
      if(err){

          var userObject = {
            'name' : name,
            'email' : email,
            'street_address' : street_address,
            'tosAgreement' : true
          };

          // Store the user
          _data.create('users', helpers.convertEmailToValidFileName(email),userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });

      } else {
        // User alread exists
        callback(400,{'Error' : 'A user with that email already exists'});
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields: ' });
  }

};

// Required data: email
// Optional data: none
handlers._users.get = function(data,callback){
  // Check that email is valid
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 5 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email
    handlers._tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user by email
        _data.read('users',helpers.convertEmailToValidFileName(email),function(err,data){
          if(!err && data){
            //no need to see agreement
            delete data.tosAgreement;
            callback(200,data);
          } else {
            callback(404);//not found
          }
        });        
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid." + token})
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

// Required data: email
// Optional data: name, street address (at least one must be specified)
handlers._users.put = function(data,callback){
  // Check for required field
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  // Check for optional fields
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  var street_address = typeof(data.payload.street_address) == 'string' && data.payload.street_address.trim().length > 0 ? data.payload.street_address.trim() : false;


  // Error if email is invalid
  if(email){
    // Error if nothing is sent to update
    if(name || street_address){
      // Get token from headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
      // Verify that the given token is valid for the email
      handlers._tokens.verifyToken(token,email,function(tokenIsValid){
        if(tokenIsValid){
          // Lookup the user
          _data.read('users',helpers.convertEmailToValidFileName(email),function(err,userData){
            if(!err && userData){
              // Update the fields if necessary
              if(name){
                userData.name = name;
              }
              if(street_address){
                userData.street_address = street_address;
              }
              // Store the new updates
              _data.update('users',helpers.convertEmailToValidFileName(email),userData,function(err){
                if(!err){
                  callback(200);
                } else {
                  console.log(err);
                  callback(500,{'Error' : 'Could not update the user.'});
                }
              });
            } else {
              callback(400,{'Error' : 'Specified user does not exist.'});
            }
          });          
        } else {
          callback(403,{"Error" : "Missing required token in header, or token is invalid."})
        }
      });      
    } else {
      callback(400,{'Error' : 'Missing fields to update.'});
    }
  } else {
    callback(400,{'Error' : 'Missing required field.' });
  }

};

// Required data: email
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
handlers._users.delete = function(data,callback){
  // Check that email is valid
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 5 ? data.queryStringObject.email.trim() : false;

  if(email){
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email
    handlers._tokens.verifyToken(token, email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user
        _data.read('users',helpers.convertEmailToValidFileName(email),function(err,data){
          if(!err && data){
            _data.delete('users',helpers.convertEmailToValidFileName(email),function(err){
              if(!err){
                callback(200);
              } else {
                callback(500,{'Error' : 'Could not delete the specified user, but it most likely deleted'});
              }
            });
          } else {
            callback(400,{'Error' : 'Could not find the specified user.' });
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  ------------------------------------------------ Token begins ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/

// Tokens
handlers.tokens = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._tokens[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens  = {};

// Tokens - post
// Required data: name, email
// Optional data: none
handlers._tokens.post = function(data,callback){
  
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  
  if(name && email){
    // Lookup the user who matches that email address
    _data.read('users',helpers.convertEmailToValidFileName(email),function(err,userData){
      if(!err && userData){
        // if the name supplied is same as name on the user file 
        if(name == userData.name){
          // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'email' : email,
            'id' : tokenId,
            'expires' : expires
          };

          // Store the token
          _data.create('tokens',tokenId,tokenObject,function(err){
            if(!err){
              callback(200,tokenObject);
            } else {
              callback(500,{'Error' : 'Could not create the new token'});
            }
          });
        } else {
          callback(400,{'Error' : 'Name did not match the specified user\'s stored name '});
        }
      } else {
        callback(400,{'Error' : 'Could not find the specified user.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field(s).' + name + " | " + email})
  }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function(data,callback){
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        callback(200,tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field, or field invalid'})
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function(data,callback){
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if(id && extend){
    // Lookup the existing token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        // Check to make sure the token isn't already expired
        if(tokenData.expires > Date.now()){
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Store the new updates
          _data.update('tokens',id,tokenData,function(err){
            if(!err){
              callback(200);
            } else {
              callback(500,{'Error' : 'Could not update the token\'s expiration.'});
            }
          });
        } else {
          callback(400,{"Error" : "The token has already expired, and cannot be extended."});
        }
      } else {
        callback(400,{'Error' : 'Specified user does not exist.'});
      }
    });
  } else {
    callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
  }
};


// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data,callback){
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        // Delete the token
        _data.delete('tokens',id,function(err){
          if(!err){
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified token, But it most likely deleted'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified token.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id,email,callback){
  // Lookup the token
  _data.read('tokens',id,function(err,tokenData){
    if(!err && tokenData){
      // Check that the token is for the given user and has not expired
      if(tokenData.email == email && tokenData.expires > Date.now()){
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Token ends ------------------------------------------------------------------------------------------ **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/


/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Logout Begins --------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
// Logout
handlers.logout = function(data,callback){
  var acceptableMethods = ['delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._logout[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._logout  = {};

// Logout - token deletes
// Required data: id
// Optional data: none
//Does thesame thing as handlers._tokens.delete function, just a change in nomencleture
handlers._logout.delete = function(data,callback){
//handlers._logout.delete = function(data,callback){
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        // Delete the token
        _data.delete('tokens',id,function(err){
          if(!err){
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified token, But it most likely deleted'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified token.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Logout ends ----------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/


/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Menu Begins ----------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/

// Menu
handlers.menu = function(data,callback){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._menu[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the menu methods
handlers._menu  = {};

// Required data: none
// Optional data: none
handlers._menu.get = function(data,callback){
  // Check that email is valid
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 5 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email
    handlers._tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the menu list
          _data.read('menu','menu_list',function(err,data){
          if(!err && data){
            callback(200,data);
          } else {
            callback(404);//not found
          }
        });        
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid." + token})
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Menu ends ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/


/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Cart Begins ----------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/

// Cart
handlers.cart = function(data,callback){
  var acceptableMethods = ['post'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._cart[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the cart method(s)
handlers._cart  = {};

// Users - post
// Required data: name, email address, and menu_item, menu_item_quantity
// Optional data: none
handlers._cart.post = function(data,callback){
  // Check that all required fields are filled out
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var menu_item = typeof(data.payload.menu_item) == 'string' && data.payload.menu_item.trim().length > 0 ? data.payload.menu_item.trim() : false;
  var menu_item_quantity = typeof(data.payload.menu_item_quantity) == 'string' && data.payload.menu_item_quantity.trim().length > 0 ? data.payload.menu_item_quantity.trim() : false;
  //var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(email && menu_item && menu_item_quantity){
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, email,function(tokenIsValid){
          if(tokenIsValid){

            // check if user already has an existing cart
            _data.read('cart', helpers.convertEmailToValidFileName(email),function(err,cart_data){
              if(err){
                //Check if menu item exists
                _data.read('menu', helpers.convertEmailToValidFileName(menu_item),function(err,menu_data){
                  if(err){
                    console.log(err);
                    callback(500,{'Error' : 'Invalid menu item selected'});
                  }else {
                    var cartObject = {
                      'email' : email,
                      'menu_item' : [menu_item],
                      'quantity' :  [menu_item_quantity],
                      'menu_item' : [menu_item],
                      'price' : [menu_data.price]
                    };

                    // Store the new menu item in cart
                    _data.create('cart', helpers.convertEmailToValidFileName(email),cartObject,function(err){
                      if(!err){
                        callback(200);
                      } else {
                        console.log(err);
                        callback(500,{'Error' : 'Could not create menu item in cart'});
                      }
                    });
                  }
                });/**/
                  
                 
              } else {
                _data.read('menu', helpers.convertEmailToValidFileName(menu_item),function(err,menu_data){
                  if(err){
                    console.log(err);
                    callback(500,{'Error' : 'Invalid menu item selected'});
                  }else {
                    // User Menu in cart already exists so add more menu item
                    var menu_item_list = typeof(cart_data.menu_item) == 'object' && cart_data.menu_item instanceof Array ? cart_data.menu_item : [];
                    cart_data.menu_item = menu_item_list;
                    cart_data.menu_item.push(menu_item);
                    
                    //update quantity count
                    var menu_item_list_quantity = typeof(cart_data.quantity) == 'object' && cart_data.quantity instanceof Array ? cart_data.quantity : [];
                    cart_data.quantity = menu_item_list_quantity;
                    cart_data.quantity.push(menu_item_quantity);

                    //update selected menu item price
                    var menu_item_list_price = typeof(cart_data.price) == 'object' && cart_data.price instanceof Array ? cart_data.price : [];
                    cart_data.price = menu_item_list_price;
                    cart_data.price.push(menu_data.price);

                    // Append new menu item to menu items
                    //_data.update('cart',helpers.convertEmailToValidFileName(email),cart_data,function(err){
                    _data.update('cart',helpers.convertEmailToValidFileName(email),cart_data,function(err){
                      if(!err){
                        // Return the data about the new check
                        callback(200);
                      } else {
                        callback(500,{'Error' : 'Could not update cart with new menu item.'});
                      }
                    });
                  }
                });
              };
            });  
          } else {
            callback(403,{"Error" : "Missing required token in header, or token is invalid." + token});
          }
        });

  } else {
    callback(400,{'Error' : 'Missing required fields: ' + menu_item_quantity });
  }

};

/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Cart ends ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/


/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Order Begins ---------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/

// Menu
handlers.orders = function(data,callback){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._orders[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the order methods
handlers._orders  = {};

// Required data: none
// Optional data: none
handlers._orders.get = function(data,callback){
  // Check that email is valid
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 5 ? data.queryStringObject.email.trim() : false;
  var send_email = typeof(data.payload.send_email) == 'boolean' && data.payload.send_email == true ? true : false;
  if(email){
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email
    handlers._tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the cart list
          _data.read('cart',helpers.convertEmailToValidFileName(email),function(err,cart_data){
          if(!err && cart_data){
            var order_msg = cart_data.email + "\n";
            var total = 0;
            order_msg += "Menu Item (quantity) -------------------------------------------------price\n";
            for(var i = 0; i < cart_data.menu_item.length; i++){
              total += cart_data.quantity[i] * cart_data.price[i];
              order_msg += cart_data.menu_item[i] + ' (' + cart_data.quantity[i] +')' + "--------------------" +
                                  (cart_data.quantity[i] * cart_data.price[i] ) + "\n";
            }
            order_msg += "Total ------------------------------------------------- =N= " + total + "\n";/**/
            //console.log(order_msg);

            //sending order through stripe.com
            helpers.sendStripeOrder(total, order_msg, (err) =>{
              console.log('stripe.com error code: ' + err);

              //sending email if the parameter was set to true
              if(send_email){
                console.log('Sending email to: ' + cart_data.email);
                helpers.sendMailGunEmail(cart_data.email, "silverside3000@gmail.com", 'your pizza order details', order_msg, (err) =>{
                  console.log('Mail gun error code: ' + err);
                });
              }

            });
            
            callback(200);
                        
          } else {
            callback(404);//not found
          }
        });        
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid." + token})
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- Order ends ------------------------------------------------------------------------------------------ **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/
/**  --------------------------------------------------- --------- ------------------------------------------------------------------------------------------- **/


// Ping handler
handlers.ping = function(data,callback){
  callback(200);
};

// Not-Found handler
handlers.notFound = function(data,callback){
callback(404);
};

// Export the handlers
module.exports = handlers;