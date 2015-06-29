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
	
	music.getMusic(null, page, function(hits, err){
		if (err) {throw(err);}
		res.send(hits);
		next();
	});
});
