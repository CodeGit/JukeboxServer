"use strict";

/**
 * Created by maq on 11/07/2015.
 */

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
            defaultPlaylist: req.app.defaultPlaylist
        });
    });
});

router.get("/play", function(req, res, next) {
    //TODO add some user checking here
    controller.play(req.app, function(err, message) {
        res.send({
            err: err,
            message: message,
            command: req.path
        });
    });
});

router.get("/pause", function(req, res, next) {
    //TODO add some user checking here
    controller.pause(req.app, function(err, message) {
        res.send({
            err: err,
            message: message,
            command: req.path
        });
    });
});

router.get("/stop", function(req, res, next) {
    //TODO add some user checking here
    controller.stop(req.app, function(err, message) {
        res.send({
            err: err,
            message: message,
            command: req.path
        });
    });
});

router.get("/forward", function(req, res, next) {
    //TODO add some user checking here
    controller.forward(req.app, function(err) {
        res.send({
            err: err,
            message: message,
            command: req.path
        });
    });
});

router.get("/rewind", function(req, res, next) {
    //TODO add some user checking here
    controller.rewind(req.app, function(err) {
        res.send({
            err: err,
            message: message,
            command: req.path
        });
    });
});
