var server = require('./lib/server');
var cli = require('./lib/cli');

var  app = {};

app.init = () => {
    server.init();

    setTimeout(function(){
        cli.init();
    }, 50);
    
}

app.init();

module.exports = app;