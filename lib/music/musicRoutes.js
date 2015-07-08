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
        req: req,
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
        req: req,
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
        req: req,
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
        req: req,
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
    if (req.query.album != null) {
        filter = {
            "album": req.query.album
        };
    }
    if (req.query.playlist != null) {
        filter = {
            "playlist": req.query.playlist
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
        req: req,
        next: next,
        title: "Music"
    });

});

var _fetchData = function (parameters) {
    var jade = parameters.jade;
    var title = parameters,title;
    var countMethod = parameters.countMethod;
    var fetchMethod = parameters.fetchMethod;
    var filter = parameters.filter;
    var page = parameters.page;
    var encodeFields = parameters.encodeFields;
    var res = parameters.res;
    var req = parameters.req;
    var next = parameters.next;
    var data = parameters.data || {};
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
                data.count = count;
                data.hits = hits;
                callback(err);
            });
        },
        function (callback) {
            //url encode fields to be used for navigation
            if (encodeFields != null) {
                for (var i = 0; i < encodeFields.length; i++) {
                    var field = encodeFields[i];
                    var escapedField = "url_" + field;
                    for(var j =0 ; j < data.hits.length; j++){
                        var hit = data.hits[j];
                        var escapeObject = {};
                        escapeObject[field] = hit[field];
                        var escapedValue = querystring.stringify(escapeObject);
                        hit[escapedField] = escapedValue;
                    }
                }
            }
            callback(null);
        }
    ], function (err) {
        if (err) {throw (err); }
        res.render(jade, {
            page: page,
            title: title,
            data: data,
            filter: filter,
            path: jade
        });
        next();
    });
};