"use strict";

/**
 * Created by maq on 11/07/2015.
 */

//var controller = require("lib/queue/playerController")
var async = require("async");
var express = require('express');
var controller = require("lib/player/playerController");
var config = require("lib/config");

var router = express.Router();

module.exports = router;
router.get("/", function(req, res, next) {
    //TODO add some user checking here
    controller.getPlaylists(function(err, hits) {
        res.render("player", {
            err: err,
            title: "Player",
            data: hits,
            defaultPlaylist: config.defaultPlaylist
        });

    });
});

