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
scanner.files = {};
var queues = {};
var fileReadLimit = 20;

scanner.scan = function(dirs) {
	console.log("Preparing to scan " + dirs);
	var files = [];
	for (var i=0; i < dirs.length; i++) {
		files.append(scanner.scanDirectory(dirs[i]));
	}
};

scanner.scanDirectory = function (dir) {
	console.log("Scanning directory: "+ dir);
	var files = [];
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
	return files;
};

scanner.readFile = function(file, callback) {
	console.log("Reading file: " + file);
	var extension = path.extname(file);
	if (config.settings.music.suffixes.indexOf(extension) > -1) {
		var parser = mm(fs.createReadStream(file), scanner._getTags);
	}
	return file;
};

scanner._getTags = function(err, tags) {
	if (err) {
		console.log("Error getting music tags");
		scanner._handleError(err);
	} else {
		console.log(tags);
		scanner._createTrack(tags);
	}
};

scanner._createTrack = function(file, tags) {
	console.log("Creating track");
};

scanner._handleError = function(err) {
	console.log("Error: " + err);
	throw err;
};

