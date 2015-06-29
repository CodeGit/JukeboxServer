/**
 * Routes for songs and song list
 */

var express = require('express');
var router = express.Router();
var songs = require("lib/music/musicController");

module.exports = router;

router.get("/", function(req, res, next) {
	res.send("music list");
	next();
});