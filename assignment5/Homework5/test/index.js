/*
 * Test runner
 *
 */

// Dependencies
var lib = require('./../app/lib.js');
var assert = require('assert');

// Application logic for the test runner
_app = {};

// Holder of all tests
_app.tests = {
  'unit' : {}
};

// Assert that the lib.greet function is string
_app.tests.unit['lib.greet should greeting with a passed value'] = function(done){
    var val = lib.greet('Emmanuel');
    assert.equal(typeof(val), 'string');
    done();
  };
  
  
  // Assert that the greet function is greets with a parameter passed to it
  _app.tests.unit['lib.greet should return 1'] = function(done){
    var val = lib.greet('Emmanuel');
    assert.equal(val, 'Hi, '+'Emmanuel');
    done();
  };
  
  // Assert that the lib.greet function will return nothing
  _app.tests.unit['helpers.getNumberOne should return empty string'] = function(done){
    var val = lib.greet('Emmanuel');
    assert.equal(val, '');
    done();
  };


  // Assert that the add function is sums up the parameters passed to it
  _app.tests.unit['lib.add should greeting with a passed value'] = function(done){
    var val = lib.add(5, 10);
    assert.equal(typeof(val), 'number');
    done();
  };
  
  
  // Assert that the lib.add function will return number
  _app.tests.unit['lib.add should return the sum of parameters passed to it'] = function(done){
    var val = lib.add(5, 10);
    assert.equal(val, 15);
    done();
  };


    // Assert that the isPalindrome function returns a string value
_app.tests.unit['lib.add should greeting with a passed value'] = function(done){
    var val = lib.isPalindrome('bankai');
    assert.equal(typeof(val), 'string');
    done();
  };
  
  
  // Assert that the lib.add function will return number
  _app.tests.unit['lib.add should return the sum of parameters passed to it'] = function(done){
    var val = lib.isPalindrome('civic');
    assert.equal(val, 'civic');
    done();
  };


// Assert that the generateRandomNumbers function returns random integer value
_app.tests.unit['lib.generateRandomNumbers should greeting with a passed value'] = function(done){
    var val = lib.generateRandomNumbers();
    assert.equal(typeof(val), 'number');
    done();
  };

// Count all the tests
_app.countTests = function(){
  var counter = 0;
  for(var key in _app.tests){
     if(_app.tests.hasOwnProperty(key)){
       var subTests = _app.tests[key];
       for(var testName in subTests){
          if(subTests.hasOwnProperty(testName)){
            counter++;
          }
       }
     }
  }
  return counter;
};

// Run all the tests, collecting the errors and successes
_app.runTests = function(){
  var errors = [];
  var successes = 0;
  var limit = _app.countTests();
  var counter = 0;
  for(var key in _app.tests){
     if(_app.tests.hasOwnProperty(key)){
       var subTests = _app.tests[key];
       for(var testName in subTests){
          if(subTests.hasOwnProperty(testName)){
            (function(){
              var tmpTestName = testName;
              var testValue = subTests[testName];
              // Call the test
              try{
                testValue(function(){
                  // If it calls back without throwing, then it succeeded, so log it in green
                  console.log('\x1b[32m%s\x1b[0m',tmpTestName);
                  counter++;
                  successes++;
                  if(counter == limit){
                    _app.produceTestReport(limit,successes,errors);
                  }
                });
              } catch(e){
                // If it throws, then it failed, so capture the error thrown and log it in red
                errors.push({
                  'name' : testName,
                  'error' : e
                });
                console.log('\x1b[31m%s\x1b[0m',tmpTestName);
                counter++;
                if(counter == limit){
                  _app.produceTestReport(limit,successes,errors);
                }
              }
            })();
          }
       }
     }
  }
};

// Product a test outcome report
_app.produceTestReport = function(limit,successes,errors){
  console.log("");
  console.log("--------BEGIN TEST REPORT--------");
  console.log("");
  console.log("Total Tests: ",limit);
  console.log("Pass: ",successes);
  console.log("Fail: ",errors.length);
  console.log("");

  // If there are errors, print them in detail
  if(errors.length > 0){
    console.log("--------BEGIN ERROR DETAILS--------");
    console.log("");
    errors.forEach(function(testError){
      console.log('\x1b[31m%s\x1b[0m',testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------END ERROR DETAILS--------");
  }


  console.log("");
  console.log("--------END TEST REPORT--------");

};
// Run the tests
_app.runTests();