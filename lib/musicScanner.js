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
var fileReadLimit = 1;
var readsInProgress = 0;
var files = [];
var directoryImages = {};

scanner.scan = function(dirs, callback) {
	scanner.callback = callback;
	console.log("Preparing to scan " + dirs);
	for (var i=0; i < dirs.length; i++) {
		scanner.scanDirectory(dirs[i]);
	}
	scanner.readFiles();
};

scanner.scanDirectory = function (dir) {
	console.log("Scanning directory: "+ dir);
	var subDirs = fs.readdirSync(dir);
	subDirs.forEach(function(subDir) {
		var file = path.resolve(dir, subDir);
		var stat = fs.statSync(file);
		if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
			scanner.scanDirectory(file);
		} else {
			var extension = path.extname(file);
			if (config.settings.music.suffixes.indexOf(extension) > -1) {
				files.push(file); 
			} else if (config.settings.image.suffixes.indexOf(extension) > -1) {
				if (!directoryImages.hasOwnProperty(path.dirname(file))) {
					directoryImages[path.dirname(file)] = [];
				}
				console.log("Found image: " + file);
				directoryImages[path.dirname(file)].push(file);
			}
		}
	});
};

scanner.readFiles = function() {
	console.log("inProgress = " + readsInProgress + " files = " + files.length);
	while (readsInProgress < fileReadLimit && files.length > 0) {
		var file = files.shift();
		scanner.readMusicFile(file);
		readsInProgress++;
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
				scanner._createMusic(file, tags);
			}
			if (files.length > 0) {
				scanner.readFiles();
			} else {
				//TODO can't guarantee that all DB tracks have been created at this point
				console.log("MusicScanner finished");
				if (scanner.callback != undefined) {
					console.log("Running musicScanner callback()");
					scanner.callback();
				}
			}
		});
	}
	
};

scanner._createMusic = function(file, tags) {
	//console.log("Creating track: " + file);
	var data = {};
	data.path = file;
	//track.dir = path.dirname(file);
	data.file = path.basename(file);
	data.title = tags.title ? tags.title : "";
	data.artist = tags.artist ? tags.artist[0] : "";
	data.track = tags.track && tags.track.no ? tags.track.no : 0;
	data.total = tags.track && tags.track.of ? tags.track.of : 0;
	data.album = tags.album ? tags.album : "";
	data.year = tags.year ? tags.year : 0;
	data.genre = tags.genre ? tags.genre[0] : "";
	if (directoryImages.hasOwnProperty(path.dirname(file))) {
		data.image = directoryImages[path.dirname(file)][0];
	}
	db.updateMusic(data, true);
};

scanner._handleError = function(err) {
	console.log("Error: " + err);
	throw err;
};

