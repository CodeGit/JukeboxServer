"use strict";

/**
 * Created by maq on 07/07/2015.
 */

var config = require("lib/config");
var db = require("lib/database");
var async = require("async");

var controller = {};
module.exports = controller;

controller.addMusicToQueue = function(musicId, cookie, callback) {
    async.waterfall([
        function(waterfallCallback) {
            var query = db.Queue.find().count();
            var promise = query.exec();
            promise.onResolve( function(err, count) {
                waterfallCallback(null, count);
            });
        },function(count, waterfallCallback) {
            var maxQueueLength = config.settings.queue.max;
            if (count < maxQueueLength) {
                db.createQueueEntry(count, musicId, cookie, waterfallCallback);
            } else {
                waterfallCallback(null, "The Play queue is full. Try again soon");
            }
        }
    ], function(err, message){
        callback(err, message);
    });
}

controller.getQueue = function(callback) {
    var query = db.Queue.find()
        .populate('music')
        .sort({'ordinal': 1})
        .lean();
    query.exec(function(err, hits){
        if (hits == null) {
            hits = [];
        }
        callback(err, hits);
    });
};