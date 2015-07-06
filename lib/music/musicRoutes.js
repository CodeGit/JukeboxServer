"use strict";

/**
 * Routes for songs and song list
 */

var async = require("async");
var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var controller = require("lib/music/musicController");

module.exports = router;

router.get("/", function(req, res, next) {
    var page = req.query.page;
    if(page == null) {
        page = 0;
    }
    var filter = null;
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
        encodeFields: ["artist"],
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
        encodeFields: ["album"],
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
        encodeFields: ["playlist"],
        res: res,
        next: next,
        title: "Playlists"
    });
});

router.get("/filter", function(req, res, next){
    var page = req.query.page;
    if (page == null) {
        page = 0;
    }
    var filter = null;
    if (req.query.artist != null) {
        filter = {
            "artist": req.query.artist
        };
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

var _fetchData = function (parameters) {
    var countMethod = parameters.countMethod;
    var fetchMethod = parameters.fetchMethod;
    var filter = parameters.filter;
    var page = parameters.page;
    var encodeFields = parameters.encodeFields;
    var res = parameters.res;
    var next = parameters.next;
    async.waterfall([
        function (callback) {
            //count hits
            countMethod(filter, function (err, count) {
                callback(err, count);
            });
        },
        function (count, callback) {
            //fetch hits as simple object
            fetchMethod(filter, page, function (err, hits) {
                var results = {
                    "count": count,
                    "hits": hits
                };
                callback(err, results);
            });
        },
        function (results, callback) {
            //url encode fields to be used for navigation
            if (encodeFields != null) {
                for (var i = 0; i < encodeFields.length; i++) {
                    var field = encodeFields[i];
                    var escapedField = "url_" + field;
                    for(var j =0 ; j < results.hits.length; j++){
                        var hit = results.hits[j];
                        var escapeObject = {};
                        escapeObject[field] = hit[field];
                        var escapedValue = querystring.stringify(escapeObject);
                        hit[escapedField] = escapedValue;
                    }
                }
            }
            callback(null, results);
        }
    ], function (err, results) {
        if (err) {throw (err); }
        res.render(parameters.jade, {
            page: parameters.page,
            title: parameters.title,
            data: results,
            filter: parameters.filter
        });
        //res.send(results);
        next();
    });
};