/**
 * Routes for songs and song list
 */

var express = require('express');
var router = express.Router();

module.exports = router;

router.get("/", function(req, res) {
	res.send("Song list");
});