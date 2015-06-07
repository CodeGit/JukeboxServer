'use strict';

/**
 * Module dependencies.
 */

require('rootpath')();

var DEFAULT_CONFIG_FILE = "config/default.json";

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , config = require('lib/config');

var program = require("commander");
program.version("0.0.1")
	.option('-p, --port <port>', "server will listen on this port", parseInt)
	.option('-c, --config <file>', "server config file")
	.option('-i, --itunes <file>', "itunes library xml file");

program.parse(process.argv);

config.loadConfig(program.config || DEFAULT_CONFIG_FILE);

var db = require("lib/musicDatabase");
db.initialise();

var scanner = require("lib/musicScanner");
var directories = program.args.slice(2);
if (directories.length > 0) {
	scanner.scan(directories);
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
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
