'use strict';

/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var program = require("commander");
program.version("0.0.1")
.option('-p, --port <port>', "server will listen on this port", parseInt)
.option('-c, --config <file>', "server config file")
.option('-i, --itunes <file>', "itunes library xml file");

program.parse(process.argv);

if (program.args.length > 0) {
	console.log("Processing directories");
}

if (program.itunes !== undefined) {
	console.log("Processing itunes xml");
}

var app = express();

// all environments
app.set('port', program.port || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
