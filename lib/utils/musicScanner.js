'use strict';

/**
 * MusicScanner:
 * takes a list of directories and recursively scans them for music files
 */
var fs = require('fs');
var path = require('path');
var async = require("async");
var mm = require("musicmetadata");
var db = require('lib/database');
var config = require('lib/config');

var scanner = {};
module.exports = scanner;
scanner.files = [];
scanner.directoryImages = {};
scanner.readLimit = 1;

scanner.scanDirectories = function(dirs, callback) {
	console.log("Preparing to scan " + dirs);
	for (var i=0; i < dirs.length; i++) {
		scanner._scanDirectory(dirs[i]);
	}
	scanner._readFiles(callback);
};

scanner.addMusicFiles = function(files, callback) {
	scanner.files = scanner.files.concat(files);
	scanner._readFiles(callback);
};

scanner._scanDirectory = function (dir) {
	console.log("Scanning directory: "+ dir);
	var subDirs = fs.readdirSync(dir);
	subDirs.forEach(function(subDir) {
		var file = path.resolve(dir, subDir);
		var stat = fs.statSync(file);
		if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
			scanner._scanDirectory(file);
		} else {
			var extension = path.extname(file);
			if (config.settings.music.suffixes.indexOf(extension) > -1) {
				scanner.files.push(file); 
			} else if (config.settings.image.suffixes.indexOf(extension) > -1) {
				if (!scanner.directoryImages.hasOwnProperty(path.dirname(file))) {
					scanner.directoryImages[path.dirname(file)] = [];
				}
				console.log("Found image: " + file);
				scanner.directoryImages[path.dirname(file)].push(file);
			}
		}
	});
};

scanner._readFiles = function(callback) {
	console.log("Reading music data from " + scanner.files.length + " files");
	async.eachLimit(scanner.files, scanner.readLimit, function(file, iteratorCallback){
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
				if (err) {
					console.log("Error getting music tags: " + err);
					//scanner._handleError(err);
					iteratorCallback();
				} else {
					//console.log(tags.artist + ": " +tags.title);
					scanner._createMusic(file, tags, iteratorCallback);
				}
			});
		} else {
			//callback();
		}
	}, function(err){
		if (callback != null) {
			callback();
		}
	});
};

scanner._createMusic = function(file, tags, callback) {
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
	if (scanner.directoryImages.hasOwnProperty(path.dirname(file))) {
		data.image = scanner.directoryImages[path.dirname(file)][0];
	}
	db.updateMusic(data, true, callback);
};

scanner._handleError = function(err) {
	console.log("Error: " + err);
	throw err;
};

