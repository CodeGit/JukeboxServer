/**
 * Created by maq on 11/07/2015.
 */
"use strict";

var async = require("async");
var db = require("lib/database");
var config = require("lib/config");

var controller = {};
module.exports = controller;

controller.getPlaylists = function(callback) {
    var query = db.PlaylistSummary.find().lean();
    var promise = query.exec();
    promise.onResolve(function(err, hits){
        callback(err, hits);
    });
}

controller.play = function(app, callback) {
    controller.checkPlayer(app, callback);
    if (!app.locals.groovePlaylist.playing()) {
        if (app.locals.groovePlaylist.count > 0) {
            app.locals.groovePlaylist.play();
            callback(null, "Restarted playback");
        } else {
            controller.chooseAndPlaySong(app, callback);
        }
    }
    else {
        callback(null, "Already playing");
    }
};

controller.pause = function(app, callback) {
    controller.checkPlayer(app, callback);
    if (app.locals.groovePlaylist.playing()) {
        app.locals.groovePlaylist.pause()
        callback(null, "Paused");
    }
    else {
        callback(null, "Already paused/stopped");
    }
};

controller.stop = function(app, callback) {
    controller.checkPlayer(app, callback);
    if (app.locals.groovePlaylist.playing()) {
        app.locals.groovePlaylist.pause();
        app.locals.groovePlaylist.clear();
        callback(null, "Stopped")
    }
    else {
        callback(null, "Already paused/stopped");
    }
}

controller.chooseAndPlaySong = function(app, callback) {
    async.waterfall([
        function(waterfallCallback) {
            controller.selectNextSong(app, waterfallCallback);
        },
        function(music, waterfallCallback) {
            controller.playMusic(music, app, waterfallCallback);
        }
    ], function(err, result) {
        callback(err, result);
    });
};

controller.selectNextSong = function(app, callback) {
    var query = db.Queue.findOneAndRemove()
        .populate('music')
        .sort({'ordinal': 1});
    var promise = query.exec();
    promise.onResolve(function(err, hit) {
        if(hit == null) {
            db.getRandomSongFromPlaylist(app.locals.defaultPlaylist, callback);
        } else {
            controller.reOrderQueue(hit.music, callback);
        }
    });
};

controller.reOrderQueue = function(music, callback) {
    db.reOrderQueue(function(err){
        callback(err, music);
    });
};

controller.playMusic = function(music, app, callback) {
    "use strict";
    console.log("Got song: " + music.title);
    app.locals.groove.open(music.path, function(err, file) {
        app.locals.groovePlaylist.insert(file);
        app.locals.grooveFile = file;
        app.locals.groovePlaylist.play();
        callback(null, "Playing " + music.title);
    });
};

controller.checkPlayer = function(app) {
    if( app.locals.groovePlayer == null) {
        controller.initialiseGroovePlayer(app);
    }
};

controller.initialiseGroovePlayer = function(app, callback) {
    console.log("initialiseGroovePlayer()");
    app.locals.groovePlaylist = app.locals.groove.createPlaylist();
    app.locals.groovePlaylist.pause();
    app.locals.groovePlayer = app.locals.groove.createPlayer();
    app.locals.groovePlayer.userExactAudioFormat = true;

    app.locals.groovePlayer.attach(app.locals.groovePlaylist, function(err){
       if(err)
           callback(err, "Error initialising player");
    });
    if (app.locals.defaultPlaylist == null) {
        app.locals.defaultPlaylist = config.settings.defaultPlaylist;
    }

    app.locals.groovePlayer.on("deveicereopened", function(){
        console.log("Device reopened");
    });

    app.locals.groovePlayer.on("newplaying", function(){
        console.log("New playing");
        var current = app.locals.groovePlayer.position();
        if (!current.item) {
            app.locals.grooveFile.close();
        }

    });
};