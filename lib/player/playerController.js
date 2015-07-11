/**
 * Created by maq on 11/07/2015.
 */

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
