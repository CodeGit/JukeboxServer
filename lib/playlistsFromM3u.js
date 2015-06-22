"use strict";

/**
 * Creates playlists from m3u files
 */

var fs = require("fs");
var path = require("path");
var db = require("lib/musicDatabase");
var musicScanner = require("lib/musicScanner");

var m3u = {};
module.exports = m3u;
	
m3u.readPlaylistDirectory = function(dir) {
	console.log("Reading directory ", dir);
	var dirStat = fs.statSync(dir);
	if (dirStat.isDirectory) {
		var absDirPath = fs.realpathSync(dir);
		fs.readdir(absDirPath, function(err, files){
			if (err) {
				throw("Read dir error: ", err);
			} else {
				m3u.readPlaylists(absDirPath, files);
			}
		});
	} else {
		throw("Expect '", dir, "' to be a directory path");
	}
};

m3u.readPlaylists = function(dir, files) {
	var playlistFiles = files.filter(function(element){ 
		if (element.match(/.*?\.m3u/)) {
			return element;
		} 
	});
	for(var i = 0; i < playlistFiles.length; i++) {
		m3u.readPlaylist(dir, playlistFiles[i]);
	}
};

m3u.readPlaylist = function(dir, file) {
	console.log("Reading playlist: ", file);
};