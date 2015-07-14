"use strict";

/**
 * Created by maq on 14/07/2015.
 */

var db = require("lib/database");
var config = require("lib/config");

var token = {};
module.exports = token;

token.start = function(interval, callback) {
    console.log("Starting token fairy")
    if (interval == null) {
        interval = config.settings.tokens.incrementInterval * 1000;
    }
    setInterval( function() {
        token.sprinkleTokens();
    }, interval);
    callback();
}

token.sprinkleTokens = function(amount, maxTokens) {
    if (amount == null) {
        amount = config.settings.tokens.increment;
    }
    if (maxTokens == null) {
        maxTokens = config.settings.tokens.max;
    }
    db.Session.find().select({session:1}).exec(function(err, sessions){
        console.log("Adding tokens to " + sessions.length + " sessions");
        for(var i = 0; i < sessions.length; i++) {
            var session = sessions[i];
            var cookie = JSON.parse(session.session);
            if (cookie.tokens < maxTokens) {
                cookie.tokens += 1;
                console.log(cookie.tokens);
                session.session = JSON.stringify(cookie);
                session.save();
            }
        }
    });
}