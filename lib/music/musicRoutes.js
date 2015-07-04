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
	_fetchData(controller.getMusicCount, controller.getMusic, filter, page, res, next);
});

router.get("/artist", function(req, res, next){
    var page = req.query.page;
    if(page == null) {
        page = 0;
    }
    var filter = null;
    _fetchData(controller.getArtistCount, controller.getArtists, filter, page, res, next);
});

router.get("/album", function(req, res, next){
    var page = req.query.page;
    if(page == null) {
        page = 0;
    }
    var filter = null;
    _fetchData(controller.getAlbumCount, controller.getAlbums, filter, page, res, next);
});

router.get("/playlists", function(req, res, next){
    var page = req.query.page;
    if(page == null) {
        page = 0;
    }
    var filter = null;
    _fetchData(controller.getPlaylistCount, controller.getPlaylists, filter, page, res, next);
});

var _fetchData = function (countMethod, fetchMethod, filter, page, res, next) {
    async.waterfall([
        function (callback) {
            countMethod(filter, function (err, count) {
                callback(err, count);
            });
        },
        function (count, callback) {
            fetchMethod(filter, page, function (err, hits) {
                callback(err, [count, hits]);
            });
        }
    ], function (err, results) {
        if (err) {throw (err); }
        res.send(results);
        next();
    });
};