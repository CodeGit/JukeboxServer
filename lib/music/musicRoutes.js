"use strict";

/**
 * Routes for songs and song list
 */

var async = require("async");
var express = require('express');
var router = express.Router();
var controller = require("lib/music/musicController");

module.exports = router;

router.get("/", function(req, res, next) {
	var page = req.query.page;
	if(page == null) {
		page = 0;
	}
	var filter;
    async.waterfall([
        function(callback) {
            controller.getMusicCount(filter, function(err, count){
                callback(err, count);
            });
        },
        function(count, callback) {
            controller.getMusic(filter, page, function(err, hits){
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
	var filter = null;
	controller.getArtists(filter, page, function(err, results){
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
	var filter = null;
	controller.getAlbums(filter, page, function(err, results){
		if (err) {throw(err);}
  		res.send(results);
  		next();
  	});
});

router.get("/playlists", function(req, res, next){
	var page = req.query.page;
	if(page == null) {
		page = 0;
	}
	var filter = null;
	controller.getPlaylists(filter, page, function(err, results){
		if (err) {throw(err);}
		res.send(results);
		next();
	});
});

var _fetchData = function(fetchMethod, countMethod, filter, res, next) {
	async.waterfall([
		function(callback) {
			controller.getMusicCount(filter, function(err, count){
				callback(err, count);
			});
		},
		function(count, callback) {
			controller.getMusic(filter, page, function(err, hits){
				callback(err, [count, hits]);
			});
		}
	], function(err, results){
		if (err) {throw(err);}
		res.send(results);
		next();
	});
};