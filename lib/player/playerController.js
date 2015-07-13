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
        if (app.locals.groovePlaylist.count() > 0) {
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
        //app.locals.groovePlaylist.remove(app.locals.grooveItem);
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
        .sort({'ordinal': 1})
        .lean();
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
    console.log("Playing: '"
        + music.title + "' : '"
        + music.artist + "' : '"
        + music.album + "'");
    app.locals.groove.open(music.path, function(err, file) {
        app.locals.groovePlaylist.insert(file);
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
    app.locals.groovePlayer = app.locals.groove.createPlayer();
    app.locals.groovePlayer.userExactAudioFormat = true;
    app.locals.groovePlaylist = app.locals.groove.createPlaylist();
    app.locals.groovePlaylist.pause();
    app.locals.groovePlayer.attach(app.locals.groovePlaylist, function(err){
        if (err)
            callback(err, "Failed to initialise player");
    })
    if (app.locals.defaultPlaylist == null) {
        app.locals.defaultPlaylist = config.settings.defaultPlaylist;
    }

    app.locals.groovePlayer.on("deveicereopened", function(){
        console.log("Groove Player: Device reopened");
    });

    app.locals.groovePlayer.on("nowplaying", function(){
        console.log("Groove Player: Now playing");
        var current = app.locals.groovePlayer.position();
        var playCurrent = app.locals.groovePlaylist.position();
        if (app.locals.groovePlaylist.count() == 2) {
            console.log("Removing " + app.locals.groovePlaylist.items()[0].file.getMetadata('title'))
            app.locals.groovePlaylist.remove(app.locals.groovePlaylist.items()[0]);

        }
        controller.selectNextSong(app, function(err, music) {
            console.log("Adding: '"
                + music.title + "' : '"
                + music.artist + "' : '"
                + music.album + "'");
            if(err) {
                throw(err);
            } else {
                app.locals.groove.open(music.path, function(err, file) {
                    app.locals.groovePlaylist.insert(file);
                });
            }
        });
    });
};
