"use strict";

/**
 * 
 * Controller for controller list
 */

var config = require("lib/config");
var db = require("lib/database");

var controller = {};
module.exports = controller;

controller.getMusic = function(filter, page, callback) {
    console.log("getMusic(" + filter + ", " + page + ")");
    if (page == null) {
        page = 0;
    }
    var resultsPerPage = config.settings.search.resultsPerPage;
    var skipAhead = (page * resultsPerPage)
    var query = db.Music.find(filter, "+_id file title artist album")
        .skip(skipAhead)
        .limit(resultsPerPage)
        .sort({
            title: 1,
            artist: 1,
            filename: 1
        })
        .lean(true);
    var promise = query.exec();
    promise.addBack(function(err, hits){
        //console.log("Searched db for " + musicPath);
        if(err) { callback(err, hits); }
        if (hits === null || hits === undefined) {
            if (callback != null) {
                callback(null, []);
            }
        } else {
            console.log("Hits = " + hits.length);
            if (callback != null) {
                callback(null, hits);
            }
        }
    });
};

controller.getArtists = function(filter, page, callback) {
    console.log("getArtist(" + filter + ", " + page + ")");
    var sort = {
        sortArtist: 1
    };
    controller.getDistinctMusic(db.Artist, filter, page, sort, callback);
};

controller.getAlbums = function(filter, page, callback) {
    console.log("getAlbums(" + filter + ", " + page + ")");
    var sort = {
        album: 1
    }
    controller.getDistinctMusic(db.Album, filter, page, sort, callback);
};

controller.getPlaylists = function(filter, page, callback) {
    console.log("getPlaylists(" + filter + ", " + page + ")");
    var sort = {
        playlist: 1
    }
    controller.getDistinctMusic(db.PlaylistSummary, filter, page, sort, callback);
};

controller.getDistinctMusic = function(model, filter, page, sort, callback) {
    if (page == null) {
        page = 0;
    }
    var resultsPerPage = config.settings.search.resultsPerPage;
    var skipAhead = (page * resultsPerPage);
    var query = model.find()
        .skip(skipAhead)
        .limit(resultsPerPage)
        .sort(sort)
        .lean(true);

    var promise = query.exec();
    promise.addBack(function(err, hits){
        //console.log("Searched db for " + musicPath);
        if(err) { callback(err, hits); }
        if (hits === null || hits === undefined) {
            if (callback != null) {
                callback(null, []);
            }
        } else {
            console.log("Hits = " + hits.length);
            if (callback != null) {
                callback(null, hits);
            }
        }
    });
}

controller.getMusicCount = function(filter, callback) {
    var query = db.Music.find(filter).count();
    controller.getCount(query, callback);
};

controller.getArtistCount = function(filter, callback) {
    var query = db.Artist.find(filter).count();
    controller.getCount(query, callback);
};

controller.getAlbumCount = function(filter, callback) {
    var query = db.Album.find(filter).count();
    controller.getCount(query, callback);
};

controller.getPlaylistCount = function(filter, callback) {
    var query = db.PlaylistSummary.find(filter).count();
    controller.getCount(query, callback);
};

controller.getCount = function(query, callback) {
    var promise = query.exec();
    promise.addBack(function(err, count){
        //console.log("Searched db for " + musicPath);
        if(err) { callback(-1, err); }
        if (count === null || count === undefined) {
            if (callback == null) {
                callback(null, 0);
            }
        } else {
            callback(null, count);
        }
    });

};