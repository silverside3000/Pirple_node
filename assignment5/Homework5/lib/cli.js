/*
 * CLI-related tasks
 *
 */

 // Dependencies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');
class _events extends events{};
var e = new _events();
var os = require('os');
var v8 = require('v8');
var _data = require('./data');
var helpers = require('./helpers');

// Instantiate the cli module object
var cli = {};

// Input handlers
e.on('man',function(str){
  cli.responders.help();
});

e.on('help',function(str){
  cli.responders.help();
});

e.on('exit',function(str){
  cli.responders.exit();
});

e.on('stats',function(str){
  cli.responders.stats();
});

e.on('view items',function(str){
  cli.responders.viewItems();
});

e.on('view orders',function(str){
  cli.responders.viewOrders();
});

e.on('more order info',function(str){
  cli.responders.moreOrderInfo(str);
});

e.on('view users',function(str){
  cli.responders.viewUsers();
});

e.on('more user info',function(str){
  cli.responders.moreUserInfo(str);
});


// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = function(){

  // Codify the commands and their explanations
  var commands = {
    'exit' : 'Kill the CLI (and the rest of the application)',
    'man' : 'Show this help page',
    'help' : 'Alias of the "man" command',
    'stats' : 'Get statistics on the underlying operating system and resource utilization',
    
    'view items' : 'View all the current menu items',
    'view orders' : 'View all the recent orders in the system (orders placed in the last 24 hours)',
    'more order info --{order email id}': 'Lookup the details of a specific order by order ID',
    'view users' : 'View all the users who have signed up in the last 24 hours',
    'more user info  --{user email id}': 'Lookup the details of a specific user by email address',
  };

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively
  for(var key in commands){
     if(commands.hasOwnProperty(key)){
        var value = commands[key];
        var line = '      \x1b[33m '+key+'      \x1b[0m';
        var padding = 60 - line.length;
        for (i = 0; i < padding; i++) {
            line+=' ';
        }
        line+=value;
        console.log(line);
        cli.verticalSpace();
     }
  }
  cli.verticalSpace(1);

  // End with another horizontal line
  cli.horizontalLine();

};

// Create a vertical space
cli.verticalSpace = function(lines){
  lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
  for (i = 0; i < lines; i++) {
      console.log('');
  }
};

// Create a horizontal line across the screen
cli.horizontalLine = function(){

  // Get the available screen size
  var width = process.stdout.columns;

  // Put in enough dashes to go across the screen
  var line = '';
  for (i = 0; i < width; i++) {
      line+='-';
  }
  console.log(line);


};

// Create centered text on the screen
cli.centered = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

  // Get the available screen size
  var width = process.stdout.columns;

  // Calculate the left padding there should be
  var leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  var line = '';
  for (i = 0; i < leftPadding; i++) {
      line+=' ';
  }
  line+= str;
  console.log(line);
};

// Exit
cli.responders.exit = function(){
  process.exit(0);
};

// Stats
cli.responders.stats = function(){
  // Compile an object of stats
  var stats = {
    'Load Average' : os.loadavg().join(' '),
    'CPU Count' : os.cpus().length,
    'Free Memory' : os.freemem(),
    'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    'Uptime' : os.uptime()+' Seconds'
  };

  // Create a header for the stats
  cli.horizontalLine();
  cli.centered('SYSTEM STATISTICS');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Log out each stat
  for(var key in stats){
     if(stats.hasOwnProperty(key)){
        var value = stats[key];
        var line = '      \x1b[33m '+key+'      \x1b[0m';
        var padding = 60 - line.length;
        for (i = 0; i < padding; i++) {
            line+=' ';
        }
        line+=value;
        console.log(line);
        cli.verticalSpace();
     }
  }

  // Create a footer for the stats
  cli.verticalSpace();
  cli.horizontalLine();

};

// 1. View all the current menu items
cli.responders.viewItems = function(){
  _data.list('menu',function(err,menu_item){
    if(!err && menu_item && menu_item.length > 0){
      cli.verticalSpace();
      menu_item.forEach(function(menu){
        _data.read('menu',menu,function(err,menu_data){
          if(!err && menu_data){
            if(menu_data.id != undefined){
              var line = 'Menu ID: '+menu_data.id+' Menu Name: '+menu_data.menu_name+' Price: ' + menu_data.price;
              console.log(line);
              cli.verticalSpace();
            }
          }
        });
      });
    }
  });
};

