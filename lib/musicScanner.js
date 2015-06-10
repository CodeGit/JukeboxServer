'use strict';

/**
 * MusicScanner:
 * takes a list of directories and recursively scans them for music files
 */
var fs = require('fs');
var path = require('path');
var streambuffers = require("stream-buffers");
var mm = require("musicmetadata");
//var id3 = require("id3js");
//var id3 = require("id3_reader");
var db = require('lib/musicDatabase');
var config = require('lib/config');


var scanner = {};
module.exports = scanner;
var queues = {};
var fileReadLimit = 1;
var readsInProgress = 0;
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
	console.log("inProgress = " + readsInProgress + " files = " + files.length);
	while (readsInProgress < fileReadLimit && files.length > 0) {
		var file = files.shift();
		var extension = path.extname(file);
		if (config.settings.music.suffixes.indexOf(extension) > -1) {
			scanner.readMusicFile(file);
			readsInProgress++;
		}
	}
};

scanner.readMusicFile = function(file) {
	console.log("Reading file: " + file);
	
	var stream;
	try{ 
		stream = fs.createReadStream(file, {autoclose: true});
	} catch(err) {
		console.log("Error reading: " + file + " (" + err + ")");
	}
	//var parser = id3({ "file": file, type: id3.OPEN_LOCAL }, function(err, tags) {
	//id3.read(file, function(err, tags) {
	if (stream) {
		var parser = mm(stream, function(err, tags) {
			//stream.close();
			readsInProgress--;
			if (err) {
				console.log("Error getting music tags: " + err);
				//scanner._handleError(err);
			} else {
				//console.log(tags.artist + ": " +tags.title);
				scanner._createTrack(file, tags);
			}
			if (files.length > 0) {
				scanner.readFiles();
			}
		});
	}
	
};

scanner._createTrack = function(file, tags) {
	//console.log("Creating track: " + file);
	var track = new db.Track();
	track.path = file;
	//track.dir = path.dirname(file);
	//track.file = path.basename(file);
	track.name = tags.title ? tags.title : "";
	track.artist = tags.artist ? tags.artist[0] : "";
	track.track = tags.track && tags.track.no ? tags.track.no : 0;
	track.total = tags.track && tags.track.of ? tags.track.of : 0;
	track.album = tags.album ? tags.album : "";
	track.year = tags.year ? tags.year : 0;
	track.genre = tags.genre ? tags.genre[0] : "";
	db.Track.findOneAndUpdate({"path": file}, track, {upsert: true}, function (err, result){
		if (err) {
			console.log("MongoDB track error");
			scanner._handleError(err);
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

