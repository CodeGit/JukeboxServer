"use strict";

/**
 * Routes for songs and song list
 */

var async = require("async");
var express = require('express');
var router = express.Router();
var music = require("lib/music/musicController");

module.exports = router;

router.get("/", function(req, res, next) {
	var page = req.query.page;
	if(page == null) {
		page = 0;
	}
	async.waterfall([
		function(callback) {
			music.getMusicCount(null, function(err, count){
				callback(err, count);
			});
		},
		function(count, callback) {
			music.getMusic(null, page, function(err, hits){
				callback(err, [count, hits]);
			});
		}
	], function(err, results){
		if (err) {throw(err);}
		res.send(results);
		next();
	});
});
