'use strict';

/**
 * MusicScanner:
 * takes a list of directories and recursively scans them for music files
 */

var fs = require('fs');
var path = require('path');
var streambuffers = require("stream-buffers");
var mm = require("musicmetadata");
var db = require('lib/musicDatabase');
var config = require('lib/config');


var scanner = {};
module.exports = scanner;
var queues = {};
var fileReadLimit = 1000;
var inProgress = 0;
var files = [];

scanner.scan = function(dirs) {
	console.log("Preparing to scan " + dirs);
	for (var i=0; i < dirs.length; i++) {
		scanner.scanDirectory(dirs[i]);
	}
	scanner.readFiles();
};

scanner.scanDirectory = function (dir) {
	//console.log("Scanning directory: "+ dir);
	var subDirs = fs.readdirSync(dir);
	subDirs.forEach(function(subDir) {
		var file = path.resolve(dir, subDir);
		var stat = fs.statSync(file);
		if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
			scanner.scanDirectory(file);
		} else {
			files.push(file);
		}
	});
};

scanner.readFiles = function() {
	console.log("inProgress = " + inProgress + " files = " + files.length);
	while (inProgress < fileReadLimit && files.length > 0) {
		var file = files.shift();
		scanner.readFile(file);
		inProgress++;
	}
};

scanner.readFile = function(file) {
	console.log("Reading file: " + file);
	var extension = path.extname(file);
	if (config.settings.music.suffixes.indexOf(extension) > -1) {
		var parser = mm(fs.createReadStream(file, {autoclose: true}), function(err, tags) {
			inProgress--;
			if (err) {
				console.log("Error getting music tags");
				scanner._handleError(err);
			} else {
				console.log(tags);
				scanner._createTrack(file, tags);
			}
			if (files.length > 0) {
				scanner.readFiles();
			}
		});
	}
	return file;
};

/*scanner._getTags = function(err, tags) {
	if (err) {
		console.log("Error getting music tags");
		scanner._handleError(err);
	} else {
		console.log(tags);
		scanner._createTrack(tags);
	}
};*/

scanner._createTrack = function(file, tags) {
	console.log("Creating track");
	var track = new db.Track();
	track.dir = path.dirname(file);
	track.file = path.basename(file);
	track.name = tags.title;
	track.artist = tags.artist;
	track.track = tags.track.no;
	track.total = tags.track.of;
	track.album = tags.album;
	track.year = tags.year;
	track.genre = tags.genre;
	track.save(function (err, result){
		if (err) {
			console.log("MongoDB track error");
			scanner._handleError(err);
		} else {
			console.log("Result = " + result);
		}
		console.log("Wrote " + track.name + " to db");
	});
	/*
	length: Number,
	startSilence: Number,
	endSilence: Number,
	comments: String,
	image: String
	*/
};

scanner._handleError = function(err) {
	console.log("Error: " + err);
	throw err;
};

