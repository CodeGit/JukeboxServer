"use strict";

/**
 * 
 * Controller for music list
 */

var config = require("lib/config");
var db = require("lib/database");

var controller = {};
module.exports = controller;

controller.getMusic = function(filter, page, callback) {
	console.log("getMusic(" + filter + ", " + page + ")");
	if (page == null) {
		page = 0;
	}
	var resultsPerPage = config.settings.search.resultsPerPage;
	var skipAhead = (page * resultsPerPage)
	var query = db.Music.find(filter, "+_id file title artist album")
	.skip(skipAhead)
	.limit(resultsPerPage)
	.sort( {
		title: -1,
		filename: 1
	});
	var promise = query.exec();
	promise.addBack(function(err, hits){
		//console.log("Searched db for " + musicPath);
		if(err) { callback(err, hits); } 
		if (hits === null || hits === undefined) {
			if (callback != null) {
				callback(null, []);
			}
		} else {
			console.log("Hits = " + hits.length);
			if (callback != null) { 
				callback(null, hits);
			}
		}
	});
};

controller.getMusicCount = function(filter, callback) {
	var query = db.Music.find(filter).count();
	var promise = query.exec();
	promise.addBack(function(err, count){
		//console.log("Searched db for " + musicPath);
		if(err) { callback(-1, err); } 
		if (count === null || count === undefined) {
			if (callback == null) {
				callback(null, 0);
			}
		} else {
			console.log("Count = " + count);
			callback(null, count);
		}
	});
};