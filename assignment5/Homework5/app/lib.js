// Container for all the methods
var lib = {};

lib.greet = (name) => {
    return 'Hi, ' + name;
}

lib.add = (num1, num2) => {
    return num1 + num2;
}

lib.isPalindrome = (word) => {
    var rword = "";
    for(var i = word.length-1; i >0; i--){
        rword += word[i];
    }
    return rword == word ? true : false;
}

lib.generateRandomNumbers = () => {
    var possibleCharacters = '0123456789';
    var str = '';
    for(i = 1; i <= 10; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    return str;
}

// Export the module
module.exports = lib;