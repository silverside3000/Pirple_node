var server = require('./server');
var cluster = require('cluster');
var os = require('os');

var app = {};

app.init = () => {
	if(cluster.isMaster){
    for(var i = 0; i < os.cpus().length; i++)
		  cluster.fork();
  }	
  else
    server.init();
}
app.init();
module.exports = app;