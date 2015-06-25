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
	var absFilePath = path.resolve(dir, file);
	fs.readFile(absFilePath, {encoding:"utf8"}, function(err, data) {
		if (err) {
			throw("Error reading file '", absFilePath, "': ", err);
		} else {
			var lines = data.split("\n");
			console.log("Processing: ", file, " = ", lines.length, " lines");
			m3u.processM3U(dir, file, lines);
			/*
			if (lines[0] === "#EXTM3U") {
				//TODO m3u.processExtM3U(dir, file, lines);
			} else {
				m3u.processM3U(dir, file, lines);
			}
			*/
		}
	});
};

m3u.processExtM3U = function(dir, file, lines) {
	
};

m3u.processM3U = function(dir, playlistFile, lines) {
	for(var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (line.indexOf("#") !== 0) {
			var musicPath = line;
			//handle relative paths
			if(!path.isAbsolute(musicPath)) {
				musicPath= path.resolve(dir,musicPath);
			}
			m3u.queryDatabaseForPath(dir, playlistFile, musicPath);
		}
	}
};

m3u.createMusic = function(musicPath) {
	console.log("Creating data for: " + musicPath);
	musicScanner.files.push(musicPath);
	musicScanner.readFiles();
};

m3u.queryDatabaseForPath = function(dir, playlistFile, musicPath) {
	var query = db.Music.findOne({path: musicPath});//music paths are unique
	var promise = query.exec();
	promise.addBack(function(err, hit){
		//console.log("Searched db for " + musicPath);
		if(err) { throw err; } 
		if (hit === undefined) {
			//no database match on location 
			console.log("No match to path found in db");
			if (fs.exists(musicPath)) {
				//if file exists on disk add it to the db
				m3u.createMusic(musicPath);
			}
		} else {
			m3u.addToPlaylist(hit, path.basename(playlistFile, ".m3u"));
		}
		
	});
};

m3u.addToPlaylist = function(dbMusic, playlistName) {
	console.log("Adding "+ dbMusic.path + " to playlist: " + playlistName);
	db.updatePlaylist(playlistName, dbMusic);
};