//2. View all the recent orders in the system (orders placed in the last 24 hours)
cli.responders.viewOrders = function(){
  _data.list('order',function(err,carts){
    if(!err && carts && carts.length > 0){
      cli.verticalSpace();
      carts.forEach(function(cart){
        _data.read('order',cart,function(err,cartData){
          if(!err && cartData){
            var line = 'Order Id: ' + cartData.id + ' Name: '+cartData.email + '\nMenu Item(s)   | Quantity    |   Price \n';
            if(typeof(cartData.menu_item) == 'object'){
              var gtotal = 0;
              for(var i = 0; i < cartData.menu_item.length; i++){
                line += cartData.menu_item[i] + '     |      ' + cartData.quantity[i] + '       | ' + cartData.price[i] + '\n';
                gtotal += cartData.quantity[i] * cartData.price[i];
              }
              line += '   Grand Total:          ' + gtotal;
            }
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};

// 3. Lookup the details of a specific order by order ID
cli.responders.moreOrderInfo = function(str){
  // Get ID from string
  var arr = str.split('--');
  var email = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  
  if(email){
    // Lookup the orders
    _data.read('order',helpers.convertEmailToValidFileName(email),function(err,orderData){
      if(!err && orderData){
        // Print their JSON object with text highlighting
        cli.verticalSpace();
        console.dir(orderData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }

};

// 4. View all the users who have signed up in the last 24 hours
cli.responders.viewUsers = function(){
  _data.list('users',function(err,userIds){
    if(!err && userIds && userIds.length > 0){
      cli.verticalSpace();
      userIds.forEach(function(userId){
        _data.read('users',userId,function(err,userData){
          if(!err && userData){
            var line = 'Names: '+userData.name+' Email: '+userData.email+' Address: '+userData.street_address+' Agreed: '+userData.tosAgreement
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};

// 5. Lookup the details of a specific user by email address
cli.responders.moreUserInfo = function(str){
  // Get ID from string
  var arr = str.split('--');
  var email = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if(email){
    // Lookup the user
    _data.read('users',helpers.convertEmailToValidFileName(email),function(err,userData){
      if(!err && userData){
        // Print their JSON object with text highlighting
        cli.verticalSpace();
        console.dir(userData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }
};

// List Checks
cli.responders.listChecks = function(str){
  _data.list('checks',function(err,checkIds){
    if(!err && checkIds && checkIds.length > 0){
      cli.verticalSpace();
      checkIds.forEach(function(checkId){
        _data.read('checks',checkId,function(err,checkData){
          if(!err && checkData){
            var includeCheck = false;
            var lowerString = str.toLowerCase();
            // Get the state, default to down
            var state = typeof(checkData.state) == 'string' ? checkData.state : 'down';
            // Get the state, default to unknown
            var stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown';
            // If the user has specified that state, or hasn't specified any state
            if((lowerString.indexOf('--'+state) > -1) || (lowerString.indexOf('--down') == -1 && lowerString.indexOf('--up') == -1)){
              var line = 'ID: '+checkData.id+' '+checkData.method.toUpperCase()+' '+checkData.protocol+'://'+checkData.url+' State: '+stateOrUnknown;
              console.log(line);
              cli.verticalSpace();
            }
          }
        });
      });
    }
  });
};


// List Logs
cli.responders.listLogs = function(){
  console.log("You asked to list logs");
};

// More logs info
cli.responders.moreLogInfo = function(str){
  console.log("You asked for more log info",str);
};

// Input processor
cli.processInput = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something, otherwise ignore it
  if(str){
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',

      'view items',
      'view orders',
      'more order info',
      'view users',
      'more user info'
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    var counter = 0;
    uniqueInputs.some(function(input){
      if(str.toLowerCase().indexOf(input) > -1){
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(input,str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if(!matchFound){
      console.log("Sorry, try again");
    }

  }
};

// Init script
cli.init = function(){

  // Send to console, in dark blue
  console.log('\x1b[34m%s\x1b[0m','The CLI is running');

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', function(str){

    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on('close', function(){
    process.exit(0);
  });

};

 // Export the module
 module.exports = cli;