'use strict';

/**
 * Module dependencies.
 */

require('rootpath')();

var DEFAULT_CONFIG_FILE = "config/default.json";

var express = require('express')
  , routes = require('./routes')
  , cookieParser = require('cookie-parser')
  , cookieSession = require('cookie-session')
  , formidable = require("formidable")
  , methodOverride = require("method-override")
  , favicon = require("serve-favicon")
  , logger = require("morgan")
  , errorHandler = require("errorhandler")
  , path = require('path')
  , fs = require('fs')
  , config = require('lib/config')
  , user = require('./routes/user')
  , music = require("lib/music/musicRoutes")
  , db = require("lib/database");

var app = express();
module.exports = app;

var program = require("commander");
program.version("0.0.1")
	.usage("node app.js <music-dir(s)>")
	.option('-p, --port <port>', "server will listen on this port", parseInt)
	.option('-c, --config <file>', "server config file")
//	.option('-i, --itunes <file>', "itunes library xml file")
	.option('-m, --m3u <file>', "a comma separated list of m3u playlists")
	.option('-d, --directory <dir>', "directory of m3u playlists")
	.option('-v, --development <y/n>', "run in dev mode for more output");

/*
var readItunes = function(itunes) {
	if (itunes !== undefined) {
		console.log("Reading itunes");
		var itunesReader = require("lib/utils/playlistsFromItunes");
		itunesReader.createPlaylists(itunes);
	}
};
*/

var readPlaylists = function(dir, playlistsString, callback) {
	var playlistReader = require("lib/utils/playlistsFromM3u");
	if (dir == null && playlistsString == null){
		callback();
	} 
	if (dir !== undefined) {
		playlistReader.readPlaylistDirectory(dir, callback);
	}
	if (playlistsString !== undefined) {
		var playlists = playlistsString.split(",");
		playlistReader.readPlaylists(playlists, callback);
	}
};

var startServer = function() {
	console.log("Starting server");
	
	// all environments
	app.set('port', program.port || 3000);
	app.set('view engine', "jade");
	
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(favicon(config.settings.favicon));
	app.use(logger('dev'));
	//app.use(formidable());
	app.use(cookieParser());
	app.use(cookieSession({secret:'jukebox'}));
	app.use(methodOverride());
	app.use(express.static(path.join(__dirname, 'public')));

	// development only
	//if ('development' === app.get('env') || program.development === "y") {
	  app.use(errorHandler());
	//}

	app.get('/', routes.index);
	app.get('/users', user.list);
	app.use('/music', music);

	var server = app.listen(app.get('port'), function() {
		console.log('Express server listening on port ' + app.get('port'));
	});
};

//initialisation
program.parse(process.argv);

config.loadConfig(program.config || DEFAULT_CONFIG_FILE);

db.initialise();

var scanner = require("lib/utils/musicScanner");
if (program.args.length > 0) {
	scanner.scanDirectories(program.args, function() {
		console.log("Finished directory scan");
		//readItunes(program.itunes);
		readPlaylists(program.directory, program.m3u, startServer);
	});
} else {
	//readItunes(program.itunes);
	readPlaylists(program.directory, program.m3u, startServer);
}



