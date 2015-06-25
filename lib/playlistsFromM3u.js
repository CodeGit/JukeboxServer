"use strict";

/**
 * Creates playlists from m3u files
 */

var fs = require("fs");
var fsUtils = require("fs-utils");
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
		if (line.indexOf("#") !== 0 && line !== null && line !== "") {
			var musicPath = line;
			//handle relative paths
			if(musicPath !== "" && !fsUtils.isAbsolute(musicPath)) {
				musicPath= path.resolve(dir,musicPath);
			}
			m3u.queryDatabaseForPath(dir, playlistFile, musicPath, true);
		}
	}
};

m3u.queryDatabaseForPath = function(dir, playlistFile, musicPath, addToDB) {
	var query = db.Music.findOne({path: musicPath}, "+_id path title artist album");//music paths are unique
	var promise = query.exec();
	promise.addBack(function(err, hit){
		console.log("Searched db for " + musicPath);
		if(err) { throw err; } 
		if (hit === null) {
			//no database match on location 
			fs.exists(musicPath, function(exists) {
				console.log("No match to path " + musicPath + " found in db exists = " + exists + " addToDB = " + addToDB);
				if (exists && addToDB) {
					//if file exists on disk add it to the db
					m3u.createMusic(dir, playlistFile, musicPath);
				} else {
					throw("Failed to find file at: " + musicPath);
				}
			});
		} else {
			m3u.addToPlaylist(hit, path.basename(playlistFile, ".m3u"));
		}
		
	});
};

m3u.createMusic = function(dir, playlistFile, musicPath) {
	console.log("Creating data for: " + musicPath);
	musicScanner.files.push(musicPath);
	musicScanner.addMusicFile(musicPath, function(){
		m3u.queryDatabaseForPath(dir, playlistFile, musicPath, false);
	});
};


m3u.addToPlaylist = function(dbMusic, playlistName) {
	console.log("Adding "+ dbMusic + " to playlist: " + playlistName);
	db.updatePlaylist(playlistName, dbMusic);
};
