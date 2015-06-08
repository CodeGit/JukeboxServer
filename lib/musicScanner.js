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

scanner.scan = function(dirs) {
	console.log("Preparing to scan " + dirs);
	for (var i=0; i < dirs.length; i++) {
		scanner.scanDirectory(dirs[i]);
	}
	console.log("Finished all scans");
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
			scanner.readFile(file);
		}
	});
};

scanner.readFile = function(file) {
	console.log("Reading file: " + file);
	var extension = path.extname(file);
	if (config.settings.music.suffixes.indexOf(extension) > -1) {
		var fileContent = fs.readFileSync(file);
		var stream = streambuffers.WritableStreamBuffer({
			frequency: 10,
			chunkSize: 2048
		});
		stream.put(fileContent);
		var parser = mm(fs.createReadStream(stream), function(err, tags) {
			if (err) {
				console.log(err);
			} else {
				console.log(tags);
			}
		});
	}
};

scanner._createTrack = function(file, tags) {
	console.log("Creating track");
};

scanner._handleError = function(err) {
	console.log("Error: " + err);
	throw err;
};

