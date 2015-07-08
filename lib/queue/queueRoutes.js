"use strict";

/**
 * Created by maq on 07/07/2015.
 */

var async = require("async");
var express = require('express');
var querystring = require('querystring');
var router = express.Router();

module.exports = router;
router.get("/", function(req, res, next) {
    var page = req.query.page;
    if(page == null) {
        page = 0;
    }
    res.send("Showing queue");
});

router.post("/", function(req, res, next) {
    var musicId = req.body.music;
    res.send({
        music: musicId
    });
});