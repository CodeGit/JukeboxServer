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
	_fetchData({
        jade: "music",
        countMethod: controller.getMusicCount,
        fetchMethod: controller.getMusic,
        filter: filter,
        page: page,
        res: res,
        next: next,
        title: "Music"
    });
});

router.get("/artist", function(req, res, next){
    var page = req.query.page;
    if(page == null) {
        page = 0;
    }
    var filter = null;
    _fetchData({
        jade: "artists",
        countMethod: controller.getArtistCount,
        fetchMethod: controller.getArtists,
        filter: filter,
        page: page,
        res: res,
        next: next,
        title: "Artists"
    });
});

router.get("/album", function(req, res, next){
    var page = req.query.page;
    if(page == null) {
        page = 0;
    }
    var filter = null;
    _fetchData({
        jade: "albums",
        countMethod: controller.getAlbumCount,
        fetchMethod: controller.getAlbums,
        filter: filter,
        page: page,
        res: res,
        next: next,
        title: "Albums"
    });
});

router.get("/playlists", function(req, res, next){
    var page = req.query.page;
    if(page == null) {
        page = 0;
    }
    var filter = null;
    _fetchData({
        jade: "playlists",
        countMethod: controller.getPlaylistCount,
        fetchMethod: controller.getPlaylists,
        filter: filter,
        page: page,
        res: res,
        next: next,
        title: "Playlists"
    });
});

var _fetchData = function (parameters) {
    var countMethod = parameters.countMethod;
    var fetchMethod = parameters.fetchMethod;
    var filter = parameters.filter;
    var page = parameters.page;
    var res = parameters.res;
    var next = parameters.next;
    async.waterfall([
        function (callback) {
            countMethod(filter, function (err, count) {
                callback(err, count);
            });
        },
        function (count, callback) {
            fetchMethod(filter, page, function (err, hits) {
                var results = {
                    "count": count,
                    "hits": hits
                };
                callback(err, results);
            });
        }
    ], function (err, results) {
        if (err) {throw (err); }
        res.render(parameters.jade, {
            page: parameters.page,
            title: parameters.title,
            data: results
        });
        //res.send(results);
        next();
    });
};