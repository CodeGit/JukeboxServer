"use strict";

/**
 * Creates playlists from m3u files
 */

var fs = require("fs");
var fsUtils = require("fs-utils");
var path = require("path");
var async = require("async");
var db = require("lib/musicDatabase");
var musicScanner = require("lib/musicScanner");

var m3u = {};
module.exports = m3u;
m3u.readLimit = 1;
m3u.queryLimit = 1;
m3u.addNewLimit = 1;
m3u.updateLimit = 1;

m3u.readPlaylistDirectory = function(dir, callback) {
	console.log("Reading directory ", dir);
	var dirStat = fs.statSync(dir);
	if (dirStat.isDirectory) {
		var absDirPath = fs.realpathSync(dir);
		fs.readdir(absDirPath, function(err, files){
			if (err) {
				throw("Read dir error: ", err);
			} else {
				var absolutePathfiles = files.map(function(value){
					return path.resolve(absDirPath, value);
				});
				m3u.readPlaylists(absolutePathfiles, callback);
			}
		});
	} else {
		throw("Expect '", dir, "' to be a directory path");
	}
};

m3u.readPlaylists = function(files, callback) {
	var playlistFiles = files.filter(function(element){ 
		if (element.match(/.*?\.m3u/)) {
			return true;
		} 
	});
	
	async.eachLimit(playlistFiles, m3u.readLimit, function(playlistFile, iteratorCallback){
		console.log("Reading playlist: ", playlistFile);
		fs.readFile(playlistFile, {encoding:"utf8"}, function(err, data) {
			if (err) {
				return callback("Error reading file '", playlistFile, "': " + err);
			} else {
				var lines = data.split("\n");
				console.log("Processing: ", playlistFile, " = ", lines.length, " lines");
				m3u.processM3U(playlistFile, lines, iteratorCallback);
			}
		});
	}, function(err){
		//completed reading all playlist files
		if (err != null) {throw err};
		if (callback != null){
			callback()
		};
	});
	
	
};

m3u.processM3U = function(playlistFile, lines, callback) {
	var musicPaths = [];
	for(var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (line.indexOf("#") !== 0 && line !== null && line !== "") {
			var musicPath = line;
			//handle relative paths
			if(musicPath !== "" && !fsUtils.isAbsolute(musicPath)) {
				var basePath = path.dirname(playlistFile);
				musicPath= path.resolve(basePath, musicPath);
			}
			musicPaths.push(musicPath);
		}
	}
	m3u.queryDatabaseForPaths(playlistFile, musicPaths, true, callback);
};

m3u.queryDatabaseForPaths = function(playlistFile, musicPaths, addSongToDB, callback) {
	console.log("Checking " + musicPaths.length + " paths from " + playlistFile);
	
	var newMusicList = [];
	var playListEntries = [];
	
	async.eachLimit(musicPaths, m3u.queryLimit, 
		function(musicPath, iteratorCallback){
			var query = db.Music.findOne({path: musicPath}, "+_id path title artist album");//music paths are unique
			var promise = query.exec();
			promise.addBack(function(err, hit){
				//console.log("Searched db for " + musicPath);
				if(err) { throw err; } 
				if (hit === null || hit === undefined) {
					//no database match on location 
					fs.exists(musicPath, function(exists) {
						//console.log("No match to path " + musicPath + " found in db exists = " + exists + " addSongToDB = " + addSongToDB);
						if (exists && addSongToDB) {
							//if file exists on disk add it to the db
							newMusicList.push(musicPath);
							//m3u.createMusic(dir, playlistFile, musicPath);
						} else {
							console.warn("Failed to find file at: " + musicPath);
						}
					});
				} else {
					playListEntries.push({
						"db":hit,
						"playlist":path.basename(playlistFile, ".m3u")
					});
					//m3u.addToPlaylist(hit, path.basename(playlistFile, ".m3u"));
				}
				iteratorCallback();
			});
		}, function(err){
			if (newMusicList.length > 0) {
				m3u.addSongsToDatabase(playlistFile, newMusicList, function(){
					m3u.addToPlaylist(playListEntries, callback);
				});
			} else {
				m3u.addToPlaylist(playListEntries, callback);
			}
		});
};



m3u.addSongsToDatabase = function(playlistFile, musicPaths, callback) {
	console.log("Adding data for: " + musicPaths.length + " items");
	var addingToDB = 0;
	musicScanner.addMusicFiles(musicPaths, function(){
		console.log("Finished adding new songs to db from " + playlistFile);
		m3u.queryDatabaseForPaths(playlistFile, musicPaths, false, callback);
	});
};


m3u.addToPlaylist = function(songs, callback) {
	async.eachLimit(songs, m3u.updateLimit, function(song, iteratorCallback){
		db.updatePlaylist(song.playlist, song.db, iteratorCallback);
	}, function(err){
		if (err) {return callback(err);}
		callback();
	});
	
	
};
