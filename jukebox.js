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
  , fs = require('fs')
  , config = require('lib/config');

var program = require("commander");
program.version("0.0.1")
	.usage("node jukebox.js <music-dir(s)>")
	.option('-p, --port <port>', "server will listen on this port", parseInt)
	.option('-c, --config <file>', "server config file")
//	.option('-i, --itunes <file>', "itunes library xml file")
	.option('-m, --m3u <file>', "a comma separated list of m3u playlists")
	.option('-d, --directory <dir>', "directory of m3u playlists");

program.parse(process.argv);

config.loadConfig(program.config || DEFAULT_CONFIG_FILE);

var db = require("lib/musicDatabase");
db.initialise();

/*
var readItunes = function(itunes) {
	if (itunes !== undefined) {
		console.log("Reading itunes");
		var itunesReader = require("lib/playlistsFromItunes");
		itunesReader.createPlaylists(itunes);
	}
};
*/

var readPlaylists = function(dir, playlistsString, callback) {
	var playlistReader = require("lib/playlistsFromM3u");
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
};

var scanner = require("lib/musicScanner");
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



