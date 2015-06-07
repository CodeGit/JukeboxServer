'use strict';

/**
 * MusicScanner:
 * takes a list of directories and recursively scans them for music files
 */

var fs = require('fs');
var path = require('path');
var promise = require('promise');
var db = require('lib/musicDatabase');

var scanner = {};
module.exports = scanner;
scanner.files = [];

scanner.scan = function(dirs) {
	var i;
	console.log("Preparing to scan " + dirs);
	for (i=0; i < dirs.length; i++) {
		scanner.scanDirectory(dirs[i]);
	}
};

scanner.scanDirectory = function (dir) {
	console.log("Reading "+ dir);
	var readdir = promise.denodeify(fs.readdir);
	var dirPromise = readdir(dir).then(function(subDirs) {
		for (var i = 0; i < subDirs.length; i++) {
			var file = path.resolve(dir, subDirs[i]);
			var stat = fs.statSync(file);
			if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
				scanner.scanDirectory(file);
			} else {
				console.log("Got " + file);
			}
		}
		//console.log("Then " + dir + " => " + str);
	}, function(err){
		console.log(err);
		throw err;
	});
	
};