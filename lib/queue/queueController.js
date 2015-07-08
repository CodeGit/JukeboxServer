"use strict";

/**
 * Created by maq on 07/07/2015.
 */

var config = require("lib/config");
var db = require("lib/database");
var async = require("async");

var controller = {};
module.exports = controller;

controller.addMusicToQueue = function(musicId, title, user, callback) {
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
                var queueEntry = new db.Queue();
                queueEntry.ordinal = count;
                queueEntry.music = musicId;
                queueEntry.user = user;
                queueEntry.save(function(err){
                    waterfallCallback(err, title + " is at number " + (count+1) + " in the queue");
                });

            } else {
                waterfallCallback(null, "The Play queue is full. Try again soon");
            }
        }
    ], function(err, message){
        callback(err, message);
    });
}