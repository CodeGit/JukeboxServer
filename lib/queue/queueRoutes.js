"use strict";

/**
 * Created by maq on 07/07/2015.
 */

var controller = require("lib/queue/queueController")
var async = require("async");
var express = require('express');
var router = express.Router();

module.exports = router;
router.get("/", function(req, res, next) {

    var nowPlaying, upNext;
    if (req.app.locals.groovePlaylist != null) {
        var items = req.app.locals.groovePlaylist.items();
        if (items != null && items.length > 1) {
            nowPlaying= router.getItemData(items[0]);
            upNext = router.getItemData(items[1]);
        }
    }

    controller.getQueue(function(err, queue) {
        res.render("queue", {
            title: "Music Queue",
            queue: queue,
            nowPlaying: nowPlaying,
            upNext: upNext
        });
    });
});

router.post("/", function(req, res, next) {
    var musicId = req.body.music;
    var sessionID = req.sessionID;
    var tokens = req.session.tokens;
    //TODO do some token processing
    controller.addMusicToQueue(
        musicId, sessionID, function(err, message){
        res.send({
            message: message,
            music: musicId
        });
    });
});

router.getItemData = function(item) {
    var data = {};
    data.title = item.file.getMetadata('title');
    data.artist = item.file.getMetadata('artist');
    data.album = item.file.getMetadata('album');
    return data;
}