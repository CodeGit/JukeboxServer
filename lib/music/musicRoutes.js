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
	var filter;
	async.waterfall([
 		function(callback) {
 			music.getMusicCount(filter, function(err, count){
 				callback(err, count);
 			});
 		},
 		function(count, callback) {
 			music.getMusic(filter, page, function(err, hits){
 				callback(err, [count, hits]);
 			});
 		}
 	], function(err, results){
 		if (err) {throw(err);}
 		res.send(results);
 		next();
 	});
});

router.get("/artist", function(req, res, next){
	var page = req.query.page;
	if(page == null) {
		page = 0;
	}
	var field = "sortArtist";
	var filter = null;
	music.getDistinctMusic(field, filter, page, function(err, results){
		if (err) {throw(err);}
  		res.send(results);
  		next();
  	});
});

router.get("/album", function(req, res, next){
	var page = req.query.page;
	if(page == null) {
		page = 0;
	}
	var field = "album";
	var filter = null;
	music.getDistinctMusic(field, filter, page, function(err, results){
		if (err) {throw(err);}
  		res.send(results);
  		next();
  	});
});
